# Speech2Speech

基于ASR+LLM+TTS的智能对话框架，实现语音到语音的实时交互系统，主要应用于心理咨询场景。提供了两种部署方式：HTML单页应用和Jupyter Notebook。

## 视频演示

系统的实际运行效果。
<iframe src="//player.bilibili.com/player.html?aid=821634675&bvid=BV1UBfHYYEHw&cid=1139916636&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="640" height="360"> </iframe>

## 系统架构

### ASR（语音识别）
- 基于WebSocket实现实时语音识别，支持SSL加密通信
- 双路识别模式：实时识别结果(online)和VAD事件(offline)
- 可配置参数：chunk_size、chunk_interval等
- 支持中文数字转换(ITN)

### LLM（大语言模型）
- 使用DeepSeek模型作为对话引擎
- 系统角色：医院医生
- 对话历史管理：最近10轮对话记录  
- RAG知识增强：基于FAISS的相似问答检索，Cross-Encoder重排序
- 资源推荐：根据对话内容智能推荐相关资源

### TTS（语音合成）
- 基于HTTP接口的实时语音合成服务
- 支持中文文本转语音
- 实时音频流播放
- 音频播放状态管理

## 核心功能实现

### 1. 语音识别模块
- 基于pyaudio采集麦克风音频数据
- 使用WebSocket传输音频流，支持SSL加密
- 接收识别结果JSON：实时文本(online)和VAD事件(offline) 
- 短暂停顿合并：设置等待时间(如1秒)，合并多个识别片段

### 2. 知识检索模块
- 使用text2vec-base-chinese模型对资源文本生成向量
- 使用FAISS对资源向量进行索引，通过L2距离计算查询相似度
- 使用bge-reranker-base模型对检索结果进行重排序，提升相关性
- 设置相关度阈值，过滤低质量结果

### 3. 对话管理
- 使用双端队列deque存储最近10轮对话(用户query+AI response)  
- 系统角色提示：医院医生
- 消息格式：role(system/user/assistant) + content

### 4. 资源推荐
- 基于关键词触发：抑郁、焦虑、睡眠、压力等
- 动态阈值：根据触发词的重要性调整推荐阈值
- 相关度计算：使用重排序模型预测查询与资源的相关性

## 部署说明

### 1. HTML单页应用
- 将`call.html`文件复制到Web服务器目录
- 配置ASR服务地址(`asr_url`)和TTS服务地址(`tts_url`)
- 启动HTTP服务器：在`call.html`所在目录运行`python -m http.server 8000`
- 在浏览器中访问`http://localhost:8000/call.html`
- 由于浏览器的CORS限制，需要安装Chrome插件关闭CORS限制，或者在服务端配置CORS允许跨域访问
- 点击语音通话按钮，开始与AI助手交谈

### 2. Jupyter Notebook
- 安装Jupyter Notebook环境
- 安装Python依赖：`pip install -r requirements.txt`
- 在`s2s.ipynb`中配置DeepSeek API密钥(`DEEPSEEK_API_KEY`)、TTS服务地址(`TTS_URL`)、ASR服务地址(`ASR_URL`)和资源数据库路径(`DB_PATH`) 
- 启动Jupyter Notebook，运行`s2s.ipynb`
- 运行`start_mic_client()`函数，开始与AI助手交谈

## 环境配置

### 系统依赖
- macOS：`brew install portaudio`
- Ubuntu/Debian：`sudo apt-get install python3-pyaudio portaudio19-dev`
- CentOS/RHEL：`sudo yum install portaudio-devel`

### Python依赖
详见`requirements.txt`文件。

## 注意事项
1. ASR服务需要支持WebSocket流式识别，需要与服务提供方确认接口规范
2. 运行前需要检查麦克风设备是否可用，浏览器是否有麦克风权限
3. 需要提前准备好知识库数据和FAISS索引文件
4. DeepSeek API密钥必须配置，否则无法使用对话服务 
5. 部署前需要检查各个服务的网络连通性，确保IP地址和端口配置正确

## 开源协议
本项目采用MIT许可证，详情请参阅`LICENSE`文件。