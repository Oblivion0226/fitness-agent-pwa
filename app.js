const DB_NAME = 'fitness-agent-local';
const STORE = 'state';
const API_KEY_STORAGE = 'fitness-agent-api-key';
const MODEL_STORAGE = 'fitness-agent-model';

const $ = (selector) => document.querySelector(selector);
let state = {
  profile: {},
  sessions: [],
  messages: [],
  plan: null,
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadState() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get('app');
    request.onsuccess = () => resolve(request.result || state);
    request.onerror = () => resolve(state);
  });
}

async function saveState() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(state, 'app');
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

function escapeAttribute(value = '') {
  return escapeHTML(value);
}

function markdown(value = '') {
  return escapeHTML(value)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function todayLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'short'
  }).format(new Date());
}

function sourceLabel(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return '参考来源'; }
}

function muscleMap(exercise, compact = false) {
  return `<img class="anatomy-image ${compact ? 'mini-map' : ''}" src="./assets/exercises/${escapeAttribute(exercise.id)}.png" alt="${escapeAttribute(exercise.name)}：动作姿态与肌群插画" width="1536" height="1024" loading="${compact ? 'lazy' : 'eager'}">`;
}

function catalogForModel() {
  return VERIFIED_EXERCISES.map(({ id, name, primary, secondary, level }) => ({
    id, name, primary, secondary, level
  }));
}

function context() {
  return {
    profile: state.profile,
    recentSessions: state.sessions.slice(-12),
    currentPlan: state.plan,
    today: new Date().toISOString().slice(0, 10),
  };
}

function localPlan() {
  const name = state.profile.name || '你';
  return {
    generatedAt: new Date().toISOString(),
    note: `${name}，这是离线保守起步版。等你记录真实重量、次数和恢复后，再让教练调整。`,
    items: [
      {
        day: '本周第 1 次', title: '全身基础 A', detail: '下肢、推、拉各做一点；全程留 3—4 次余力。',
        exercises: [
          { id: 'goblet-squat', sets: '2', reps: '6–10', rpe: 'RPE 6–7', rest: '90 秒', note: '先用能稳定控制的轻重量。' },
          { id: 'dumbbell-chest-press', sets: '2', reps: '8–10', rpe: 'RPE 6–7', rest: '90 秒', note: '肩前侧不舒服就停止。' },
          { id: 'lat-pulldown', sets: '2', reps: '8–10', rpe: 'RPE 6–7', rest: '90 秒', note: '下放也要控制。' },
        ]
      },
      {
        day: '本周第 2 次', title: '全身基础 B', detail: '以髋主导和水平拉为主；不要为了重量牺牲动作。',
        exercises: [
          { id: 'romanian-deadlift', sets: '2', reps: '6–8', rpe: 'RPE 6', rest: '2 分钟', note: '先用空杠或轻哑铃校准。' },
          { id: 'seated-row', sets: '2', reps: '8–10', rpe: 'RPE 6–7', rest: '90 秒', note: '身体保持稳定，不后仰借力。' },
          { id: 'goblet-squat', sets: '2', reps: '8', rpe: 'RPE 6', rest: '90 秒', note: '作为动作复习，不追重量。' },
        ]
      }
    ]
  };
}

function parsePlan(raw) {
  try {
    const matched = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(matched ? matched[0] : raw);
    const items = Array.isArray(parsed.items) ? parsed.items.map((item) => {
      const exercises = Array.isArray(item.exercises) ? item.exercises.map((exercise) => ({
        id: String(exercise.id || ''),
        sets: String(exercise.sets || ''),
        reps: String(exercise.reps || ''),
        rpe: String(exercise.rpe || ''),
        rest: String(exercise.rest || ''),
        note: String(exercise.note || ''),
      })).filter((exercise) => EXERCISE_BY_ID[exercise.id]) : [];
      return {
        day: String(item.day || '训练日'), title: String(item.title || '训练安排'),
        detail: String(item.detail || ''), exercises
      };
    }).filter((item) => item.exercises.length) : [];
    return items.length ? { generatedAt: new Date().toISOString(), note: String(parsed.note || ''), items } : null;
  } catch {
    return null;
  }
}

function renderPlan() {
  const root = $('#plan-output');
  if (!state.plan?.items?.length) {
    root.innerHTML = '<div class="empty"><strong>还没有计划</strong><p>先完成档案，再生成一份只使用已收录动作的计划。</p></div>';
    return;
  }
  root.innerHTML = `${state.plan.note ? `<p class="plan-note">${escapeHTML(state.plan.note)}</p>` : ''}${state.plan.items.map((item) => `
    <article class="plan-card">
      <div class="eyebrow">${escapeHTML(item.day)}</div>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.detail)}</p>
      <div class="exercise-list">${(item.exercises || []).map((line) => {
        const exercise = EXERCISE_BY_ID[line.id];
        if (!exercise) return '';
        return `<button class="exercise-row" type="button" data-exercise-id="${escapeAttribute(exercise.id)}">
          ${muscleMap(exercise, true)}
          <span><strong>${escapeHTML(exercise.name)}</strong><small>${escapeHTML(line.sets)} 组 × ${escapeHTML(line.reps)} · ${escapeHTML(line.rpe)} · ${escapeHTML(line.rest)}</small>${line.note ? `<em>${escapeHTML(line.note)}</em>` : ''}</span><b>教学 ›</b>
        </button>`;
      }).join('')}</div>
    </article>`).join('')}`;
}

function renderToday() {
  $('#hero-date').textContent = todayLabel();
  const name = state.profile.name || '训练者';
  const hour = new Date().getHours();
  $('#greeting').textContent = `${hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'}，${name}`;
  $('#summary').textContent = '专注当下，每一次训练都算数。';
  $('#avatar').textContent = name.slice(0, 1);
  const weekdays = ['周一','周二','周三','周四','周五','周六','周日'];
  const monday = new Date(); monday.setHours(0,0,0,0); monday.setDate(monday.getDate() - (monday.getDay()+6)%7);
  const daily = weekdays.map((day, i) => {
    const date = new Date(monday); date.setDate(date.getDate()+i);
    const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    return (state.plan?.items || []).find(item => String(item.day).includes(iso) || (!/\d{4}-\d{2}-\d{2}/.test(String(item.day)) && String(item.day).includes(day)));
  });
  const currentDay = (new Date().getDay()+6)%7;
  const session = daily[currentDay];
  $('#week-strip').innerHTML = weekdays.map((day,i) => `<button class="week-day ${i===currentDay?'current':''} ${daily[i]?'scheduled':''}" data-week-day="${i}"><span>${day}</span><strong>${escapeHTML(daily[i]?.title || '待安排')}</strong><i></i></button>`).join('');
  $('#today-action').dataset.go = state.profile.name || state.profile.equipment ? 'plan' : 'profile';
  $('#today-action').textContent = session ? '开始训练' : state.plan ? '查看本周计划' : '建立训练档案';
  if (session) {
    $('#today-title').textContent = session.title;
    $('#today-detail').textContent = session.detail || '打开计划，逐个查看动作教学。';
    $('#today-time').textContent = `${session.exercises?.length || 0} 个已收录动作`;
    $('#today-intensity').textContent = session.exercises?.[0]?.rpe || '按状态调整';
  } else {
    $('#today-title').textContent = state.plan ? '今天 · 待安排' : '开启你的训练';
    $('#today-detail').textContent = '教练需要你的目标、经验与可训练时间，才能安全排计划。';
    $('#today-time').textContent = state.plan ? '查看计划确认时间' : '先了解你的目标';
    $('#today-intensity').textContent = '先对齐情况';
  }
  const recent = state.sessions.filter((entry) => {
    const date = new Date(entry['session-date']);
    return !Number.isNaN(date) && Date.now() - date.getTime() <= 28 * 86400000;
  });
  const rpes = recent.map((entry) => Number(entry.rpe)).filter((value) => value > 0);
  $('#sessions-28').textContent = recent.filter((entry) => entry.completion === '完成').length;
  $('#avg-rpe').textContent = rpes.length ? (rpes.reduce((sum, value) => sum + value, 0) / rpes.length).toFixed(1) : '—';
  $('#latest-weight').textContent = state.profile.weight ? `${state.profile.weight} kg` : '—';
}

function renderLibrary() {
  const query = ($('#library-search')?.value || '').trim().toLowerCase();
  const exercises = VERIFIED_EXERCISES.filter(e => [e.name, e.short, e.level, ...e.primary, ...e.secondary].join(' ').toLowerCase().includes(query));
  $('#library-count').textContent = exercises.length + ' / ' + VERIFIED_EXERCISES.length + ' 个动作';
  $('#teaching-count').textContent = VERIFIED_EXERCISES.length + ' 张动作插图 · 握法与常见问题 ›';
  $('#library-list').innerHTML = exercises.map((exercise) => `<button class="library-card" type="button" data-exercise-id="${escapeAttribute(exercise.id)}">
    ${muscleMap(exercise, true)}
    <span><strong>${escapeHTML(exercise.name)}</strong><small>主要：${escapeHTML(exercise.primary.join('、'))}</small><em>${escapeHTML(exercise.level)}</em></span><b>查看教学 ›</b>
  </button>`).join('');
}

function renderProgress() {
  const recent = state.sessions.slice(-6).reverse();
  $('#progress-summary').textContent = state.sessions.length
    ? `已记录 ${state.sessions.length} 次训练。下一次调整会参考重量、次数、RPE 与恢复。`
    : '还没有训练记录。完成一次后，再让教练根据真实表现微调。';
  $('#history').innerHTML = recent.length ? recent.map((session) => `<article class="history-card"><strong>${escapeHTML(session['session-date'] || '未标日期')}</strong><span>${escapeHTML(session['session-note'] || session.completion || '已完成训练')}</span><small>${escapeHTML(session.completion || '未记录')} · RPE ${escapeHTML(session.rpe || '未记录')}</small></article>`).join('') : '<div class="empty">训练记录会保存在这台设备的浏览器中。</div>';
}

function renderProfile() {
  const profile = state.profile || {};
  for (const key of ['name', 'age', 'height', 'weight', 'goal', 'frequency', 'equipment', 'constraints', 'schedule']) {
    const element = $(`#${key}`);
    if (element) element.value = profile[key] || '';
  }
  const initial = (profile.name || '训').slice(0, 1);
  $('#profile-avatar').textContent = initial;
  $('#profile-name-display').textContent = profile.name ? `${profile.name}的训练档案` : '建立你的训练档案';
}

function renderChat() {
  const root = $('#chat');
  if (!state.messages.length) {
    root.innerHTML = '<article class="message coach"><strong>你的训练教练</strong><p>把今天的状态、训练反馈或临时安排告诉我。我会先判断是否适合练，再给具体调整。</p></article>';
    return;
  }
  root.innerHTML = state.messages.slice(-16).map((message) => `<article class="message ${message.role === 'user' ? 'user' : 'coach'}"><strong>${message.role === 'user' ? '你' : '训练教练'}</strong><p>${markdown(message.content)}</p></article>`).join('');
  root.scrollTop = root.scrollHeight;
}

function render() {
  renderToday();
  renderProfile();
  renderPlan();
  renderLibrary();
  renderProgress();
  renderChat();
}

function openExercise(id) {
  const exercise = EXERCISE_BY_ID[id];
  if (!exercise) return;
  $('#exercise-detail').innerHTML = `<div class="exercise-modal-head"><div><span class="eyebrow">${escapeHTML(exercise.level)} · 已收录教学</span><h2>${escapeHTML(exercise.name)}</h2><p>${escapeHTML(exercise.short)}</p><div class="chips"><span>主要：${escapeHTML(exercise.primary.join('、'))}</span><span>协同：${escapeHTML(exercise.secondary.join('、'))}</span></div></div></div>
    <figure class="anatomy-figure"><a href="./assets/exercises/${escapeAttribute(exercise.id)}.png" target="_blank" rel="noopener noreferrer" aria-label="打开原图放大查看">${muscleMap(exercise)}</a><figcaption>点击图片放大 · 单一阶段示意，并非完整动作演示</figcaption></figure>
    <p class="diagram-note">AI 辅助插画，未经过专业人士逐图认证。颜色仅辅助理解肌群位置，不是精确解剖或肌电图；不要照抄图中的头颈角度、握距与关节角度。动作细节以以下文字、原始教学来源和现场检查为准。</p>
    <section class="teaching-section"><h3>起始姿势与握法</h3><p>${escapeHTML(exercise.setup)}</p></section>
    <section class="teaching-section"><h3>怎么发力</h3><p>${escapeHTML(exercise.force)}</p></section>
    <section class="teaching-section"><h3>一个关键提示</h3><p>${escapeHTML(exercise.cue)}</p></section>
    <section class="teaching-section warning"><h3>常见问题</h3><p>${escapeHTML(exercise.avoid)}</p></section>
    <section class="teaching-section source"><h3>教学依据</h3><a href="${escapeAttribute(exercise.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(exercise.source)}（${escapeHTML(sourceLabel(exercise.url))}）↗</a><p>若出现锐痛、头晕、胸闷或异常气短，立即停止；新动作先用保守重量并请现场教练核对。</p></section>`;
  $('#exercise-dialog').showModal();
}

async function askAgent(message, isPlanRequest = false) {
  const key = $('#api-key').value.trim();
  const model = $('#model').value.trim() || 'deepseek-chat';
  if (!key) throw new Error('先在设置中填写你自己的 DeepSeek API Key。');
  const planInstruction = isPlanRequest ? `\n\n现在需要生成计划。只能从以下已收录动作库中选择动作，并且必须输出对应 id；不得输出库外动作或自创握法。只输出 JSON：{"note":"...","items":[{"day":"...","title":"...","detail":"...","exercises":[{"id":"动作库 id","sets":"固定组数","reps":"次数","rpe":"RPE/RIR","rest":"休息","note":"简短提示"}]}]}。已收录动作库：${JSON.stringify(catalogForModel())}` : '';
  const body = {
    model,
    temperature: 0.35,
    messages: [
      { role: 'system', content: `${AGENT_SYSTEM_PROMPT}\n\n当前用户本机上下文：${JSON.stringify(context())}${planInstruction}` },
      ...state.messages.slice(0, state.messages.at(-1)?.role === 'user' && state.messages.at(-1)?.content === message ? -1 : undefined).slice(-16).filter(m => ['user', 'assistant'].includes(m.role)).map(m => ({role: m.role, content: String(m.content).slice(0, 6000)})),
      { role: 'user', content: message },
    ],
  };
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`DeepSeek 请求失败（${response.status}）。请检查 Key、余额和网络。`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '没有收到有效回复。';
}

function setBusy(button, busy, text = '生成中…') {
  button.disabled = busy;
  button.dataset.label ||= button.textContent;
  button.textContent = busy ? text : button.dataset.label;
}

function switchTab(tab) {
  $('.hero-card').classList.toggle('is-hidden', tab !== 'today');
  document.querySelectorAll('.panel').forEach((element) => element.classList.toggle('active', element.id === tab));
  document.querySelectorAll('.tab').forEach((element) => element.classList.toggle('active', element.dataset.tab === (tab === 'coach' ? 'today' : tab === 'library' ? 'plan' : tab)));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindEvents() {
  $('#library-search').addEventListener('input', renderLibrary);
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.go)));
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-week-day]')) switchTab('plan');
    const action = event.target.closest('[data-exercise-id]');
    if (action) openExercise(action.dataset.exerciseId);
  });
  $('#close-exercise').addEventListener('click', () => $('#exercise-dialog').close());
  $('#exercise-dialog').addEventListener('click', (event) => { if (event.target === $('#exercise-dialog')) $('#exercise-dialog').close(); });

  $('#profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    state.profile = Object.fromEntries(new FormData(event.currentTarget).entries());
    await saveState(); render(); switchTab('coach');
    $('#message').value = '我刚更新了档案。请先确认还缺哪一项关键情况，再决定是否需要调整训练。';
  });
  $('#session-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const entry = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.sessions.push(entry); await saveState(); event.currentTarget.reset(); render();
  });
  $('#generate-plan').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    if (!state.profile.goal || !state.profile.frequency || !state.profile.schedule || !state.profile.equipment) {
      switchTab('profile'); alert('先补齐目标、每周可练、稳定训练窗口和器械条件。'); return;
    }
    setBusy(button, true);
    try {
      const reply = await askAgent('请基于我的档案和训练记录制定下一周可执行计划。先判断是否信息足够；若足够，按规定 JSON 输出。', true);
      const plan = parsePlan(reply);
      if (plan) state.plan = plan;
      else {
        state.messages.push({ role: 'assistant', content: reply });
        switchTab('coach');
      }
      await saveState(); render();
    } catch (error) { alert(error.message); }
    finally { setBusy(button, false); }
  });
  $('#send').addEventListener('click', async () => {
    const input = $('#message'); const text = input.value.trim(); if (!text) return;
    state.messages.push({ role: 'user', content: text }); input.value = ''; render();
    const button = $('#send'); setBusy(button, true, '思考中…');
    try {
      const reply = await askAgent(text);
      state.messages.push({ role: 'assistant', content: reply });
    } catch (error) { state.messages.push({ role: 'assistant', content: `我暂时无法连接模型：${error.message}` }); }
    await saveState(); render(); setBusy(button, false);
  });
  $('#message').addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); $('#send').click(); } });
  document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => { switchTab('coach'); $('#message').value = button.dataset.prompt; $('#message').focus(); }));

  $('#save-settings').addEventListener('click', () => {
    const remember = $('#remember-key').checked;
    if (remember) { localStorage.setItem(API_KEY_STORAGE, $('#api-key').value); localStorage.setItem(MODEL_STORAGE, $('#model').value); }
    else { localStorage.removeItem(API_KEY_STORAGE); localStorage.removeItem(MODEL_STORAGE); }
    $('#api-status').textContent = remember ? '已保存在本设备浏览器中。' : '本次会话可用，关闭浏览器后清除。';
  });
  $('#remove-api-key').addEventListener('click', () => { localStorage.removeItem(API_KEY_STORAGE); localStorage.removeItem(MODEL_STORAGE); $('#api-key').value = ''; $('#remember-key').checked = false; $('#api-status').textContent = '已从本设备移除。'; });
  $('#export-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `fitness-agent-backup-${Date.now()}.json`; link.click(); URL.revokeObjectURL(link.href);
  });
  $('#import-data').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { const imported = JSON.parse(await file.text()); if (!imported || typeof imported !== 'object') throw new Error(); state = { ...state, ...imported }; await saveState(); render(); alert('本机数据已恢复。'); }
    catch { alert('备份文件无法识别。'); }
    event.target.value = '';
  });
  $('#clear-data').addEventListener('click', async () => {
    if (!confirm('只会清除这台设备浏览器内的档案、计划、记录和聊天，不会影响其他用户。确定继续？')) return;
    state = { profile: {}, sessions: [], messages: [], plan: null }; await saveState(); render();
  });
}

async function init() {
  const icons = {
    today:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    profile:'<circle cx="12" cy="4" r="2"/><path d="M7 21V10l-3 3-2-2 6-5h8l6 5-2 2-3-3v11m-5-8v8M7 11h10"/>',
    plan:'<rect x="4" y="4" width="16" height="18" rx="2"/><path d="M8 2v4m8-4v4M8 11h8m-8 4h8m-8 4h5"/>',
    progress:'<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>',
    settings:'<path d="m10 2-1 3-3 1-3-1-2 4 2 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-2-2v-3l2-2-2-4-3 1-3-1-1-3Z"/><circle cx="12" cy="12" r="4"/>'
  };
  document.querySelectorAll('.tab').forEach(button=>{button.querySelector('span').innerHTML=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[button.dataset.tab]}</svg>`;});
  $('.workout-icon').innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/></svg>';
  state = { ...state, ...(await loadState()) };
  $('#api-key').value = localStorage.getItem(API_KEY_STORAGE) || '';
  $('#model').value = localStorage.getItem(MODEL_STORAGE) || 'deepseek-chat';
  $('#remember-key').checked = Boolean(localStorage.getItem(API_KEY_STORAGE));
  $('#api-status').textContent = $('#remember-key').checked ? '已从本设备浏览器读取 Key。' : 'Key 默认只在本设备本次会话使用。';
  $('#session-date').value = new Date().toISOString().slice(0, 10);
  render(); bindEvents();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
}

init();
