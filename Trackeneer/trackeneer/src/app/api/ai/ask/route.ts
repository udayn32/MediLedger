// app/api/ai/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import TrackeneerAI from '@/lib/ai/huggingface';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, context } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }

    const ai = TrackeneerAI.getInstance();
    const response = await ai.askQuestion(question, context);

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Ask API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
