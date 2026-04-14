const studentIdInput = document.getElementById('studentId');
const searchBtn = document.getElementById('searchBtn');
const loadingArea = document.getElementById('loadingArea');
const resultArea = document.getElementById('resultArea');
const errorArea = document.getElementById('errorArea');
const studentNameEl = document.getElementById('studentName');
const studentClassEl = document.getElementById('studentClass');
const scoresList = document.getElementById('scoresList');
const feedbackBadge = document.getElementById('feedbackBadge');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');

let studentDataset = [];
let currentAverage = 0;

async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error();
    const data = await res.json();
    studentDataset = data;
    return true;
  } catch {
    showError('Failed to find ID');
    return false;
  }
}

function showError(msg) {
  resultArea.style.display = 'none';
  loadingArea.style.display = 'none';
  const errMsg = document.querySelector('.error-message');
  if (errMsg) errMsg.innerHTML = `⚠️ ${msg}`;
  errorArea.style.display = 'block';
}

// ANIMASI ANGKA DIPERLAMBAT MENJADI 5 DETIK
function animateNumber(element, target, duration = 5000) {
  let start = 0;
  const stepTime = 16; // ~60fps
  const steps = duration / stepTime;
  const increment = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, stepTime);
}

function renderScoresWithCounting(records) {
  const subjectMap = new Map();
  records.forEach(rec => subjectMap.set(rec.pelajaran, rec.nilai));
  const subjects = Array.from(subjectMap.entries());
  scoresList.innerHTML = '';
  subjects.forEach(([subject, score], idx) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.style.animationDelay = `${idx * 0.15}s`; // staggered lebih lambat
    row.innerHTML = `<span class="subject">${escapeHtml(subject)}</span><span class="score-count">0</span>`;
    scoresList.appendChild(row);
    const scoreSpan = row.querySelector('.score-count');
    // Animasi angka 5 detik, dimulai sedikit setelah row muncul
    setTimeout(() => {
      animateNumber(scoreSpan, score, 5000);
    }, 200);
  });
}

function computeAverage(records) {
  let sum = 0;
  records.forEach(r => sum += r.nilai);
  return sum / records.length;
}

function setFeedback(avg) {
  const avgNum = parseFloat(avg);
  let msg = '', className = '';
  if (avgNum >= 90) { msg = 'Excellent work!'; className = 'excellent'; }
  else if (avgNum >= 80) { msg = 'Great job, keep it up!'; className = 'great'; }
  else { msg = 'Keep learning and improving!'; className = 'keep'; }
  feedbackBadge.textContent = msg;
  feedbackBadge.className = `feedback-badge ${className}`;
}

function updateProgressBar(percent) {
  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${Math.round(percent)}%`;
}

function resetProgressBar() {
  progressFill.style.width = '0%';
  progressPercent.textContent = '0%';
}

async function performSearch() {
  const rawId = studentIdInput.value.trim();
  if (!rawId) { showError('Masukkan ID siswa.'); return; }
  const idNum = Number(rawId);
  if (isNaN(idNum)) { showError('ID harus angka.'); return; }
  if (!studentDataset.length) {
    const ok = await loadData();
    if (!ok) return;
  }
  const filtered = studentDataset.filter(r => r.ID === idNum);
  if (filtered.length === 0) {
    showError('ID not found, please try again.');
    return;
  }
  const first = filtered[0];
  studentNameEl.textContent = first.nama;
  studentClassEl.textContent = first.kelas;
  const avg = computeAverage(filtered);
  currentAverage = avg;
  setFeedback(currentAverage);
  
  errorArea.style.display = 'none';
  resultArea.style.display = 'none';
  loadingArea.style.display = 'block';
  
  // Reset progress bar ke 0% sebelum loading
  resetProgressBar();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  loadingArea.style.display = 'none';
  renderScoresWithCounting(filtered);
  resultArea.style.display = 'block';
  
  // Animasi progress bar ke nilai rata-rata (5 detik)
  setTimeout(() => {
    updateProgressBar(currentAverage);
  }, 100);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}

searchBtn.addEventListener('click', performSearch);
studentIdInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

(async () => {
  await loadData();
  resultArea.style.display = 'none';
  errorArea.style.display = 'none';
  loadingArea.style.display = 'none';
  studentIdInput.value = '';
  resetProgressBar();
})();