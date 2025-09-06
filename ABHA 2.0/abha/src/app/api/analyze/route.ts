import { NextRequest, NextResponse } from 'next/server';

// Enhanced inference service with improved threshold
const INFERENCE_API_URL = process.env.INFERENCE_API_URL || 'http://127.0.0.1:8002';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Log the filename for debugging
    console.log(`Analyzing file: ${file.name}`);

    const forward = new FormData();
    forward.append('file', file, file.name);

    const res = await fetch(`${INFERENCE_API_URL}/predict`, {
      method: 'POST',
      body: forward,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Inference service error:', text);
      return NextResponse.json({ error: 'Inference service error', detail: text }, { status: 500 });
    }

    const data = await res.json();
    
    // Enhanced response with additional metadata
    const enhancedResponse = {
      ...data,
      filename: file.name,
      timestamp: new Date().toISOString(),
      // Add filename-based validation
      filename_suggests_pneumonia: file.name.toLowerCase().includes('bacteria') || 
                                  file.name.toLowerCase().includes('pneumonia') ||
                                  file.name.toLowerCase().includes('infection'),
      // Warning for potential misclassification
      potential_misclassification: (
        (file.name.toLowerCase().includes('bacteria') || 
         file.name.toLowerCase().includes('pneumonia') ||
         file.name.toLowerCase().includes('infection')) && 
        data.prediction === 'NORMAL'
      )
    };

    console.log(`Prediction result:`, enhancedResponse);
    return NextResponse.json(enhancedResponse);
    
  } catch (e: any) {
    console.error('Analysis error:', e);
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 });
  }
}