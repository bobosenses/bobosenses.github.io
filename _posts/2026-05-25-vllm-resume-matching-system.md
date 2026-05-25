---
layout: post
title: "从零部署 vLLM + ChromaDB 智能简历评估与职能匹配系统"
date: 2026-05-25 16:00:00 +0800
excerpt: "记录在单卡 NVIDIA A10 服务器上从零部署大语言模型推理引擎 vLLM、向量数据库 ChromaDB 和 BGE Reranker 重排模型的完整过程，搭建一个智能简历评估与职能匹配系统。"
categories: [技术, 部署]
tags: [vLLM, ChromaDB, LLM, RAG, BGE-Reranker, Flask, GPU]
---

## 项目背景

在一台单卡 GPU 服务器上搭建一套智能简历评估与职能匹配系统。用户可以上传简历和职位描述，由大语言模型进行多维度打分评估，同时支持通过向量检索 + 重排序将简历匹配到最合适的职能岗位。

整个系统从零开始，包括模型下载、推理引擎搭建、向量数据库导入、前后端开发，到最后的功能验证和并发压力测试。

## 服务器配置

| 硬件/软件 | 规格 |
|----------|------|
| GPU | NVIDIA A10 (24 GB 显存, Ampere 架构, Compute 86) |
| CUDA | 13.0 |
| 驱动 | 580.126.09 |
| Python | 3.12.3 |

A10 的 24GB 显存不算大，同时运行 8B 大语言模型和重排模型需要精打细算。

## 系统架构

```
用户浏览器 (http://112.74.46.132:8080)
       │
┌──────▼──────────────────────────────┐
│        Flask 统一网关 (端口 8080)     │
│                                      │
│  /           → 静态前端页面           │
│  /v1/*       → 代理转发到 vLLM       │
│  /api/search → Chroma + Rerank      │
│  /api/health → 健康检查              │
└──┬────────────────────┬─────────────┘
   │                    │
┌──▼──────┐  ┌──────────▼──────────┐
│  vLLM   │  │     ChromaDB        │
│ :9000   │  │  bge-small-zh-v1.5  │
│ Qwen3   │  │  512-dim 嵌入        │
│ 8B-FP8  │  │  2233 条职能记录     │
│ GPU 70% │  └─────────────────────┘
└─────────┘           │
            ┌─────────▼─────────┐
            │   BGE Reranker    │
            │   v2-m3 (GPU)     │
            │   ~2.1 GB 显存    │
            └───────────────────┘
```

核心设计决策：

- **统一网关**：所有请求走 8080 端口，前端、LLM 代理、检索 API 全由一个 Flask 应用处理
- **vLLM 作为独立后端**：运行在 9000 端口，Flask 流式透传代理请求
- **GPU 显存分配**：vLLM 约 15.5 GB（70%），Reranker 约 2.1 GB

## 模型下载：一波三折

### Qwen3-8B-FP8（8.9 GB）

踩了三个坑：

1. **Git LFS 陷阱**：`git clone` 只拉下 135 字节的 LFS 指针文件，模型本体未下载
2. **hf-mirror 大文件断连**：HuggingFace 镜像站下载大文件经常中断
3. **wget -c 续传导致文件损坏**：在 LFS 指针文件基础上续传，safetensors 文件头被 135 字节 LFS 元数据污染。通过 `xxd` 检查二进制文件头才发现

最终方案——用 ModelScope API：

```bash
wget -O model-00001-of-00002.safetensors \
  "https://modelscope.cn/api/v1/models/unsloth/Qwen3-8B-FP8/repo?Revision=master&FilePath=model-00001-of-00002.safetensors"
```

教训：**不要用 `wget -c` 续传疑似损坏的文件**，先删再下。

### 嵌入模型之变

最初计划使用 `text2vec-base-multilingual`（2.0 GB），但从 hf-mirror 和 ModelScope 都下载失败。最终换成 `bge-small-zh-v1.5`（92 MB），体积小速度快，额外还需要下载 `1_Pooling/config.json` 文件才能正常加载。

### 失败的 Nemotron-Nano-9B-v2

- FP8 格式：需 GPU 算力 ≥89（Hopper 架构），A10 只有 86（Ampere），不兼容
- GGUF Q4_K_M：vLLM 0.21.0 不支持 `nemotron_h` 架构

6.1 GB 文件暂时留在服务器上，等后续版本更新。

## ChromaDB 向量数据库

知识库 CSV 包含 2233 条职能记录（行业 + 三级职能分类 + 关键词）。导入脚本用 ` > ` 串联职能层级，附上关键词作为文档文本，通过 bge-small-zh-v1.5 生成 512 维向量，批量写入 ChromaDB。

检索 + 重排流程：

```
用户查询 → bge-small 嵌入 (CPU, ~20ms)
         → Chroma 向量检索 (top_k × 3 粗召回)
         → BGE Reranker v2-m3 重排序 (GPU, ~150ms)
         → 返回 top_k 精确结果
```

第一阶段多召回候选，再由 Cross-Encoder 对 query-document 对进行联合编码打分，排序质量远高于单纯向量相似度。

## Flask 统一网关

网关代码约 150 行，核心是 vLLM 流式代理。一个关键坑：Flask 的 `request.get_json()` 会消耗 request body，之后再调 `request.get_data()` 返回空字符串。必须先用 `get_data()` 取原始数据再手动 `json.loads()` 解析。

## 前端页面

单页应用，两个 Tab：

**简历评估 Tab**：填写简历正文 + JD + 打分规则，支持思考/非思考两种模式，支持单次评估和并发压力测试。

**职能匹配 Tab**：输入自然语言描述 → 向量检索 + Reranker 找出最匹配的职能，展示两阶段分别耗时。

并发测试 UI 设计：
- "并发数 + 总数" 参数模式（如并发 5、总数 20 表示 5 路并发跑完 20 次请求）
- 每个请求一个标签页，3 列网格布局
- 实时状态颜色区分（等待中/执行中/已完成）
- 点击标签查看完整请求结果
- 全部完成后统计总耗时、平均延迟、吞吐量

## 性能数据

| 指标 | 数值 |
|------|------|
| 向量检索耗时 | ~0.02s |
| Rerank 首次推理（GPU 冷启动） | ~0.4s |
| Rerank 后续推理（GPU 预热） | ~0.15s |
| LLM 单请求延迟 | ~3.4s |
| LLM c=64 并发延迟 | ~3.05s |
| LLM 单请求吞吐 | 0.29 req/s |
| LLM c=64 吞吐 | 1.16 req/s |
| vLLM 显存占用 | ~15.5 GB |
| Reranker 显存占用 | ~2.1 GB |

Qwen3-8B-FP8 在 A10 上的并发扩展线性，64 路并发延迟与单请求基本持平，FP8 量化 + vLLM continuous batching 有效利用了 GPU 算力。

## 经验总结

1. **模型下载优先国内源**：ModelScope API 在国内网络环境下比 hf-mirror 更稳定
2. **不要用 wget -c 续传损坏文件**：先删除再重新下载，避免文件头被污染
3. **GPU 显存精打细算**：24GB A10 同时跑 8B 模型 + Reranker 刚好，需控制 `gpu-memory-utilization`
4. **确认 FP8 兼容性**：需 Hopper 架构（Compute ≥89），Ampere 不支持
5. **嵌入模型别贪大**：92MB 的 bge-small 够用且稳定，不一定要上 multilingual 大模型
6. **Reranker 提升检索质量显著**：Cross-Encoder 重排序精准度远超向量余弦相似度
7. **Flask body 只能读一次**：先 `get_data()` 再解析 JSON

## 代码文件

- `job_match_api.py` — Flask 统一网关（~150 行）
- `import_chroma.py` — ChromaDB 数据导入脚本
- `chat/eval_test.html` — 前端单页应用
- `knowledge_base.csv` — 2233 条职能知识库
- `score_rule.txt` — 简历评估打分规则
