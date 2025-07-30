// Test script to verify agentic AI functionality
import TrackeneerAI from './src/lib/ai/huggingface.js';

async function testAgenticAI() {
  console.log('🤖 Testing Trackeneer Agentic AI System...\n');
  
  const ai = TrackeneerAI.getInstance();
  
  try {
    // Test 1: Study Plan Agent
    console.log('📚 Testing Study Plan Agent...');
    const studyPlan = await ai.generateStudyPlan(
      'Computer Science',
      'Artificial Intelligence',
      'semester',
      'intermediate'
    );
    console.log('✅ Study Plan Generated:', studyPlan.data.slice(0, 100) + '...\n');
    
    // Test 2: Assignment Help Agent
    console.log('📝 Testing Assignment Help Agent...');
    const assignmentHelp = await ai.getAssignmentHelp(
      'Data Structures',
      'Implement a binary search tree',
      'I need help understanding the insertion algorithm'
    );
    console.log('✅ Assignment Help Generated:', assignmentHelp.data.slice(0, 100) + '...\n');
    
    // Test 3: Career Advice Agent
    console.log('💼 Testing Career Advice Agent...');
    const careerAdvice = await ai.getCareerAdvice(
      'Machine Learning, Software Development',
      'Python, JavaScript, React',
      '3rd year',
      '3.5'
    );
    console.log('✅ Career Advice Generated:', careerAdvice.data.slice(0, 100) + '...\n');
    
    // Test 4: General Q&A Agent
    console.log('❓ Testing General Q&A Agent...');
    const generalAnswer = await ai.askQuestion('What are the best practices for studying computer science?');
    console.log('✅ General Answer Generated:', generalAnswer.data.slice(0, 100) + '...\n');
    
    console.log('🎉 All AI Agents Working Successfully!');
    
  } catch (error) {
    console.error('❌ Error testing AI agents:', error);
    console.log('💡 Note: If you see API errors, the fallback responses should still work');
  }
}

// Run the test
testAgenticAI();
