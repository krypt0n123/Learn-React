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
    
    // Set response headers for Server-Sent Events
    const headers = new Headers();
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Headers', 'Cache-Control');

    // Create a readable stream that pipes the DeepSeek response
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Error reading stream:', error);
          controller.error(error);
        }
      }
    });
    
    return new NextResponse(stream, {
      headers,
    });
  } catch (error) {
    console.error('Error in DeepSeek chat completion:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get chat completion',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 