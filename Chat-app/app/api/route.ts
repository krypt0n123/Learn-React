import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const {messageText} = await request.json()
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller){
      for(let i=0;i<messageText.length;i++){
        controller.enqueue(encoder.encode(messageText[i]))
      }
      controller.close()
    }
  })
  return new Response(stream)
}