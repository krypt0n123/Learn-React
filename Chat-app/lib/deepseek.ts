import { Message } from '@/types/chat';

export class DeepSeekAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createChatCompletion(messages: Message[]) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  }
}