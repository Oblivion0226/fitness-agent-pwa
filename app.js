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
  const active = new Set(exercise.map || []);
  const fill = (name) => active.has(name) ? '#df724f' : '#d4e1d9';
  const stroke = '#729285';
  const label = compact ? '' : `<text x="60" y="164" text-anchor="middle" fill="#668175" font-size="10">正面</text><text x="180" y="164" text-anchor="middle" fill="#668175" font-size="10">背面</text>`;
  return `<svg class="muscle-svg ${compact ? 'mini-map' : ''}" viewBox="0 0 240 174" role="img" aria-label="${escapeAttribute(exercise.name)}的主要参与肌群示意">
    <g stroke="${stroke}" stroke-width="1.5">
      <circle cx="60" cy="20" r="12" fill="#d4e1d9"/>
      <path d="M43 38 Q60 30 77 38 L82 86 Q60 99 38 86Z" fill="#edf3ef"/>
      <rect x="29" y="40" width="10" height="47" rx="5" fill="${fill('biceps')}"/>
      <rect x="81" y="40" width="10" height="47" rx="5" fill="${fill('triceps')}"/>
      <ellipse cx="45" cy="42" rx="10" ry="7" fill="${fill('frontShoulder')}"/>
      <ellipse cx="75" cy="42" rx="10" ry="7" fill="${fill('frontShoulder')}"/>
      <path d="M44 48 Q60 41 76 48 L74 66 Q60 70 46 66Z" fill="${fill('chest')}"/>
      <path d="M47 88 L58 88 L57 145 L43 145Z" fill="${fill('quads')}"/>
      <path d="M62 88 L73 88 L77 145 L63 145Z" fill="${fill('quads')}"/>
      <circle cx="180" cy="20" r="12" fill="#d4e1d9"/>
      <path d="M163 38 Q180 30 197 38 L202 86 Q180 99 158 86Z" fill="#edf3ef"/>
      <rect x="149" y="40" width="10" height="47" rx="5" fill="${fill('triceps')}"/>
      <rect x="201" y="40" width="10" height="47" rx="5" fill="${fill('triceps')}"/>
      <ellipse cx="165" cy="42" rx="10" ry="7" fill="${fill('rearShoulder')}"/>
      <ellipse cx="195" cy="42" rx="10" ry="7" fill="${fill('rearShoulder')}"/>
      <path d="M166 47 Q180 42 194 47 L192 70 Q180 76 168 70Z" fill="${fill('midBack')}"/>
      <path d="M177 48 L183 48 L184 82 L176 82Z" fill="${fill('back')}"/>
      <path d="M160 52 L171 54 L170 81 L160 77Z" fill="${fill('lats')}"/>
      <path d="M200 52 L189 54 L190 81 L200 77Z" fill="${fill('lats')}"/>
      <path d="M164 82 Q180 72 196 82 L194 96 Q180 104 166 96Z" fill="${fill('glutes')}"/>
      <path d="M167 96 L178 96 L177 145 L163 145Z" fill="${fill('hamstrings')}"/>
      <path d="M182 96 L193 96 L197 145 L183 145Z" fill="${fill('hamstrings')}"/>
    </g>${label}</svg>`;
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
    root.innerHTML = '<div class="empty"><strong>还没有计划</strong><p>先完成档案，再生成一份只使用已审核动作的计划。</p></div>';
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
  $('#greeting').textContent = `你好，${name}`;
  $('#summary').textContent = state.sessions.length ? '教练会结合你的近期完成度、RPE 与恢复做下一步判断。' : '先建立档案，再把训练安排做得贴合你的真实生活。';
  $('#avatar').textContent = name.slice(0, 1);
  const session = state.plan?.items?.[0];
  if (session) {
    $('#today-title').textContent = session.title;
    $('#today-detail').textContent = session.detail || '打开计划，逐个查看动作教学。';
    $('#today-time').textContent = `${session.exercises?.length || 0} 个已审核动作`;
    $('#today-intensity').textContent = session.exercises?.[0]?.rpe || '按状态调整';
  } else {
    $('#today-title').textContent = '先完成你的运动档案';
    $('#today-detail').textContent = '教练需要你的目标、经验与可训练时间，才能安全排计划。';
    $('#today-time').textContent = '约 2 分钟';
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
  $('#library-count').textContent = `${VERIFIED_EXERCISES.length} 个已审核动作`;
  $('#library-list').innerHTML = VERIFIED_EXERCISES.map((exercise) => `<button class="library-card" type="button" data-exercise-id="${escapeAttribute(exercise.id)}">
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
  $('#exercise-detail').innerHTML = `<div class="exercise-modal-head"><div class="big-map">${muscleMap(exercise)}</div><div><span class="eyebrow">${escapeHTML(exercise.level)} · 已审核教学</span><h2>${escapeHTML(exercise.name)}</h2><p>${escapeHTML(exercise.short)}</p><div class="chips"><span>主要：${escapeHTML(exercise.primary.join('、'))}</span><span>协同：${escapeHTML(exercise.secondary.join('、'))}</span></div></div></div>
    <p class="diagram-note">肌群颜色是主要参与部位的教学示意，不代表个体肌电、疼痛诊断或热量消耗。</p>
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
  const planInstruction = isPlanRequest ? `\n\n现在需要生成计划。只能从以下已审核动作库中选择动作，并且必须输出对应 id；不得输出库外动作或自创握法。只输出 JSON：{"note":"...","items":[{"day":"...","title":"...","detail":"...","exercises":[{"id":"动作库 id","sets":"固定组数","reps":"次数","rpe":"RPE/RIR","rest":"休息","note":"简短提示"}]}]}。已审核动作库：${JSON.stringify(catalogForModel())}` : '';
  const body = {
    model,
    temperature: 0.35,
    messages: [
      { role: 'system', content: `${AGENT_SYSTEM_PROMPT}\n\n当前用户本机上下文：${JSON.stringify(context())}${planInstruction}` },
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
  document.querySelectorAll('.panel').forEach((element) => element.classList.toggle('active', element.id === tab));
  document.querySelectorAll('.tab').forEach((element) => element.classList.toggle('active', element.dataset.tab === tab));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.go)));
  document.addEventListener('click', (event) => {
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
      state.plan = parsePlan(reply) || localPlan();
      if (!parsePlan(reply)) state.messages.push({ role: 'assistant', content: `模型没有按受控动作库返回可用计划，已改用离线保守版。原回复：\n${reply}` });
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
