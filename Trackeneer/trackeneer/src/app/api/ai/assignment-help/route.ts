// app/api/ai/assignment-help/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import TrackeneerAI from '@/lib/ai/huggingface';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, topic, question, difficulty } = await request.json();

    if (!subject || !topic || !question || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topic, question, difficulty' },
        { status: 400 }
      );
    }

    const ai = TrackeneerAI.getInstance();
    const response = await ai.getAssignmentHelp(subject, topic, question, difficulty);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Assignment Help API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
