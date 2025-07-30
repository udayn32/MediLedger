// lib/ai/huggingface.ts

export interface AIResponse {
  text: string;
  confidence?: number;
  suggestions?: string[];
}

export class TrackeneerAI {
  private static instance: TrackeneerAI;
  private useAPI: boolean;

  private constructor() {
    this.useAPI = !!process.env.HUGGINGFACE_API_TOKEN;
    console.log('TrackeneerAI initialized, API enabled:', this.useAPI);
  }

  public static getInstance(): TrackeneerAI {
    if (!TrackeneerAI.instance) {
      TrackeneerAI.instance = new TrackeneerAI();
    }
    return TrackeneerAI.instance;
  }

  // Generate Study Plan (for API compatibility)
  async generateStudyPlan(
    subject: string,
    topic: string,
    duration: string,
    level: string
  ): Promise<{ data: string; type: string }> {
    const { FallbackAI } = await import('./fallback');
    const fallback = FallbackAI.generateStudyPlan(subject, topic, duration, level);
    return fallback;
  }

  // Assignment Helper Agent
  async getAssignmentHelp(
    subject: string,
    topic: string,
    question: string,
    difficulty?: string
  ): Promise<{ data: string; type: string }> {
    const { FallbackAI } = await import('./fallback');
    const fallback = await FallbackAI.getAssignmentHelp(subject, topic, question);
    return { data: fallback.text, type: 'demo-response' };
  }

  // Career Advisor Agent
  async getCareerAdvice(
    interests: string,
    skills: string,
    currentYear: string,
    cgpa?: string
  ): Promise<{ data: string; type: string }> {
    const { FallbackAI } = await import('./fallback');
    const fallback = await FallbackAI.getCareerAdvice([interests], [skills], parseInt(currentYear));
    return { data: fallback.text, type: 'demo-response' };
  }

  // General Q&A Agent
  async askQuestion(
    question: string,
    context?: string
  ): Promise<{ data: string; type: string }> {
    const { FallbackAI } = await import('./fallback');
    const fallback = await FallbackAI.askQuestion(question);
    return { data: fallback.text, type: 'demo-response' };
  }
}

export default TrackeneerAI;
