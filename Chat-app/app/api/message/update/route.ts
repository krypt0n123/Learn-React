import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.content || !body.role) {
            return NextResponse.json(
                { code: 1, message: 'Missing required fields: content or role' },
                { status: 400 }
            );
        }

        // Create or get chat
        let chatId = body.chatId;
        let chat;

        if (!chatId) {
            chat = await prisma.chat.create({
                data: {
                    title: "新对话"
                }
            });
            chatId = chat.id;
        } else {
            chat = await prisma.chat.findUnique({
                where: { id: chatId }
            });
            if (!chat) {
                return NextResponse.json(
                    { code: 1, message: 'Chat not found' },
                    { status: 404 }
                );
            }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                content: body.content,
                role: body.role,
                chatId: chatId
            },
            include: {
                chat: true
            }
        });

        return NextResponse.json({ code: 0, data: { message } });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { 
                code: 1, 
                message: 'Failed to process message',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}