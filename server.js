/* =========================================================
   邹宇乐生日快乐 - 后端服务
   - JSON 文件持久化留言
   - SSE 实时推送（手机发，平板秒到）
   ========================================================= */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'messages.json');

/* ---------- 初始化数据目录 ---------- */
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

/* ---------- 中间件 ---------- */
app.use(express.json({ limit: '64kb' }));
app.use(express.static(PUBLIC_DIR));

/* =========================================================
   存储层（JSON 文件 + 写操作串行化）
   ========================================================= */
function readMessages() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

let writeChain = Promise.resolve();
function writeMessages(list) {
  writeChain = writeChain.then(
    () =>
      new Promise((resolve) => {
        fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8', () =>
          resolve()
        );
      })
  );
  return writeChain;
}

/* =========================================================
   SSE 实时推送
   ========================================================= */
const clients = new Set();

function broadcast(event, data) {
  const payload =
    'event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n';
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (e) {
      clients.delete(res);
    }
  }
}

app.get('/api/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write('retry: 3000\n\n');
  res.write('event: hello\ndata: {"ok":true}\n\n');

  clients.add(res);

  req.on('close', () => clients.delete(res));
  req.on('error', () => clients.delete(res));
});

// 心跳，保持代理不断开
setInterval(() => {
  for (const res of clients) {
    try {
      res.write(': ping\n\n');
    } catch (e) {
      clients.delete(res);
    }
  }
}, 25000).unref();

/* =========================================================
   REST API
   ========================================================= */

// 获取全部留言
app.get('/api/messages', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(readMessages());
});

// 发布留言
app.post('/api/messages', async (req, res) => {
  const body = req.body || {};
  const rawText = typeof body.text === 'string' ? body.text.trim() : '';
  const rawNick = typeof body.nick === 'string' ? body.nick.trim() : '';

  if (!rawText) {
    return res.status(400).json({ error: '留言内容不能为空' });
  }
  if (rawText.length > 300) {
    return res.status(400).json({ error: '留言太长了（最多300字）' });
  }

  const msg = {
    id: crypto.randomUUID(),
    nick: (rawNick || '匿名好友').slice(0, 16),
    text: rawText.slice(0, 300),
    time: Date.now()
  };

  const list = readMessages();
  list.push(msg);
  await writeMessages(list);

  broadcast('message', msg);
  res.json(msg);
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    count: readMessages().length,
    clients: clients.size
  });
});

/* ---------- 启动 ---------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('✅ 生日留言服务已启动');
  console.log('   本机访问：  http://localhost:' + PORT);
  console.log('   局域网访问：http://<你的电脑IP>:' + PORT);
  console.log('');
});