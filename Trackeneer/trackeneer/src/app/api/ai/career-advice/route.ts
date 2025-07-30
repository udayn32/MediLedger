// app/api/ai/career-advice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import TrackeneerAI from '@/lib/ai/huggingface';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interests, skills, currentYear, cgpa } = await request.json();

    if (!interests || !skills || !currentYear) {
      return NextResponse.json(
        { error: 'Missing required fields: interests, skills, currentYear' },
        { status: 400 }
      );
    }

    const ai = TrackeneerAI.getInstance();
    const response = await ai.getCareerAdvice(interests, skills, currentYear, cgpa);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Career Advice API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
