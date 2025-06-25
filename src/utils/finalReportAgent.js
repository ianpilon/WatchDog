import OpenAI from 'openai';

const BEHAVIORAL_REPORT_SYSTEM_PROMPT = `You are an expert leadership and behavioral analyst.
Your task is to synthesize the provided behavioral analysis data, which originates from two analysis agents:
1. 'jtbdPrimaryGoalAgent' (Idea Guy Diminisher Analysis)
2. 'alwaysOnDiminisherAgent' (Always On Diminisher Analysis)

Integrate both analyses into a comprehensive "Final Behavioral Report".

The input will be a JSON object containing two main sections - one for each agent's results - detailing detected 'Multiplier' and 'Diminisher' behaviors, associated sentiments, and specific examples from a conversation transcript.

Your report should focus on:
- An overall summary of the observed behavioral patterns.
- Key examples of Multiplier behaviors, highlighting their context and potential impact.
- Key examples of Diminisher behaviors, highlighting their context and potential impact.
- Notable sentiment trends observed in relation to specific behaviors or conversational segments.
- Actionable insights or areas for leadership development based on the findings.

Output your analysis in the following JSON format:

{
  "reportTitle": "Final Behavioral Report",
  "behavioralOverview": "string",
  "multiplierInsights": {
    "summary": "string",
    "keyExamples": [
      {
        "behaviorType": "string",
        "specificExample": "string",
        "analysis": "string",
        "observedImpact": "string"
      }
    ],
    "overallStrengthsDemonstrated": ["string"]
  },
  "diminisherInsights": {
    "summary": "string",
    "keyExamples": [
      {
        "behaviorType": "string",
        "specificExample": "string",
        "analysis": "string",
        "observedImpact": "string"
      }
    ],
    "areasForDevelopment": ["string"]
  },
  "sentimentPatterns": {
    "overallSentiment": "string",
    "keyObservations": [
      {
        "observation": "string",
        "linkedBehavior": "string"
      }
    ]
  },
  "actionableRecommendations": [
    {
      "recommendation": "string",
      "focusArea": "string"
    }
  ],
  "reportConfidence": {
    "score": "number",
    "reasoning": "string"
  }
}
`;

// Helper function to update progress with minimal delay
const updateProgress = async (progress, progressCallback, stepText) => {
  console.log('Setting Final Behavioral Report progress to:', progress, stepText ? `(${stepText})` : '');
  if (progressCallback) {
    progressCallback(progress, stepText);
  }
  await new Promise(resolve => setTimeout(resolve, 50));
};

export const generateFinalReport = async (allResults, progressCallback, apiKey) => {
  console.log('Starting Final Behavioral Report generation with:', {
    hasResults: !!allResults,
    resultKeys: Object.keys(allResults || {}),
    hasApiKey: !!apiKey,
    hasProgressCallback: !!progressCallback
  });

  if (!apiKey) {
    console.error('Missing API key for Final Behavioral Report');
    throw new Error('OpenAI API key is required. Please set your API key first.');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    await updateProgress(15, progressCallback, "Preparing behavioral report data...");

    // Check for required results
    if (!allResults || !allResults.jtbd) {
      console.error('Missing jtbd (Idea Guy Analysis) results for Final Behavioral Report:', allResults);
      throw new Error('Idea Guy Analysis (jtbd) results are required to generate the Final Behavioral Report.');
    }

    // Extract results from both agents
    const jtbdAnalysisResults = allResults.jtbd;
    const alwaysOnAnalysisResults = allResults.alwaysOn || null;
    
    // Log whether we have Always On results
    if (alwaysOnAnalysisResults) {
      console.log('Always On analysis results available for Final Behavioral Report');
    } else {
      console.log('Always On analysis results not available - report will be based primarily on Idea Guy analysis');
    }

    // Validate structure of jtbdAnalysisResults if necessary (basic check here)
    if (typeof jtbdAnalysisResults !== 'object' || jtbdAnalysisResults === null) {
        console.error('Invalid jtbdAnalysisResults structure:', jtbdAnalysisResults);
        throw new Error('jtbdAnalysisResults is not a valid object.');
    }
    
    // Log key aspects of results to verify content
    console.log('Received jtbdAnalysisResults with keys:', Object.keys(jtbdAnalysisResults));
    if (jtbdAnalysisResults.analysisSummary) {
        console.log('jtbd analysisSummary:', jtbdAnalysisResults.analysisSummary.substring(0, 100) + '...');
    }
    
    if (alwaysOnAnalysisResults) {
      console.log('Received alwaysOnAnalysisResults with keys:', Object.keys(alwaysOnAnalysisResults));
      // Log a sample of Always On data if available
      const sampleKey = Object.keys(alwaysOnAnalysisResults)[0];
      if (sampleKey) {
        const sample = alwaysOnAnalysisResults[sampleKey];
        console.log(`alwaysOn ${sampleKey} sample:`, 
          typeof sample === 'string' ? sample.substring(0, 100) + '...' : 'Non-string value');
      }
    }

    await updateProgress(30, progressCallback, "Synthesizing behavioral findings...");

    const behavioralReportMessages = [
      {
        role: 'system',
        content: BEHAVIORAL_REPORT_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `Please analyze these behavioral findings and generate a comprehensive Final Behavioral Report as a JSON object.

1. Idea Guy Agent Results:
${JSON.stringify(jtbdAnalysisResults, null, 2)}

${alwaysOnAnalysisResults ? `2. Always On Agent Results:
${JSON.stringify(alwaysOnAnalysisResults, null, 2)}` : `2. Always On Agent Results: Not available for this analysis.`}`
      }
    ];

    console.log('Sending request to OpenAI for Final Behavioral Report generation...');
    
    // Log message sizes for debugging if needed
    const systemPromptTokens = encode(behavioralReportMessages[0].content).length;
    const userMessageTokens = encode(behavioralReportMessages[1].content).length;
    console.log(`System Prompt Tokens: ${systemPromptTokens}, User Message Tokens: ${userMessageTokens}, Total Approx: ${systemPromptTokens + userMessageTokens}`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Or your preferred model
      messages: behavioralReportMessages,
      response_format: { type: "json_object" },
      temperature: 0.5, // Adjusted for more factual synthesis
      max_tokens: 3000 // Increased to accommodate potentially detailed behavioral reports
    });

    await updateProgress(80, progressCallback, "Finalizing behavioral report...");

    let rawResponseContent = response.choices[0].message.content;
    // Basic cleaning for markdown ```json ... ``` often returned by models
    rawResponseContent = rawResponseContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    const behavioralReport = JSON.parse(rawResponseContent);

    if (!behavioralReport.reportTitle || !behavioralReport.behavioralOverview) {
      console.error('Invalid Final Behavioral Report structure:', behavioralReport);
      throw new Error('Invalid Final Behavioral Report structure. Missing reportTitle or behavioralOverview.');
    }

    await updateProgress(100, progressCallback, "Final Behavioral Report complete");
    console.log('Final Behavioral Report generation complete');

    return behavioralReport;

  } catch (error) {
    console.error('Error in Final Behavioral Report Generation:', error);
    // Log the problematic content if it's a parse error
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('Problematic JSON content:', error.failedContent || 'Content not captured');
    }
    throw error;
  }
};

// Helper function for token encoding (assuming gpt-tokenizer or similar is available)
// If not, this can be removed or adapted.
// Ensure you have 'gpt-tokenizer' installed or a similar library for token counting.
import { encode } from 'gpt-tokenizer'; 
