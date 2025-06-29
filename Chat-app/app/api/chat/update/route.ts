import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { id, ...data } = body

    // 确保 updateTime 是一个 Date 对象
    if (data.updateTime) {
        data.updateTime = new Date(data.updateTime)
    }

    await prisma.chat.update({
        data,
        where: {
            id
        }
    })
    return NextResponse.json({ code: 0 })
}