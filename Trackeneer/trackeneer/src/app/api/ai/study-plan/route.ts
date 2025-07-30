// app/api/ai/study-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import TrackeneerAI from '@/lib/ai/huggingface';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subjects, availableHours, difficulty } = await request.json();

    if (!subjects || !availableHours || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: subjects, availableHours, difficulty' },
        { status: 400 }
      );
    }

    const ai = TrackeneerAI.getInstance();
    const response = await ai.generateStudyPlan(
      subjects.join(', '),
      'General Topics',
      'semester',
      difficulty
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Study Plan API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
