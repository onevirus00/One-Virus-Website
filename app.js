const titleMap={dashboard:"Security Dashboard",network:"Network Intelligence",bugbounty:"Authorized Security Lab",defense:"Defensive Security",codelab:"Code Lab",learning:"Learning Paths",tools:"Security Toolkit"};
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
  document.getElementById("page-title").textContent=titleMap[id]||"One Virus";
  history.replaceState(null,"","#"+id);
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-section]").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.go)));
document.getElementById("themeBtn").addEventListener("click",()=>document.body.classList.toggle("soft"));
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active")}));
const initial=location.hash.slice(1); if(titleMap[initial]) showSection(initial);
