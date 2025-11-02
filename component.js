// ===== Day Calculation & Display =====
const clockDisplay = document.getElementById("school-day");
const dateText = document.getElementById("dateText");
const scheduleOrder = ["A","F","D","B","G","E","C"];

// optional overrides: YYYY-MM-DD -> "PAUSE" or letter
const scheduleOverrides = {
  "2025-10-17": "PAUSE",
  "2025-10-16": "PAUSE",
  "2025-10-15": "PAUSE"
};

// starting reference for rotating sequence (keeps parity)
const startDate = new Date("2025-10-09T00:00:00");

function calculateDay(today = new Date()) {
  // normalize day
  today = new Date(today);
  today.setHours(0,0,0,0);

  const dayMS = 1000*60*60*24;
  let current = new Date(startDate);
  current.setHours(0,0,0,0);

  // start index so sequence is predictable
  let index = scheduleOrder.indexOf("G");

  while(current < today) {
    const yyyy_mm_dd = current.toISOString().slice(0,10);
    const dayOfWeek = current.getDay();
    if(dayOfWeek !== 0 && dayOfWeek !== 6) {
      if(scheduleOverrides[yyyy_mm_dd] === "PAUSE") {
        // skip advancement on paused day – keeps index same
      } else if(scheduleOverrides[yyyy_mm_dd]) {
        // forced letter on that day
        index = scheduleOrder.indexOf(scheduleOverrides[yyyy_mm_dd]);
      } else {
        index = (index + 1) % scheduleOrder.length;
      }
    }
    current = new Date(current.getTime() + dayMS);
  }

  const todayStr = today.toISOString().slice(0,10);
  const todayOverride = scheduleOverrides[todayStr];
  if(todayOverride === "PAUSE") return "No Classes 🎉";
  if(todayOverride && todayOverride !== "PAUSE") return todayOverride + " Day";
  return scheduleOrder[index] + " Day";
}

function updateDayDisplay() {
  if(!clockDisplay) return;
  clockDisplay.textContent = calculateDay();
  if(dateText) {
    const now = new Date();
    dateText.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }
}
updateDayDisplay();
setInterval(updateDayDisplay, 60*1000);

// ===== Progress Bar & Widgets =====
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const weekdaysLeftElem = document.getElementById("weekdays-left");
const totalDaysElem = document.getElementById("total-days");

// Start & end of school (edit these dates as needed)
const schoolStart = new Date("2025-08-20T00:00:00");
const schoolEnd = new Date("2026-05-21T00:00:00");

// Paused days (YYYY-MM-DD)
const pausedDays = ["2025-10-15", "2025-10-16", "2025-10-17"];

// Helper to count weekdays excluding paused days
function countWeekdays(start, end) {
  let count = 0;
  let current = new Date(start);
  current.setHours(0,0,0,0);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const yyyy_mm_dd = current.toISOString().slice(0,10);
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !pausedDays.includes(yyyy_mm_dd)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function updateProgress() {
  const today = new Date();
  today.setHours(0,0,0,0);

  // Calendar-based total days remaining
  const totalCalendarDays = Math.ceil((schoolEnd - today) / (1000 * 60 * 60 * 24));

  // Weekday counts
  const totalWeekdays = countWeekdays(schoolStart, schoolEnd);
  const elapsedWeekdays = countWeekdays(schoolStart, today);
  const remainingWeekdays = Math.max(totalWeekdays - elapsedWeekdays, 0);

  // Progress percent
  const percent = Math.min(Math.max((elapsedWeekdays / Math.max(totalWeekdays,1)) * 100, 0), 100);

  // Update UI
  if(progressBar) progressBar.style.width = percent + "%";
  if(progressText) progressText.textContent = Math.round(percent) + "%";
  if(weekdaysLeftElem) weekdaysLeftElem.textContent = remainingWeekdays;
  if(totalDaysElem) totalDaysElem.textContent = totalCalendarDays;
}
updateProgress();
setInterval(updateProgress, 60 * 60 * 1000);

// small helper to manually set progress if needed
function updateProgressBar(percent) {
  const bar = document.getElementById('progress-bar');
  if(bar) bar.style.width = percent + '%';
  const pt = document.getElementById('progress-text');
  if(pt) pt.textContent = `${percent}%`;
}

// ===== Particle Field (autonomous, no mouse) =====
const canvas = document.getElementById("bgCanvas");
const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
let particles = [];
const particleCount = 80;

function resizeCanvas() {
  if(!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x,y,idx){
    this.x = x !== undefined ? x : Math.random()*canvas.width;
    this.y = y !== undefined ? y : Math.random()*canvas.height;
    this.size = Math.random()*2.5 + 0.6;
    const speed = Math.random()*0.6 + 0.2;
    const angle = Math.random()*Math.PI*2;
    this.vx = Math.cos(angle)*speed;
    this.vy = Math.sin(angle)*speed;
    const alpha = Math.random()*0.5 + 0.15;
    const hue = 260 + Math.random()*40; // purple-blue range
    this.color = `rgba(${Math.floor(139)},${Math.floor(92)},${Math.floor(246)},${alpha})`;
    this.idx = idx || 0;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    // wrap around edges
    if(this.x < -20) this.x = canvas.width + 20;
    if(this.x > canvas.width + 20) this.x = -20;
    if(this.y < -20) this.y = canvas.height + 20;
    if(this.y > canvas.height + 20) this.y = -20;
    // gentle drift tweak
    this.vx += (Math.random()-0.5)*0.02;
    this.vy += (Math.random()-0.5)*0.02;
    this.vx = Math.max(Math.min(this.vx, 1.2), -1.2);
    this.vy = Math.max(Math.min(this.vy, 1.2), -1.2);
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for(let i=0;i<particleCount;i++){
    particles.push(new Particle(Math.random()*canvas.width, Math.random()*canvas.height, i));
  }
}
if(ctx) {
  initParticles();
  function animateParticles() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ===== Background gradient update (keeps dynamic time-of-day look) =====
function updateBackgroundByTime() {
  const now = new Date();
  const hour = now.getHours();
  let gradient;
  if (hour >= 5 && hour < 10) gradient = "linear-gradient(135deg, #fbc2eb, #a6c1ee)";
  else if (hour >= 10 && hour < 17) gradient = "linear-gradient(135deg, #89f7fe, #66a6ff)";
  else if (hour >= 17 && hour < 20) gradient = "linear-gradient(135deg, #f6d365, #fda085)";
  else gradient = "linear-gradient(135deg, #0b0f25, #1b1f3e, #3b3f7a, #4f46e5)";
  document.body.style.transition = "background 2s ease";
  document.body.style.background = gradient;
  document.body.style.backgroundSize = "300% 300%";
}
updateBackgroundByTime();
setInterval(updateBackgroundByTime, 15 * 60 * 1000);
