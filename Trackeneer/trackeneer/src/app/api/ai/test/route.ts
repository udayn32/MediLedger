// app/api/ai/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasToken = !!process.env.HUGGINGFACE_API_TOKEN;
    const tokenPrefix = process.env.HUGGINGFACE_API_TOKEN?.substring(0, 10);
    
    if (!hasToken) {
      return NextResponse.json({
        status: 'error',
        message: 'No Hugging Face API token found',
        hasToken: false
      });
    }

    // Test basic API connection
    const { HfInference } = await import('@huggingface/inference');
    const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);
    
    // Simple test with a basic model
    const response = await hf.textGeneration({
      model: 'gpt2',
      inputs: 'Hello',
      parameters: {
        max_new_tokens: 10,
        temperature: 0.5,
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Hugging Face API is working',
      hasToken: true,
      tokenPrefix: tokenPrefix + '...',
      testResponse: response.generated_text?.substring(0, 50) + '...'
    });
    
  } catch (error: unknown) {
    console.error('HF API Test Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      status: 'error',
      message: errorMessage,
      hasToken: !!process.env.HUGGINGFACE_API_TOKEN,
      error: error instanceof Error ? error.toString() : 'Unknown error'
    }, { status: 500 });
  }
}
