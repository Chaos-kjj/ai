// server.js
// 这是一个简单的Express服务器，用于在本地运行您的应用并处理API请求。

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// 引入您的API处理逻辑
const checkSentenceHandler = require('./api/check-sentence');
const checkTranslationHandler = require('./api/check-translation');
const getDefinitionHandler = require('./api/get-definition');
const getTranslationChallengeHandler = require('./api/get-translation-challenge');

const app = express();
const port = 3000; // 您可以在这里更改端口

// 中间件
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析JSON格式的请求体
app.use(express.static(path.join(__dirname))); // 托管静态文件（如index.html）

// API 路由
// 将请求转发给对应的处理函数
// Express的req, res对象与Vercel serverless functions的兼容性很好
app.post('/api/check-sentence', (req, res) => checkSentenceHandler(req, res));
app.post('/api/check-translation', (req, res) => checkTranslationHandler(req, res));
app.post('/api/get-definition', (req, res) => getDefinitionHandler(req, res));
app.post('/api/get-translation-challenge', (req, res) => getTranslationChallengeHandler(req, res));

// 根路由，提供 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`康康背词器服务器正在运行于 http://localhost:${port}`);
  console.log('请确保您的Ollama服务也正在运行中。');
});
