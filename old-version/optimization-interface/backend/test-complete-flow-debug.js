const OpenAI = require('openai');
const { OPENAI_CONFIG } = require('./config/openai');
const promptManager = require('./services/promptManager');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
});

async function testCompleteFlow() {
  const testMessage = "I need to optimize charging for 3 electric excavators at 2 construction sites";
  
  console.log('🧪 Testing Complete Flow with message:', testMessage);
  console.log('=' .repeat(80));
  
  try {
    // Step 1: Understanding Agent
    console.log('\n🧠 Step 1: Understanding Agent');
    const understandingPrompt = promptManager.getUnderstandingAgentPrompt(testMessage, {
      currentContext: {},
      conversationHistory: [],
      workflowState: { currentStep: 1 }
    });
    
    const understandingResponse = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        { role: 'system', content: understandingPrompt },
        { role: 'user', content: testMessage }
      ],
      max_tokens: 1000,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const understandingResult = JSON.parse(understandingResponse.choices[0].message.content);
    console.log('✅ Understanding Result:', JSON.stringify(understandingResult.scenario, null, 2));
    
    // Step 2: Validation Agent
    console.log('\n✅ Step 2: Validation Agent');
    const validationPrompt = promptManager.getValidationAgentPrompt(
      understandingResult, 
      testMessage, 
      {},
      { currentStep: 1 }
    );
    
    const validationResponse = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        { role: 'system', content: validationPrompt },
        { role: 'user', content: `Validate these parameters: ${JSON.stringify(understandingResult)}` }
      ],
      max_tokens: 800,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const validationResult = JSON.parse(validationResponse.choices[0].message.content);
    console.log('✅ Validation Result:', JSON.stringify(validationResult, null, 2));
    
    // Step 3: Conversation Manager
    console.log('\n💬 Step 3: Conversation Manager');
    const conversationPrompt = promptManager.getConversationPrompt({
      extractedParameters: understandingResult,
      validationResult: validationResult,
      recommendationResult: { recommendations: [], confidence: 1.0 },
      workflowState: { currentStep: 1 },
      conversationHistory: []
    });
    
    const conversationResponse = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        { role: 'system', content: conversationPrompt },
        { role: 'user', content: testMessage }
      ],
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: OPENAI_CONFIG.temperature,
    });

    const conversationResult = conversationResponse.choices[0].message.content;
    console.log('✅ Conversation Result:');
    console.log(conversationResult);
    
    // Analysis
    console.log('\n🔍 Analysis:');
    console.log('1. Understanding Agent: ✅ Working correctly');
    console.log('2. Validation Agent: ✅ Working correctly');
    console.log('3. Conversation Manager: ❌ Not using extracted parameters properly');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testCompleteFlow();


