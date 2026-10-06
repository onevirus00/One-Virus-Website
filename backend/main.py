import os, hashlib, secrets, socket, re
from urllib.parse import urlparse
from datetime import datetime, timezone
import asyncio

import httpx
import dns.resolver
from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="One Virus API", version="1.0.0")

origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "*").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}
activity = []

def log_activity(action, username="system"):
    activity.insert(0, {
        "time": datetime.now(timezone.utc).isoformat(),
        "user": username,
        "action": action
    })
    del activity[100:]

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310000)
    return salt.hex() + ":" + dk.hex()

# Fixed demo accounts. Passwords should be replaced before production.
USERS = {
    "admin": {"role": "admin", "password_hash": os.getenv("ADMIN_PASSWORD_HASH", "")},
    "user": {"role": "user", "password_hash": os.getenv("USER_PASSWORD_HASH", "")},
}

def verify_password(password, stored):
    if not stored or ":" not in stored:
        return False
    salt, expected = stored.split(":", 1)
    got = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 310000).hex()
    return secrets.compare_digest(got, expected)

def current_user(request: Request):
    sid = request.cookies.get("ov_session")
    return sessions.get(sid)

class LoginBody(BaseModel):
    username: str
    password: str

class TargetBody(BaseModel):
    target: str

class HashBody(BaseModel):
    value: str

class LogsBody(BaseModel):
    text: str

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "one-virus-api"}

@app.post("/api/login")
def login(body: LoginBody, response: Response):
    u = USERS.get(body.username)
    if not u or not verify_password(body.password, u["password_hash"]):
        raise HTTPException(401, "Invalid username or password")
    sid = secrets.token_urlsafe(32)
    sessions[sid] = {"username": body.username, "role": u["role"]}
    response.set_cookie("ov_session", sid, httponly=True, samesite="lax", secure=False, max_age=86400)
    log_activity("Login", body.username)
    return {"username": body.username, "role": u["role"]}

@app.post("/api/logout")
def logout(request: Request, response: Response):
    sid = request.cookies.get("ov_session")
    user = sessions.pop(sid, None)
    if user:
        log_activity("Logout", user["username"])
    response.delete_cookie("ov_session")
    return {"ok": True}

@app.get("/api/me")
def me(request: Request):
    user = current_user(request)
    if not user:
        return {"authenticated": False}
    return {"authenticated": True, **user}

@app.get("/api/activity")
def get_activity(request: Request):
    user = current_user(request)
    if not user:
        raise HTTPException(401, "Login required")
    return {"items": activity[:50]}

def normalize_target(target):
    target = target.strip()
    if "://" in target:
        target = urlparse(target).hostname or ""
    target = target.strip("/")
    return target

@app.post("/api/network/ip")
async def network_ip(body: TargetBody, request: Request):
    user = current_user(request)
    if not user: raise HTTPException(401, "Login required")
    target = normalize_target(body.target)
    try:
        infos = await asyncio.to_thread(socket.getaddrinfo, target, None)
        ips = sorted({x[4][0] for x in infos})
        log_activity(f"IP lookup: {target}", user["username"])
        return {"target": target, "ips": ips}
    except Exception as e:
        raise HTTPException(400, f"Could not resolve target: {e}")

@app.post("/api/network/dns")
async def network_dns(body: TargetBody, request: Request):
    user = current_user(request)
    if not user: raise HTTPException(401, "Login required")
    target = normalize_target(body.target)
    result = {}
    for typ in ["A", "AAAA", "MX", "NS", "TXT"]:
        try:
            answers = await asyncio.to_thread(dns.resolver.resolve, target, typ)
            result[typ] = [r.to_text() for r in answers]
        except Exception:
            result[typ] = []
    log_activity(f"DNS lookup: {target}", user["username"])
    return {"target": target, "records": result}

@app.post("/api/network/headers")
async def headers(body: TargetBody, request: Request):
    user = current_user(request)
    if not user: raise HTTPException(401, "Login required")
    target = body.target.strip()
    if not target.startswith(("http://", "https://")):
        target = "https://" + target
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
            r = await client.get(target)
        wanted = [
            "strict-transport-security", "content-security-policy",
            "x-frame-options", "x-content-type-options",
            "referrer-policy", "permissions-policy"
        ]
        present = {k: r.headers.get(k) for k in wanted if r.headers.get(k)}
        missing = [k for k in wanted if k not in r.headers]
        log_activity(f"Headers check: {target}", user["username"])
        return {"url": str(r.url), "status_code": r.status_code,
                "present": present, "missing": missing}
    except Exception as e:
        raise HTTPException(400, f"Request failed: {e}")

@app.post("/api/defense/hash")
def analyze_hash(body: HashBody, request: Request):
    user = current_user(request)
    if not user: raise HTTPException(401, "Login required")
    v = body.value.strip()
    n = len(v)
    types = {32:"MD5 / MD5-like",40:"SHA-1 / SHA-1-like",64:"SHA-256 / SHA-256-like",96:"SHA-384 / SHA-384-like",128:"SHA-512 / SHA-512-like"}
    fmt = types.get(n, "Unknown")
    hex_only = bool(re.fullmatch(r"[0-9a-fA-F]+", v))
    log_activity("Hash analysis", user["username"])
    return {"length": n, "hex": hex_only, "likely_format": fmt}

@app.post("/api/defense/logs")
def analyze_logs(body: LogsBody, request: Request):
    user = current_user(request)
    if not user: raise HTTPException(401, "Login required")
    lines = [x for x in body.text.splitlines() if x.strip()]
    ips = re.findall(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", body.text)
    errors = sum(1 for x in lines if re.search(r"\b(error|failed|failure|denied)\b", x, re.I))
    log_activity("Log analysis", user["username"])
    return {"lines": len(lines), "unique_ips": sorted(set(ips)), "error_like_lines": errors}
