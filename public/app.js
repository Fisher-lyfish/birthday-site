/* =========================================================
   邹宇乐生日快乐 - 前端逻辑
   1. 粒子背景
   2. 页面切换
   3. 留言板（浏览器本地存储）
   ========================================================= */


/* =========================================================
   一、动态粒子背景
   ========================================================= */
(function () {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let W = 0, H = 0;
  let particles = [];
  const mouse = { x: -9999, y: -9999 };

  const COLORS = [
    [255, 214, 120],
    [255, 150, 205],
    [178, 150, 255],
    [140, 225, 255],
    [255, 255, 255]
  ];

  const sprites = COLORS.map(function (rgb) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)');
    grd.addColorStop(0.22, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.6)');
    grd.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    return c;
  });

  function makeParticle(anywhere) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + Math.random() * 50,
      r: 0.8 + Math.random() * 1.9,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.12 + Math.random() * 0.45),
      ci: (Math.random() * COLORS.length) | 0,
      a: 0.22 + Math.random() * 0.55,
      tw: Math.random() * Math.PI * 2,
      tws: 0.008 + Math.random() * 0.03
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.max(40, Math.min(110, Math.round((W * H) / 17000)));
    particles = [];
    for (let i = 0; i < target; i++) particles.push(makeParticle(true));
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 250); });
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', function () { mouse.x = mouse.y = -9999; });
  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });
  window.addEventListener('touchend', function () { mouse.x = mouse.y = -9999; });

  let last = performance.now();

  function frame(now) {
    const dt = Math.min(2.5, (now - last) / 16.667);
    last = now;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.tw += p.tws * dt;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 15000 && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = (1 - d / 122) * 1.1;
        p.x += (dx / d) * f * dt;
        p.y += (dy / d) * f * dt;
      }

      if (p.y < -40 || p.x < -80 || p.x > W + 80 || p.y > H + 120) {
        particles[i] = makeParticle(false);
      }
    }

    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 11000) {
          const alpha = (1 - d2 / 11000) * 0.16;
          ctx.strokeStyle = 'rgba(255,205,235,' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const twinkle = 0.62 + 0.38 * Math.sin(p.tw);
      const size = p.r * 10 * twinkle;
      ctx.globalAlpha = Math.min(1, p.a * twinkle);
      ctx.drawImage(sprites[p.ci], p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();


/* =========================================================
   二、页面切换
   ========================================================= */
(function () {
  const pageMain = document.getElementById('page-main');
  const pageMsg = document.getElementById('page-msg');

  document.getElementById('btnView').addEventListener('click', function () {
    pageMain.classList.remove('active');
    pageMsg.classList.add('active');
    if (window.BirthdayBoard) window.BirthdayBoard.refresh();
  });

  document.getElementById('btnBack').addEventListener('click', function () {
    pageMsg.classList.remove('active');
    pageMain.classList.add('active');
  });
})();


/* =========================================================
   三、留言板（浏览器本地存储）
   ========================================================= */
(function () {
  const listEl = document.getElementById('msgList');
  const inputEl = document.getElementById('msgInput');
  const btnSend = document.getElementById('btnSend');
  const modal = document.getElementById('nickModal');
  const nickInput = document.getElementById('nickInput');
  const btnConfirm = document.getElementById('btnConfirm');
  const btnCancel = document.getElementById('btnCancel');
  const countEl = document.getElementById('msgCount');
  const toastEl = document.getElementById('toast');

  const MESSAGES_KEY = 'zyl_birthday_messages_v1';
  const NICK_KEY = 'zyl_birthday_nick_v1';

  let cache = [];
  let pendingText = '';
  let toastTimer = null;

  /* ---------- 工具 ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }

  function fmtTime(ts) {
    const d = new Date(ts || Date.now());
    const now = new Date();
    const hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    if (d.toDateString() === now.toDateString()) return hm;
    return (d.getFullYear() === now.getFullYear() ? '' : d.getFullYear() + '-') +
      pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + hm;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 500);
  }

  /* ---------- 渲染 ---------- */
  function render(keepScroll) {
    const prevScroll = listEl.scrollTop;
    const atTop = prevScroll < 40;

    countEl.textContent = cache.length ? cache.length + ' 条祝福' : '';
    listEl.innerHTML = '';

    if (!cache.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<span>✨</span>还没有留言，来写下第一句祝福吧～';
      listEl.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    cache.forEach(function (m) {
      const card = document.createElement('div');
      card.className = 'msg-card';
      card.dataset.id = m.id || '';

      const head = document.createElement('div');
      head.className = 'msg-head';

      const nick = document.createElement('span');
      nick.className = 'nick';
      nick.textContent = m.nick || '匿名好友';

      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = fmtTime(m.time);

      head.appendChild(nick);
      head.appendChild(time);

      const body = document.createElement('div');
      body.className = 'msg-text';
      body.textContent = m.text;

      card.appendChild(head);
      card.appendChild(body);
      frag.appendChild(card);
    });
    listEl.appendChild(frag);

    if (keepScroll) {
      listEl.scrollTop = atTop ? 0 : prevScroll;
    }
  }

  /* ---------- 数据操作 ---------- */
  function sortNewestFirst(list) {
    return list.slice().sort(function (a, b) {
      return (b.time || 0) - (a.time || 0);
    });
  }

  function readMessages() {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (raw === null) return [];

    const messages = JSON.parse(raw);
    if (!Array.isArray(messages)) {
      throw new Error('本地留言数据格式无效');
    }
    return messages;
  }

  function writeMessages(messages) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }

  function refresh() {
    try {
      cache = sortNewestFirst(readMessages());
      render(true);
    } catch (error) {
      console.error('读取本地留言失败:', error);
      toast('读取留言失败，请检查浏览器存储设置');
    }
  }

  /* ---------- 发送流程 ---------- */
  btnSend.addEventListener('click', function () {
    const text = inputEl.value.trim();
    if (!text) {
      shake(inputEl);
      toast('先写点什么吧～');
      inputEl.focus();
      return;
    }
    pendingText = text;
    try {
      nickInput.value = localStorage.getItem(NICK_KEY) || '';
    } catch (error) {
      console.error('读取本地昵称失败:', error);
      nickInput.value = '';
      toast('无法读取已保存的昵称');
    }
    modal.classList.add('show');
    setTimeout(function () { nickInput.focus(); }, 150);
  });

  inputEl.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      btnSend.click();
    }
  });

  function closeModal() {
    modal.classList.remove('show');
  }

  function publish() {
    const nick = nickInput.value.trim() || '匿名好友';
    const text = pendingText;
    if (!text) return;

    btnConfirm.disabled = true;
    btnConfirm.textContent = '保存中…';

    try {
      const msg = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        nick: nick.slice(0, 16),
        text: text.slice(0, 300),
        time: Date.now()
      };
      const nextMessages = sortNewestFirst([msg].concat(cache));
      writeMessages(nextMessages);
      cache = nextMessages;

      let nickSaved = true;
      try {
        localStorage.setItem(NICK_KEY, nick);
      } catch (error) {
        console.error('保存本地昵称失败:', error);
        nickSaved = false;
      }

      pendingText = '';
      inputEl.value = '';
      render(true);
      listEl.scrollTop = 0;
      closeModal();
      toast(nickSaved ? '祝福已保存在这台设备上 🎉' : '祝福已保存，但昵称未能记住');
    } catch (error) {
      console.error('保存本地留言失败:', error);
      toast('保存留言失败，请检查浏览器存储空间');
    } finally {
      btnConfirm.disabled = false;
      btnConfirm.textContent = '发布留言';
    }
  }

  btnConfirm.addEventListener('click', publish);

  nickInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      publish();
    }
  });

  btnCancel.addEventListener('click', function () {
    closeModal();
    inputEl.focus();
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  window.addEventListener('storage', function (event) {
    if (event.key === MESSAGES_KEY) refresh();
  });

  /* ---------- 对外暴露 ---------- */
  window.BirthdayBoard = { refresh: refresh };

  /* ---------- 初始化 ---------- */
  refresh();
})();