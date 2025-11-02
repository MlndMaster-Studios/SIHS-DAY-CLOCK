// ===== Day Display =====
const clockDisplay = document.getElementById("school-day");
const dateText = document.getElementById("dateText");
const scheduleOrder = ["A","F","D","B","G","E","C"];
const scheduleOverrides = {};
const startDate = new Date("2025-10-09T00:00:00");

function calculateDay(today = new Date()) {
  today.setHours(0,0,0,0);
  const dayMS = 86400000;
  let current = new Date(startDate);
  let index = scheduleOrder.indexOf("G");
  while(current < today) {
    const dow = current.getDay();
    if(dow !== 0 && dow !== 6) index = (index + 1) % scheduleOrder.length;
    current = new Date(current.getTime() + dayMS);
  }
  return scheduleOrder[index] + " Day";
}
function updateDayDisplay() {
  clockDisplay.textContent = calculateDay();
  const now = new Date();
  dateText.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}
updateDayDisplay();
setInterval(updateDayDisplay, 60000);

// ===== Progress Bar =====
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const weekdaysLeftElem = document.getElementById("weekdays-left");
const totalDaysElem = document.getElementById("total-days");

const schoolStart = new Date("2025-08-20T00:00:00");
const schoolEnd = new Date("2026-05-21T00:00:00");

function countWeekdays(start, end) {
  let c = 0, cur = new Date(start);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) c++;
    cur.setDate(cur.getDate() + 1);
  }
  return c;
}
function updateProgress() {
  const today = new Date();
  const totalWeekdays = countWeekdays(schoolStart, schoolEnd);
  const elapsedWeekdays = countWeekdays(schoolStart, today);
  const remainingWeekdays = Math.max(totalWeekdays - elapsedWeekdays, 0);
  const percent = Math.min((elapsedWeekdays / totalWeekdays) * 100, 100);
  progressBar.style.width = percent + "%";
  progressText.textContent = Math.round(percent) + "%";
  weekdaysLeftElem.textContent = remainingWeekdays;
  totalDaysElem.textContent = Math.ceil((schoolEnd - today) / 86400000);
}
updateProgress();
setInterval(updateProgress, 3600000);

// ===== Blue-Gold Particle Background =====
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
const particleCount = 80;
function resizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? Math.random() * canvas.height;
    this.size = Math.random() * 2.2 + 0.8;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    // alternate between blue and gold tones
    const hue = Math.random() < 0.5 ? 210 : 48;
    const sat = 85 + Math.random()*10;
    const light = 55 + Math.random()*20;
    this.color = `hsl(${hue}, ${sat}%, ${light}%)`;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10) this.x = canvas.width + 10;
    if (this.x > canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = canvas.height + 10;
    if (this.y > canvas.height + 10) this.y = -10;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
for(let i=0;i<particleCount;i++) particles.push(new Particle());
function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();
