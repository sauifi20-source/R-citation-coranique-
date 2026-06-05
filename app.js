'use strict';

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  reciter: null,
  surah: null,
  verses: new Set(),
  audioUrl: null,
  videoUrl: null,
  font: 'Scheherazade New',
  format: '9:16',
  quality: '1080p',
  synced: false,
  playing: false,
};

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSurahs(SURAHS);
  renderReciters(RECITERS);
  buildStepPills();
  markStep(1);

  document.getElementById('surSearch').addEventListener('input', () => {
    const q = document.getElementById('surSearch').value.toLowerCase();
    renderSurahs(SURAHS.filter(s => s.fr.toLowerCase().includes(q) || s.ar.includes(q) || String(s.n).includes(q)));
  });
  document.getElementById('recSearch').addEventListener('input', () => {
    const q = document.getElementById('recSearch').value.toLowerCase();
    renderReciters(RECITERS.filter(r => r.fr.toLowerCase().includes(q) || r.ar.includes(q)));
  });

  document.getElementById('audioFile').addEventListener('change', e => handleAudio(e.target.files[0]));
  document.getElementById('videoFile').addEventListener('change', e => handleVideo(e.target.files[0]));

  setupDrop('audioZone', 'audioFile', handleAudio);
  setupDrop('videoZone', 'videoFile', handleVideo);

  // Keyboard trigger for import zones
  document.getElementById('audioZone').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('audioFile').click(); });
  document.getElementById('videoZone').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('videoFile').click(); });
});

// ── Step pills ─────────────────────────────────────────────────────────────
const STEPS = ['Sourate','Récitateur','Audio','Vidéo','Versets','Sync','Format','Aperçu','Export'];

function buildStepPills() {
  const wrap = document.getElementById('headerSteps');
  STEPS.forEach((label, i) => {
    const pill = document.createElement('span');
    pill.className = 'step-pill';
    pill.id = `s${i + 1}`;
    pill.textContent = `${i + 1}. ${label}`;
    wrap.appendChild(pill);
    if (i < STEPS.length - 1) {
      const arr = document.createElement('span');
      arr.style.cssText = 'color:var(--text3);font-size:10px;padding:0 1px';
      arr.textContent = '›';
      wrap.appendChild(arr);
    }
  });
}

function markStep(n) {
  for (let i = 1; i <= 9; i++) {
    const el = document.getElementById(`s${i}`);
    if (!el) continue;
    el.className = 'step-pill' + (i < n ? ' done' : i === n ? ' active' : '');
  }
}

// ── Render lists ───────────────────────────────────────────────────────────
function renderSurahs(list) {
  const wrap = document.getElementById('surList');
  wrap.innerHTML = '';
  list.forEach(s => {
    const d = document.createElement('div');
    d.className = 'list-item';
    d.setAttribute('role', 'option');
    d.setAttribute('tabindex', '0');
    d.innerHTML = `
      <div class="item-row">
        <span class="item-ar">${s.ar}</span>
        <span class="item-meta">${s.v}v</span>
      </div>
      <span class="item-fr">S${s.n} · ${s.fr}</span>`;
    d.addEventListener('click', () => onSurahSelect(s, d));
    d.addEventListener('keydown', e => { if (e.key === 'Enter') onSurahSelect(s, d); });
    if (state.surah && state.surah.n === s.n) d.classList.add('active');
    wrap.appendChild(d);
  });
}

function renderReciters(list) {
  const wrap = document.getElementById('recList');
  wrap.innerHTML = '';
  list.forEach(r => {
    const d = document.createElement('div');
    d.className = 'list-item';
    d.setAttribute('role', 'option');
    d.setAttribute('tabindex', '0');
    d.innerHTML = `<span class="item-ar">${r.ar}</span><span class="item-fr">${r.fr}</span>`;
    d.addEventListener('click', () => onReciterSelect(r, d));
    d.addEventListener('keydown', e => { if (e.key === 'Enter') onReciterSelect(r, d); });
    if (state.reciter && state.reciter.fr === r.fr) d.classList.add('active');
    wrap.appendChild(d);
  });
}

// ── Selections ─────────────────────────────────────────────────────────────
function onSurahSelect(s, el) {
  state.surah = s;
  document.querySelectorAll('#surList .list-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  markStep(1);
  buildVerseSection(s);
}

function onReciterSelect(r, el) {
  state.reciter = r;
  document.querySelectorAll('#recList .list-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  markStep(2);
}

// ── Verses ─────────────────────────────────────────────────────────────────
function buildVerseSection(s) {
  document.getElementById('verseSection').style.display = 'block';
  document.getElementById('surateNameDisplay').textContent = `${s.ar} — ${s.fr}`;
  state.verses.clear();

  const texts = VERSE_TEXTS[s.n] || Array.from({ length: s.v }, (_, i) => `الآية ${i + 1} من سورة ${s.ar}`);
  const grid = document.getElementById('verseGrid');
  grid.innerHTML = '';

  texts.forEach((text, i) => {
    const v = i + 1;
    const d = document.createElement('div');
    d.className = 'verse-item';
    d.id = `verse-${v}`;
    d.setAttribute('tabindex', '0');
    d.innerHTML = `
      <span class="verse-num">${v}</span>
      <span class="verse-ar" style="font-family:'${state.font}',serif">${text}</span>
      <span class="verse-timing" id="vt-${v}">--:--</span>`;
    d.addEventListener('click', () => toggleVerse(v, d));
    d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggleVerse(v, d); });
    grid.appendChild(d);
  });
  updateVerseCount();
}

function toggleVerse(v, el) {
  if (state.verses.has(v)) { state.verses.delete(v); el.classList.remove('checked'); }
  else { state.verses.add(v); el.classList.add('checked'); }
  updateVerseCount();
}

function selectAll() {
  document.querySelectorAll('.verse-item').forEach(el => {
    const v = parseInt(el.id.split('-')[1]);
    state.verses.add(v);
    el.classList.add('checked');
  });
  updateVerseCount();
  markStep(5);
}

function deselectAll() {
  state.verses.clear();
  document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('checked'));
  updateVerseCount();
}

function updateVerseCount() {
  document.getElementById('verseCount').textContent = `${state.verses.size} sélectionné(s)`;
  if (state.verses.size > 0) markStep(5);
}

// ── File imports ───────────────────────────────────────────────────────────
function handleAudio(file) {
  if (!file) return;
  if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
  state.audioUrl = URL.createObjectURL(file);

  const zone = document.getElementById('audioZone');
  zone.classList.add('has-file');
  zone.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span class="file-name">${file.name}</span>`;

  const player = document.getElementById('audioPlayer');
  player.innerHTML = `<audio controls src="${state.audioUrl}" aria-label="Aperçu audio"></audio>`;
  markStep(3);
}

function handleVideo(file) {
  if (!file) return;
  if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
  state.videoUrl = URL.createObjectURL(file);

  const zone = document.getElementById('videoZone');
  zone.classList.add('has-file');
  zone.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span class="file-name">${file.name}</span>`;

  document.getElementById('videoPreviewWrap').innerHTML =
    `<video src="${state.videoUrl}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;margin-top:6px" muted autoplay loop playsinline aria-label="Aperçu vidéo"></video>`;

  markStep(4);
  updatePreview();
}

function setupDrop(zoneId, inputId, handler) {
  const zone = document.getElementById(zoneId);
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--accent)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file) handler(file);
  });
  zone.addEventListener('click', () => document.getElementById(inputId).click());
}

// ── Sync ───────────────────────────────────────────────────────────────────
function syncAuto() {
  if (!state.audioUrl) { alert('Importez un fichier audio d\'abord.'); return; }
  const btn = document.getElementById('syncBtn');
  btn.disabled = true;
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Analyse en cours…`;

  setTimeout(() => {
    state.synced = true;
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Synchronisé`;

    document.getElementById('syncStatus').innerHTML =
      `<span class="synced-dot"></span><span>Synchronisation réussie</span>`;

    buildTimeline(Math.max(state.verses.size, 3));
    markStep(6);
  }, 2200);
}

function buildTimeline(count) {
  const track = document.getElementById('timelineTrack');
  track.innerHTML = '';
  const colors = ['#c9a84c','#4f8ef7','#3ecf8e','#e07b54','#a78bfa','#f472b6'];
  const segW = 100 / count;

  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    b.className = 'timeline-block';
    b.style.cssText = `left:${(i * segW).toFixed(2)}%;width:${(segW - 0.4).toFixed(2)}%;background:${colors[i % colors.length]}22;border:1px solid ${colors[i % colors.length]}88;color:${colors[i % colors.length]}`;
    b.textContent = `v${i + 1}`;
    b.title = `Verset ${i + 1} — cliquer pour ajuster`;
    track.appendChild(b);

    const vtEl = document.getElementById(`vt-${i + 1}`);
    if (vtEl) {
      const sec = Math.round(i * (60 / count));
      vtEl.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }
  }
  document.getElementById('timelineWrap').style.display = 'block';
}

// ── Font ───────────────────────────────────────────────────────────────────
function setFont(el) {
  document.querySelectorAll('.font-chip').forEach(e => { e.classList.remove('active'); e.setAttribute('aria-checked', 'false'); });
  el.classList.add('active');
  el.setAttribute('aria-checked', 'true');
  state.font = el.dataset.font;
  document.getElementById('fontPreview').style.fontFamily = `'${state.font}',serif`;
  document.getElementById('previewVerse').style.fontFamily = `'${state.font}',serif`;
  document.querySelectorAll('.verse-ar').forEach(v => v.style.fontFamily = `'${state.font}',serif`);
}

// ── Format ─────────────────────────────────────────────────────────────────
function setFormat(el, ratio) {
  document.querySelectorAll('.format-card').forEach(e => { e.classList.remove('active'); e.setAttribute('aria-checked', 'false'); });
  el.classList.add('active');
  el.setAttribute('aria-checked', 'true');
  state.format = ratio;

  const area = document.getElementById('previewArea');
  const map = { '9:16': '9/16', '16:9': '16/9', '1:1': '1/1' };
  area.style.aspectRatio = map[ratio];

  if (ratio === '16:9') { area.style.maxWidth = '320px'; area.style.maxHeight = '180px'; }
  else if (ratio === '1:1') { area.style.maxWidth = '260px'; area.style.maxHeight = '260px'; }
  else { area.style.maxWidth = '192px'; area.style.maxHeight = '340px'; }
  markStep(7);
}

// ── Preview ────────────────────────────────────────────────────────────────
function updatePreview() {
  if (!state.videoUrl) return;
  const vid = document.getElementById('previewVideo');
  const ph  = document.getElementById('previewPlaceholder');
  const ov  = document.getElementById('previewOverlay');
  vid.src = state.videoUrl;
  vid.style.display = 'block';
  if (ph) ph.style.display = 'none';
  ov.style.display = 'block';
  showPreviewVerse();
  markStep(8);
}

function showPreviewVerse() {
  const texts = state.surah ? VERSE_TEXTS[state.surah.n] : null;
  if (texts) {
    const v = Array.from(state.verses)[0] || 1;
    const el = document.getElementById('previewVerse');
    el.textContent = texts[v - 1] || texts[0];
    el.style.fontFamily = `'${state.font}',serif`;
  }
}

function togglePreview() {
  if (!state.videoUrl) { alert('Importez une vidéo de fond d\'abord.'); return; }
  const vid = document.getElementById('previewVideo');
  const btn = document.getElementById('playBtn');
  if (state.playing) {
    vid.pause();
    state.playing = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>Lecture`;
  } else {
    vid.play();
    state.playing = true;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause`;
  }
  updatePreview();
}

// ── Quality / Export ───────────────────────────────────────────────────────
function setQuality(el, q) {
  document.querySelectorAll('.quality-card').forEach(e => { e.classList.remove('active'); e.setAttribute('aria-checked', 'false'); });
  el.classList.add('active');
  el.setAttribute('aria-checked', 'true');
  state.quality = q;
  document.getElementById('exportBtn').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    Exporter la vidéo — ${q}`;
}

function exportVideo() {
  if (!state.audioUrl || !state.videoUrl) { alert('Importez l\'audio et la vidéo avant d\'exporter.'); return; }
  if (!state.synced) { alert('Synchronisez d\'abord l\'audio avec les versets.'); return; }

  const btn = document.getElementById('exportBtn');
  btn.disabled = true;
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Génération ${state.quality}…`;

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Vidéo prête — ${state.quality}`;
    markStep(9);
  }, 2500);
}

// CSS spin keyframe injected once
const style = document.createElement('style');
style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(style);
