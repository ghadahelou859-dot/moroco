const gateVideo=document.getElementById("gateVideo");
const openGate=document.getElementById("openGate");
const continueCue=document.getElementById("continueCue");
const music=document.getElementById("music");
const musicToggle=document.getElementById("musicToggle");
const timeline=document.getElementById("timeline");
let attendance="yes";

openGate.addEventListener("click",async()=>{
  openGate.disabled=true;
  music.volume=.2;
  try{await music.play();musicToggle.classList.add("is-playing")}catch(_){}
  musicToggle.hidden=false;
  gateVideo.currentTime=0;
  try{await gateVideo.play()}catch(_){openGate.disabled=false}
},{once:true});

gateVideo.addEventListener("ended",()=>{
  continueCue.hidden=false;
  setTimeout(()=>timeline.scrollIntoView({behavior:"smooth"}),350);
});

musicToggle.addEventListener("click",async()=>{
  if(music.paused){
    music.volume=.2;
    try{await music.play();musicToggle.classList.add("is-playing");musicToggle.querySelector("span").textContent="♫"}catch(_){}
  }else{
    music.pause();
    musicToggle.classList.remove("is-playing");
    musicToggle.querySelector("span").textContent="♪";
  }
});

let targetProgress=0,displayedProgress=0;
function updateTimeline(){
  const rect=timeline.getBoundingClientRect();
  const start=innerHeight*.72;
  const distance=timeline.offsetHeight-innerHeight*.55;
  targetProgress=Math.max(0,Math.min(1,(start-rect.top)/distance));
}
function animateTimeline(){
  displayedProgress+=(targetProgress-displayedProgress)*.065;
  timeline.style.setProperty("--timeline-progress",String(displayedProgress));
  timeline.style.setProperty("--dot-y",displayedProgress*100+"%");
  requestAnimationFrame(animateTimeline);
}
addEventListener("scroll",updateTimeline,{passive:true});
updateTimeline();
animateTimeline();

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add("in-view"));
},{threshold:.22});
document.querySelectorAll(".motion-item").forEach(item=>observer.observe(item));

function openModal(id){
  document.getElementById(id).hidden=false;
  document.body.classList.add("modal-open");
}
function closeModal(id){
  document.getElementById(id).hidden=true;
  document.body.classList.remove("modal-open");
}
document.querySelectorAll("[data-close]").forEach(button=>{
  button.addEventListener("click",()=>closeModal(button.dataset.close));
});
document.querySelectorAll(".modal-overlay").forEach(overlay=>{
  overlay.addEventListener("click",event=>{if(event.target===overlay)closeModal(overlay.id)});
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape")document.querySelectorAll(".modal-overlay:not([hidden])").forEach(modal=>closeModal(modal.id));
});

document.getElementById("openRsvp").addEventListener("click",()=>openModal("rsvpModal"));
const yes=document.getElementById("attendYes");
const no=document.getElementById("attendNo");
yes.addEventListener("click",()=>{attendance="yes";yes.classList.add("selected");no.classList.remove("selected")});
no.addEventListener("click",()=>{attendance="no";no.classList.add("selected");yes.classList.remove("selected")});
document.getElementById("sendRsvp").addEventListener("click",()=>{
  const name=document.getElementById("guestName").value.trim()||"ضيف";
  const status=attendance==="yes"?"سأحضر بإذن الله":"أعتذر عن الحضور";
  const message=encodeURIComponent("تأكيد حضور دعوة عبد القادر وسلمى\nالاسم: "+name+"\nالحضور: "+status);
  window.open("https://wa.me/970598494977?text="+message,"_blank","noopener,noreferrer");
});

const canvas=document.getElementById("scratchCanvas");
const shell=canvas.parentElement;
let drawing=false,revealed=false;
function paintCover(){
  const rect=shell.getBoundingClientRect();
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(rect.width*dpr);
  canvas.height=Math.round(rect.height*dpr);
  const ctx=canvas.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const gradient=ctx.createLinearGradient(0,0,rect.width,rect.height);
  gradient.addColorStop(0,"#7f223c");
  gradient.addColorStop(.48,"#a5415d");
  gradient.addColorStop(1,"#6d1832");
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,rect.width,rect.height);
  ctx.strokeStyle="rgba(240,202,116,.6)";
  ctx.lineWidth=1;
  for(let x=-rect.height;x<rect.width+rect.height;x+=22){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+rect.height,rect.height);ctx.stroke();
  }
  ctx.fillStyle="#f6dfaa";
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font="700 "+Math.max(18,rect.width*.055)+"px Arial";
  ctx.fillText("اكشط لتكتشف المناسبة",rect.width/2,rect.height/2-8);
  ctx.font="400 "+Math.max(13,rect.width*.035)+"px Arial";
  ctx.fillText("حرّك إصبعك فوق اللوحة",rect.width/2,rect.height/2+28);
}
function scratch(event){
  if(!drawing||revealed)return;
  const rect=canvas.getBoundingClientRect();
  const dpr=canvas.width/rect.width;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  ctx.save();
  ctx.scale(dpr,dpr);
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();
  ctx.arc(event.clientX-rect.left,event.clientY-rect.top,Math.max(28,rect.width*.055),0,Math.PI*2);
  ctx.fill();
  ctx.restore();
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let transparent=0;
  for(let i=3;i<pixels.length;i+=64)if(pixels[i]<30)transparent++;
  if(transparent/(pixels.length/64)>.38){
    revealed=true;
    canvas.classList.add("scratch-cleared");
    setTimeout(()=>openModal("engagementModal"),420);
  }
}
canvas.addEventListener("pointerdown",event=>{drawing=true;canvas.setPointerCapture(event.pointerId);scratch(event)});
canvas.addEventListener("pointermove",scratch);
canvas.addEventListener("pointerup",()=>drawing=false);
canvas.addEventListener("pointercancel",()=>drawing=false);
paintCover();
addEventListener("resize",()=>{if(!revealed)paintCover()});
