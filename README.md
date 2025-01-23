# Speech2Speech

基于ASR+LLM+TTS的智能对话框架，实现语音到语音的实时交互系统。目前主要应用于心理咨询场景。

ASR和TTS系统自己找网上开源的自行安装就行，使用其自带的API，代码中的ASR TTS URL指的就是这些
LLM API目前用的Deepseek，请自行申请替换

## 系统架构

### ASR（语音识别）
基于WebSocket实现实时语音识别：
- 支持SSL加密通信
- 双路识别模式：实时识别结果和VAD结果
- 可配置参数：chunk_size、chunk_interval等
- 支持中文数字转换(ITN)

### LLM（大语言模型）
使用DeepSeek模型作为对话引擎：
- 系统角色：xxx医生
- 对话历史管理：最近10轮对话记录
- RAG知识增强：基于FAISS的相似问答检索
- 资源推荐：根据对话内容智能推荐相关资源

### TTS（语音合成）
基于HTTP接口的语音合成服务：
- 支持中文文本转语音
- 实时音频流播放
- 音频播放状态管理

## 核心功能实现

### 1. 语音识别模块

```python
async def _record_microphone(self):
    """录音实现"""
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000
    chunk_size = 60 * self.chunk_size[1] / self.chunk_interval
    CHUNK = int(RATE / 1000 * chunk_size)
    
    self.audio = pyaudio.PyAudio()
    self.stream = self.audio.open(
        format=FORMAT,
        channels=CHANNELS,
        rate=RATE,
        input=True,
        frames_per_buffer=CHUNK
    )
```

### 2. 知识检索模块

RAG系统实现了两阶段检索：
1. FAISS向量检索
   - 使用text2vec-base-chinese模型生成向量
   - L2距离计算相似度
   
2. Cross-Encoder重排序
   - 使用bge-reranker-base模型
   - 支持配置相似度阈值
   - 过滤低相关性结果

```python
def search(self, query: str, k: int = 3, threshold: float = 0.5):
    """检索实现"""
    # 计算查询向量
    query_vector = self.embedding_model.encode([query])
    # FAISS检索
    distances, indices = self.index.search(
        query_vector.astype('float32'), 
        k
    )
    # 重排序和过滤
    results = []
    for idx, distance in zip(indices[0], distances[0]):
        if idx != -1:
            result = self.resources[idx].copy()
            similarity = 1 / (1 + distance)
            result['initial_score'] = similarity
            results.append(result)
```

### 3. 对话管理

使用deque实现对话历史管理：
```python
self.conversation_history = deque(maxlen=10)
```

消息格式：
```python
messages = [
    {"role": "system", "content": "你是ABC医院王医生..."},
    {"role": "user", "content": user_input},
    {"role": "assistant", "content": ai_response}
]
```

### 4. 资源推荐

基于关键词触发的智能推荐：
```python
triggers = {
    '抑郁': 0.6,
    '焦虑': 0.6,
    '睡眠': 0.6,
    '压力': 0.5,
    '药物': 0.7,
    '家属': 0.5,
    '量表': 0.8,
    '检查': 0.6,
    '治疗': 0.7,
    '症状': 0.6
}
```

## 快速开始

### 模型下载说明

首次运行会自动下载以下模型：
1. `shibing624/text2vec-base-chinese`（约500MB）：用于文本向量化
2. `BAAI/bge-reranker-base`（约500MB）：用于结果重排序

模型会缓存在本地，后续运行无需重新下载。

## 系统依赖

macOS:
```bash
brew install portaudio
```

Ubuntu/Debian:
```bash
sudo apt-get install python3-pyaudio portaudio19-dev
```

CentOS/RHEL:
```bash
sudo yum install portaudio-devel
```

### Python 依赖
```txt
# Core ML & Data Processing
numpy>=1.21.0
torch>=2.0.0
faiss-cpu>=1.7.4
sentence-transformers>=2.2.0
openai>=1.0.0
tqdm>=4.65.0

# Audio Processing
pyaudio>=0.2.13
sounddevice>=0.4.6
soundfile>=0.12.1

# Communication
websockets>=10.4
requests>=2.31.0

# Async Support
nest-asyncio>=1.5.6

# File Format Support
wave

# IDE Support (Optional)
notebook
ipykernel
ipywidgets
```

### 基础配置
```python
config = {
    "deepseek_api_key": "your-api-key", #请自行至DeepSeek.com申请，新注册会赠百万Token
    "tts_url": "http://127.0.0.1:9880", #用你自建的或s2s.ipynb配置中的值就行
    "asr_url": "wss://your-asr-server:10096", #用你自建的或s2s.ipynb配置中的值就行
    "db_path": "mental_health_resources.db",
    "debug": True
}
```

### 运行系统
```python
from s2s import start_mic_client

start_mic_client(**config)
```

## 注意事项

1. ASR服务需要支持WebSocket流式识别
2. 运行前确保麦克风设备可用
3. 需要准备知识库数据和FAISS索引
4. DeepSeek API密钥必须配置
5. 检查网络连接和服务状态

## 开源协议

MIT License
