// lib/ai/fallback.ts
import { AIResponse } from './huggingface';

export class FallbackAI {
  static async getStudyPlanRecommendations(
    subjects: string[],
    availableHours: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<AIResponse> {
    const difficultyAdvice = {
      easy: "Start with 30-minute focused sessions",
      medium: "Aim for 45-60 minute study blocks", 
      hard: "Use 25-minute Pomodoro sessions with 5-minute breaks"
    };

    const response = `
📚 **Personalized Study Plan**

**Subjects:** ${subjects.join(', ')}
**Daily Hours:** ${availableHours} hours
**Difficulty:** ${difficulty}

**Recommended Schedule:**
${subjects.map((subject, index) => 
  `${index + 1}. ${subject}: ${Math.ceil(availableHours / subjects.length)} hours/day`
).join('\n')}

**Study Tips:**
• ${difficultyAdvice[difficulty]}
• Take breaks every hour
• Review previous day's material for 15 minutes
• Practice active recall techniques

**Priority Order:**
1. Most challenging subjects in morning
2. Moderate subjects in afternoon  
3. Easier review in evening

This is a demo response. Connect your Hugging Face API for personalized AI recommendations!
    `;

    return {
      text: response.trim(),
      confidence: 0.7
    };
  }

  static generateStudyPlan(
    subject: string,
    topic: string,
    duration: string,
    level: string
  ): { data: string; type: string } {
    const response = `
📚 **AI Study Plan: ${subject} - ${topic}**

**Duration:** ${duration}
**Level:** ${level}

## Week 1-2: Foundation Building
- 📖 Review fundamental concepts
- 📝 Create comprehensive notes
- 🎯 Complete basic exercises (2-3 per day)

## Week 3-4: Deep Dive
- 🔍 Explore advanced topics in ${topic}
- 💻 Work on practical projects
- 👥 Join study groups or forums

## Week 5-6: Practice & Application
- 🧪 Solve complex problems
- 📊 Take practice assessments
- 🔄 Review and reinforce weak areas

## Daily Schedule (${level} level):
- Morning (1-2 hours): Theory and concepts
- Afternoon (1 hour): Practical exercises
- Evening (30 mins): Review and planning

## Key Milestones:
✅ Week 2: Complete foundational topics
✅ Week 4: Finish advanced concepts
✅ Week 6: Ready for assessment

💡 **Pro Tips:**
- Use active recall techniques
- Teach concepts to others
- Take regular breaks (Pomodoro technique)
- Create mind maps for complex topics

*This is a demo response. Connect your Hugging Face API for personalized AI-generated study plans!*
    `;

    return {
      data: response.trim(),
      type: 'demo-response'
    };
  }

  static async getAssignmentHelp(
    subject: string,
    topic: string,
    question: string
  ): Promise<AIResponse> {
    const response = `
🎯 **Assignment Guidance - ${subject}**

**Topic:** ${topic}
**Your Question:** ${question}

**Approach Strategy:**
1. **Understand the Problem:** Break down what's being asked
2. **Identify Key Concepts:** List the main principles involved
3. **Plan Your Solution:** Outline steps before coding/solving
4. **Implement Carefully:** Work through each step methodically
5. **Test & Verify:** Check your work with examples

**Study Resources:**
• Review your textbook chapter on ${topic}
• Look for similar examples in your notes
• Practice with related problems
• Consider discussing with classmates

**Next Steps:**
- Try to solve a simpler version first
- If stuck, identify exactly where you're confused
- Don't just copy solutions - understand the reasoning

This is a demo response. Connect your Hugging Face API for detailed AI tutoring!
    `;

    return {
      text: response.trim(),
      confidence: 0.7
    };
  }

  static async getCareerAdvice(
    interests: string[],
    skills: string[],
    currentYear: number
  ): Promise<AIResponse> {
    const response = `
🚀 **Career Guidance - Year ${currentYear}**

**Your Interests:** ${interests.join(', ')}
**Current Skills:** ${skills.join(', ')}

**Recommended Career Paths:**
1. **Software Development** - High demand, good salary
2. **Data Science** - Growing field with AI/ML focus
3. **Product Management** - Blend of technical and business
4. **DevOps Engineering** - Infrastructure and automation

**Skills to Develop:**
• Programming languages (Python, JavaScript, Java)
• Problem-solving and algorithmic thinking
• Communication and teamwork
• Version control (Git)
• Cloud platforms (AWS, Azure)

**Immediate Action Items:**
1. Build portfolio projects on GitHub
2. Contribute to open source
3. Start a technical blog
4. Network with professionals on LinkedIn
5. Apply for internships

**Year ${currentYear} Focus:**
${currentYear <= 2 ? 
  '- Focus on fundamentals and building strong coding skills' : 
  '- Start applying for internships and building professional network'
}

This is a demo response. Connect your Hugging Face API for personalized career insights!
    `;

    return {
      text: response.trim(),
      confidence: 0.7,
      suggestions: [
        'Build GitHub portfolio',
        'Apply for internships', 
        'Learn cloud technologies',
        'Practice coding interviews',
        'Network with professionals'
      ]
    };
  }

  static async askQuestion(question: string): Promise<AIResponse> {
    // Simple keyword-based responses for demo
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('study') || lowerQuestion.includes('exam')) {
      return {
        text: "For effective studying, I recommend:\n• Use active recall techniques\n• Practice spaced repetition\n• Take regular breaks\n• Find a quiet study environment\n• Set specific, achievable goals\n\nWhat specific study challenge are you facing?",
        confidence: 0.8
      };
    }
    
    if (lowerQuestion.includes('career') || lowerQuestion.includes('job')) {
      return {
        text: "For career development:\n• Build a strong portfolio\n• Network with professionals\n• Gain practical experience through internships\n• Develop both technical and soft skills\n• Stay updated with industry trends\n\nWhat aspect of career planning interests you most?",
        confidence: 0.8
      };
    }
    
    if (lowerQuestion.includes('programming') || lowerQuestion.includes('coding')) {
      return {
        text: "For programming success:\n• Practice coding daily\n• Work on real projects\n• Learn data structures and algorithms\n• Contribute to open source\n• Read others' code to learn\n\nWhat programming language or concept would you like help with?",
        confidence: 0.8
      };
    }

    return {
      text: `I'd be happy to help with "${question}"!\n\nAs your AI study assistant, I can provide guidance on:\n• Study planning and techniques\n• Assignment help and tutoring\n• Career advice and planning\n• Programming and technical topics\n\nCould you provide more specific details about what you'd like to know?`,
      confidence: 0.6
    };
  }
}
