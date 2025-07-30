// Test Hugging Face API directly
const { HfInference } = require('@huggingface/inference');

async function testHuggingFaceAPI() {
  console.log('🧪 Testing Hugging Face API...');
  
  const token = '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';
  console.log('Using token:', token.substring(0, 10) + '...');
  
  const hf = new HfInference(token);
  
  // Try multiple models to see which ones work
  const modelsToTest = [
    'gpt2',
    'microsoft/DialoGPT-medium',
    'google/flan-t5-small',
    'google/flan-t5-base'
  ];
  
  for (const model of modelsToTest) {
    try {
      console.log(`\n🔄 Testing model: ${model}...`);
      
      const response = await hf.textGeneration({
        model: model,
        inputs: 'Create a simple study plan for learning JavaScript.',
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          return_full_text: false,
        }
      });

      console.log(`✅ SUCCESS with ${model}!`);
      console.log('Generated text:', response.generated_text);
      
      // If we get here, this model works
      console.log(`\n🎉 Working model found: ${model}`);
      break;
      
    } catch (error) {
      console.error(`❌ Model ${model} failed:`, error.message);
      
      if (error.message.includes('401')) {
        console.log('🔑 Token issue - check if token is valid');
      } else if (error.message.includes('429')) {
        console.log('⏱️  Rate limit - too many requests');
      } else if (error.message.includes('503')) {
        console.log('🚧 Model loading - try again in a moment');
      } else if (error.message.includes('blob')) {
        console.log('🌐 Network/blob fetching issue - try different model');
      }
    }
  }
}

testHuggingFaceAPI();
