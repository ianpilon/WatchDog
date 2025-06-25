import OpenAI from 'openai';
import { extractIntervieweeResponses, validatePreprocessing } from './transcriptPreprocessor';

// Helper function to introduce a small delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to update progress with delay
const updateProgress = async (progress, progressCallback) => {
  console.log('Setting Friction Analysis progress to:', progress);
  progressCallback(progress);
  await delay(100);
};

const FRICTION_ANALYSIS_PROMPT = `You are an expert Jobs-To-Be-Done (JTBD) Friction Analyzer. Your task is to analyze a provided transcript to identify friction points that prevent the interviewee from making progress toward their primary goal. Your entire response must be a valid JSON object.

Analysis instructions:
1. Use the "Primary Goal" from the Primary Goal Analysis results (provided separately) as your reference point
2. If the Primary Goal is unavailable, infer it from the transcript and flag this inference
3. Identify specific friction points that obstruct progress toward the primary goal
4. For each friction point, analyze how it creates resistance or blocks advancement

For each friction point, include these fields:
- title: A concise, specific description of the friction
- severity: Rate as "Critical" (blocks goal entirely), "High" (significant delay), "Medium" (moderate hindrance), or "Low" (minor inconvenience)
- impact: A detailed explanation of how this friction prevents or slows progress toward the primary goal
- evidence: Direct quote(s) from the transcript supporting the friction point
- tags: Keywords summarizing affected areas
- recommendations: Actionable suggestions to mitigate or resolve the friction

Your response must be a valid JSON object with this exact structure:
{
  "primaryGoal": "string",
  "frictionAnalysis": [
    {
      "title": "string",
      "severity": "Critical" or "High" or "Medium" or "Low",
      "impact": "string",
      "evidence": "string",
      "tags": ["string", "string"],
      "recommendations": ["string", "string"]
    }
  ],
  "inferences": [
    {
      "assumption": "string",
      "reasoning": "string",
      "quotes": ["string", "string"]
    }
  ]
}

Additional instructions:
- Treat the Primary Goal as the anchor for all friction analysis
- Use the full transcript as the primary source for identifying friction points
- If Pain Analysis results are provided, use them as additional context only if directly relevant
- Be specific about the mechanism of friction (e.g., "forces reliance on outdated data, delaying decisions by weeks")
- If no friction points are found, return an empty frictionAnalysis array with a note in inferences
- Ensure recommendations are practical and tailored to the interviewee's context
- Return ONLY a valid JSON object with no additional text or explanation
`;

export const analyzeFrictionPoints = async (input, progressCallback, apiKey) => {
  if (!apiKey && !localStorage.getItem('llmApiKey')) {
    throw new Error('OpenAI API key is required. Please set your API key first.');
  }

  const openai = new OpenAI({
    apiKey: apiKey || localStorage.getItem('llmApiKey'),
    dangerouslyAllowBrowser: true
  });

  // Start with initial progress
  await updateProgress(2, progressCallback);

  try {
    // Extract the transcript and pain analysis from input
    if (!input || !input.transcript) {
      console.error('Invalid input:', input);
      throw new Error('Invalid input. Transcript is required.');
    }
    
    // Get the complete transcript
    const completeTranscript = input.transcript;
    
    if (!completeTranscript) {
      throw new Error('No transcript content found in input.');
    }
    
    console.log('Received transcript for friction analysis');
    console.log('Transcript length:', completeTranscript.length);
    console.log('Pain analysis available:', !!input.painAnalysis);

    // Preprocess the transcript to extract only interviewee responses
    console.log('Preprocessing transcript to extract interviewee responses...');
    let preprocessed;
    try {
      preprocessed = extractIntervieweeResponses(completeTranscript);
      
      if (!validatePreprocessing(preprocessed)) {
        console.warn('Transcript preprocessing validation failed, using fallback processing');
        // Create a simplified fallback preprocessed object
        preprocessed = {
          processedTranscript: completeTranscript,
          metadata: {
            totalLines: completeTranscript.split('\n').length,
            processedLines: completeTranscript.split('\n').length,
            processedLength: completeTranscript.length,
            responsesExtracted: 1,
            fallbackProcessing: true
          }
        };
      }
    } catch (preprocessError) {
      console.warn('Error during transcript preprocessing, using fallback:', preprocessError);
      // Create a simplified fallback preprocessed object
      preprocessed = {
        processedTranscript: completeTranscript,
        metadata: {
          totalLines: completeTranscript.split('\n').length,
          processedLines: completeTranscript.split('\n').length,
          processedLength: completeTranscript.length,
          responsesExtracted: 1,
          fallbackProcessing: true
        }
      };
    }

    console.log('Preprocessing metadata:', preprocessed.metadata);
    console.log('Starting Friction analysis on preprocessed transcript');

    // Include pain analysis results for enhanced friction detection if available
    let painAnalysisContent = '';
    if (input.painAnalysis) {
      console.log('Including pain analysis in the friction analysis');
      
      const painResults = input.painAnalysis;
      console.log('Pain analysis structure:', Object.keys(painResults));
      
      // Handle the case where painAnalysis might be a string
      let parsedPains = painResults;
      if (typeof painResults === 'string') {
        try {
          parsedPains = JSON.parse(painResults);
          console.log('Successfully parsed string pain results');
        } catch (e) {
          console.warn('Could not parse pain results as JSON, using as-is', e);
        }
      }
      
      painAnalysisContent = `\nPain Analysis: ${JSON.stringify(parsedPains)}`;
    }
    
    // Get the JTBD primary goal analysis if available from input
    let jtbdResults = null;
    let primaryGoalContent = '';
    
    if (input.jtbdResults) {
      console.log('Including JTBD Primary Goal analysis in the friction analysis');
      
      jtbdResults = input.jtbdResults;
      console.log('JTBD structure:', Object.keys(jtbdResults));
      
      // Handle the case where jtbdResults might be a string
      let parsedJtbd = jtbdResults;
      if (typeof jtbdResults === 'string') {
        try {
          parsedJtbd = JSON.parse(jtbdResults);
          console.log('Successfully parsed string JTBD results');
        } catch (e) {
          console.warn('Could not parse JTBD results as JSON, using as-is', e);
        }
      }
      
      primaryGoalContent = `
Primary Goal Analysis: ${JSON.stringify(parsedJtbd)}`;
    } else {
      console.warn('JTBD Primary Goal analysis not available, will infer from transcript');
    }
    
    console.log('Starting friction analysis...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: FRICTION_ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: `Transcript: ${preprocessed.processedTranscript}${primaryGoalContent}${painAnalysisContent}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    });

    // Update progress after analysis
    await updateProgress(85, progressCallback);

    const rawResponse = response.choices[0].message.content.trim();
    
    // Parse analysis results
    let analysisResults = JSON.parse(rawResponse);
    
    // Debug log to verify the JSON output
    console.log("Friction Analysis JSON Output:", JSON.stringify(analysisResults, null, 2));
    
    // Verify that the output includes all expected fields
    if (!analysisResults.frictionAnalysis || !analysisResults.primaryGoal) {
      console.warn("Missing expected fields in friction analysis output:", Object.keys(analysisResults));
    }
    
    // Detailed structure validation
    console.log('Friction Analysis Data Structure:', {
      hasFrictionAnalysis: Array.isArray(analysisResults.frictionAnalysis),
      frictionAnalysisCount: analysisResults.frictionAnalysis?.length || 0,
      hasPrimaryGoal: !!analysisResults.primaryGoal,
      hasInferences: Array.isArray(analysisResults.inferences),
      inferencesCount: analysisResults.inferences?.length || 0
    });

    // Complete the progress
    await updateProgress(100, progressCallback);

    return analysisResults;

  } catch (error) {
    console.error('Error in friction analysis:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    // Create a properly structured error with details
    const enhancedError = new Error(`Friction analysis failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.details = {
      stage: 'friction_analysis',
      inputStructure: {
        hasTranscript: !!input?.transcript,
        hasPainAnalysis: !!input?.painAnalysis,
        hasJtbdResults: !!input?.jtbdResults,
        inputKeys: input ? Object.keys(input) : []
      }
    };
    throw enhancedError;
  }
};
