// ===== Utility: Cleveland Time =====
function getClevelandDate() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
}

// ===== School Day Clock =====
const clockDisplay = document.getElementById("school-day");
const dateText = document.getElementById("dateText");
const scheduleOrder = ["A","F","D","B","G","E","C"];

const scheduleOverrides = {
  "2025-10-15": "PAUSE",
  "2025-10-16": "PAUSE",
  "2025-10-17": "PAUSE",
  "2025-11-05": "PAUSE"
};

const startDate = new Date("2025-10-09T00:00:00");

function calculateDayForDate(targetDate) {
  const dayMS = 1000 * 60 * 60 * 24;
  let current = new Date(startDate);
  let index = scheduleOrder.indexOf("G");

  while(current < targetDate){
    const yyyy_mm_dd = current.toISOString().slice(0,10);
    const dayOfWeek = current.getDay();

    if(dayOfWeek !== 0 && dayOfWeek !== 6){
      if(scheduleOverrides[yyyy_mm_dd] === "PAUSE") {
        // do not advance
      } else if(scheduleOverrides[yyyy_mm_dd]) {
        index = scheduleOrder.indexOf(scheduleOverrides[yyyy_mm_dd]);
      } else {
        index = (index + 1) % scheduleOrder.length;
      }
    }

    current = new Date(current.getTime() + dayMS);
  }

  const targetStr = targetDate.toISOString().slice(0,10);
  const override = scheduleOverrides[targetStr];
  if(override === "PAUSE") return "No Classes 🎉";
  if(override && override !== "PAUSE") return override + " Day";

  return scheduleOrder[index] + " Day";
}

function calculateDay() {
  const today = getClevelandDate();
  today.setHours(0,0,0,0);
  return calculateDayForDate(today);
}

function updateDayDisplay() {
  if(clockDisplay) clockDisplay.textContent = calculateDay();

  const now = getClevelandDate();
  if(dateText){
    dateText.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}

updateDayDisplay();
setInterval(() => {
  const now = getClevelandDate();
  if(now.getHours() === 0 && now.getMinutes() === 1) updateDayDisplay();
}, 60*1000);


// ===== Progress Bar =====
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const weekdaysLeftElem = document.getElementById("weekdays-left");
const totalDaysElem = document.getElementById("total-days");

const schoolStart = new Date("2025-08-20T00:00:00");
const schoolEnd = new Date("2026-05-21T00:00:00");

function countWeekdays(start, end) {
  let c = 0, cur = new Date(start);
  while(cur <= end){
    const d = cur.getDay();
    if(d !== 0 && d !== 6) c++;
    cur.setDate(cur.getDate() + 1);
  }
  return c;
}

function updateProgress() {
  const today = getClevelandDate();
  const totalWeekdays = countWeekdays(schoolStart, schoolEnd);
  const elapsedWeekdays = countWeekdays(schoolStart, today);
  const remainingWeekdays = Math.max(totalWeekdays - elapsedWeekdays, 0);
  const percent = Math.min((elapsedWeekdays / totalWeekdays) * 100, 100);

  progressBar.style.width = percent + "%";
  progressText.textContent = Math.round(percent) + "%";
  weekdaysLeftElem.textContent = remainingWeekdays;
  totalDaysElem.textContent = Math.ceil((schoolEnd - today)/86400000);
}

updateProgress();
setInterval(updateProgress, 3600000);


// ===== Week View =====
function updateWeekView(){
  const weekSection = document.getElementById("week-section");
  if(!weekSection) return;

  const today = getClevelandDate();
  let monday = new Date(today);

  // Prefire logic for weekends
  if(today.getDay() === 6) monday.setDate(today.getDate() + 2); // Sat → Mon
  if(today.getDay() === 0) monday.setDate(today.getDate() + 1); // Sun → Mon

  // Normal week calculation for Mon-Fri
  if(today.getDay() !== 0 && today.getDay() !== 6){
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  }
  monday.setHours(0,0,0,0);

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const cards = weekSection.querySelectorAll(".week-day");

  weekdays.forEach((day,i)=>{
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const letterDay = calculateDayForDate(date);
    const card = cards[i];
    if(card){
      let textEl = card.querySelector(".day-type");
      if(!textEl){
        const oldP = card.querySelector("p");
        if(oldP) oldP.remove();
        textEl = document.createElement("p");
        textEl.classList.add("day-type");
        card.appendChild(textEl);
      }
      textEl.textContent = letterDay;
    }
  });
}

updateWeekView();
setInterval(updateWeekView, 60*60*1000); // refresh hourly


// ===== Subtle Blue-Gold Particles =====
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
const particleCount = 60;

function resizeCanvas(){ canvas.width=innerWidth; canvas.height=innerHeight; }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x,y){
    this.x = x??Math.random()*canvas.width;
    this.y = y??Math.random()*canvas.height;
    this.size = Math.random()*1.5+0.5;
    this.vx = (Math.random()-0.5)*0.2;
    this.vy = (Math.random()-0.5)*0.2;
    const hue = Math.random()<0.5?210:48;
    const sat = 80+Math.random()*10;
    const light = 60+Math.random()*10;
    this.color=`hsl(${hue},${sat}%,${light}%)`;
  }
  update(){
    this.x+=this.vx;
    this.y+=this.vy;
    if(this.x<0)this.x=canvas.width;
    if(this.x>canvas.width)this.x=0;
    if(this.y<0)this.y=canvas.height;
    if(this.y>canvas.height)this.y=0;
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fillStyle=this.color;
    ctx.globalAlpha=0.2;
    ctx.fill();
    ctx.globalAlpha=1;
  }
}

for(let i=0;i<particleCount;i++)particles.push(new Particle());
function animateParticles(){ 
  ctx.clearRect(0,0,canvas.width,canvas.height); 
  particles.forEach(p=>{p.update();p.draw();}); 
  requestAnimationFrame(animateParticles);
}
animateParticles();
