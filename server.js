// tts-server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 9880;

// 启用 CORS，允许所有来源（*）
app.use(cors());

// 如果只允许特定来源，可以这样配置：
/*
app.use(cors({
    origin: 'http://localhost:8000'
}));
*/

// 处理 GET 请求
app.get('/', (req, res) => {
    const text = req.query.text;
    const text_language = req.query.text_language;

    if (!text || !text_language) {
        return res.status(400).send('Missing text or text_language parameter');
    }

    console.log(`Received TTS request: text="${text}", text_language="${text_language}"`);

    // 集成您的实际 TTS 引擎，这里我们返回一个预生成的音频文件作为示例
    const audioPath = path.join(__dirname, '123.wav'); // 确保有一个 123.wav 文件

    fs.readFile(audioPath, (err, data) => {
        if (err) {
            console.error('Error reading audio file:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.writeHead(200, {
            'Content-Type': 'audio/wav',
            'Content-Length': data.length
        });
        res.end(data);
    });
});

// 启动 HTTP 服务器
app.listen(port, () => {
    console.log(`TTS 服务器正在运行，访问地址: http://192.168.8.16:${port}/`);
});
