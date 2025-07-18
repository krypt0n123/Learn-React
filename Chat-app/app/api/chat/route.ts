import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekAPI } from '@/lib/deepseek';
import { Message } from '@/types/chat';

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY environment variable');
}

const deepseekAPI = new DeepSeekAPI(process.env.DEEPSEEK_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: Message[] = body.messages;

    const response = await deepseekAPI.createChatCompletion(messages);
    
    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');

    // 创建一个 TransformStream 来处理流数据
    const stream = new TransformStream({
      async transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    });

    // 将 DeepSeek 的响应流传输到客户端
    response.body?.pipeTo(stream.writable);
    
    return new NextResponse(stream.readable, {
      headers,
    });
  } catch (error) {
    console.error('Error in chat completion:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get chat completion',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}