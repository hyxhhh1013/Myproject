import { Request, Response } from 'express';
import axios from 'axios';
import { asyncHandler } from '../middleware/asyncHandler';

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
const ZHIPU_MODEL = process.env.ZHIPU_MODEL || 'glm-4-flash';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `你是一个活泼、有趣、搞怪的AI助手，名叫"小轩"。你是由智谱AI开发的智能对话助手，现在服务于黄奕轩的个人网站。你的性格开朗、幽默，喜欢用轻松愉快的语气与用户交流，同时保持专业的知识储备。

## 关于网站主人
- 姓名：黄奕轩
- 身份：湖南农业大学计算机科学与技术专业在读学生，2024级本科，预计2028年毕业
- 地点：中国·长沙
- 邮箱：2090862712@qq.com
- MBTI：ENFJ
- 状态：本科在读，可接受实习机会

## 关于网站
这是一个个人作品集网站，主要功能包括：

1. **首页展示**：个人介绍和头像、精选项目预览
2. **关于我**：详细的个人简介
3. **技能展示**：前端/后端技术
4. **项目展示**：WeatherCast、TaskMaster、FocusFlow、LiteNote等
5. **经历展示**：教育/实习经历
6. **摄影作品**：个人摄影作品展示
7. **兴趣爱好**：音乐、电影、旅行足迹
8. **联系方式**：留言表单、社交媒体
9. **Demo演示**：AI助手、天气、番茄钟、任务管理、笔记

## 技术栈
前端：React 18、TypeScript、Vite、Tailwind CSS、Framer Motion
后端：Node.js、Express、Prisma ORM
数据库：MySQL
AI：智谱AI GLM-4

## 回答原则
1. 用活泼幽默的语言回答，保持轻松愉快的语气
2. 如果用户询问黄奕轩的信息，基于上述内容回答
3. 提供邮箱 2090862712@qq.com 以便联系
4. 适当使用表情符号和口语化表达`;

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  if (!ZHIPU_API_KEY || ZHIPU_API_KEY === 'your_zhipu_api_key_here') {
    return res.status(500).json({ error: 'Zhipu API key not configured' });
  }

  const systemMessage: ChatMessage = { role: 'system', content: SYSTEM_PROMPT };
  const allMessages = [systemMessage, ...messages];

  const response = await axios.post(
    ZHIPU_API_URL,
    {
      model: ZHIPU_MODEL,
      messages: allMessages,
      stream: false,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2000,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
      },
    },
  );

  const assistantMessage = response.data.choices[0]?.message?.content || '抱歉，我无法生成回复。';

  res.json({ success: true, message: assistantMessage, usage: response.data.usage });
});

export const chatStream = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    if (!ZHIPU_API_KEY || ZHIPU_API_KEY === 'your_zhipu_api_key_here') {
      return res.status(500).json({ error: 'Zhipu API key not configured' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemMessage: ChatMessage = { role: 'system', content: SYSTEM_PROMPT };
    const allMessages = [systemMessage, ...messages];

    const response = await axios.post(
      ZHIPU_API_URL,
      { model: ZHIPU_MODEL, messages: allMessages, stream: true, temperature: 0.7, top_p: 0.9, max_tokens: 2000 },
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZHIPU_API_KEY}` }, responseType: 'stream' },
    );

    response.data.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        const message = line.replace(/^data: /, '');

        if (message === '[DONE]') {
          res.write('data: [DONE]\n\n');
          continue;
        }

        try {
          const parsed = JSON.parse(message);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (e) {
          // Ignore parsing errors for incomplete chunks
        }
      }
    });

    response.data.on('end', () => res.end());

    response.data.on('error', (err: Error) => {
      console.error('Stream error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

    req.on('close', () => response.data.destroy());
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat stream error:', errMsg);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
};
