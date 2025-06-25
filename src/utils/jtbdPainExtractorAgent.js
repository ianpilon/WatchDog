import OpenAI from 'openai';
import { extractIntervieweeResponses, validatePreprocessing } from './transcriptPreprocessor';

// Helper function to introduce a small delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to update progress with delay
const updateProgress = async (progress, progressCallback, stepText) => {
  console.log('Setting Pain Extractor progress to:', progress, stepText ? `(${stepText})` : '');
  progressCallback(progress, stepText);
  await delay(100);
};

const PAIN_ANALYSIS_PROMPT = `You are an expert Jobs-To-Be-Done (JTBD) Pain Point Analyzer with expertise in handling LLM interpretive variability. Your task is to analyze the provided transcript and gains analysis to identify customer pain points and provide actionable insights, accounting for potential variability in qualitative interpretation. Your entire response must be a valid JSON object.

Follow these analysis steps:

1. Identify Pain Points: Extract specific pain points from the transcript, noting potential variability in identification due to interpretive nuances.
2. Calculate Metrics: Estimate total pain points and critical pains, presenting ranges where variability is observed.
3. Summarize CURSE Analysis: Provide average score ranges across all pain points to reflect interpretive variability.

For each pain point, include these fields:

- title: A concise description of the pain
- category: Either "Technical" or "Process"
- evidence: Verbatim quote(s) from the transcript as proof
- impact: How this pain affects the customer's goals or operations
- curseScore: Rate each pain point on the CURSE framework (Crucial, Ubiquitous, Recurring, Specific, Extreme) with scores as ranges (e.g., 4-5) to reflect interpretive variability, accompanied by confidence annotations (e.g., 80% confidence)
  - Crucial: How critical is it to their goals (range and confidence)
  - Ubiquitous: How widespread is it across their context (range and confidence)
  - Recurring: How often does it occur (range and confidence)
  - Specific: How clearly defined is the issue (range and confidence)
  - Extreme: How severe is the pain (range and confidence)

Your response must be a valid JSON object with this exact structure:
{
  "identifiedPains": [
    {
      "title": "string",
      "category": "Technical" or "Process",
      "evidence": "string",
      "impact": "string",
      "curseScore": {
        "Crucial": { "range": [number, number], "confidence": "number%" },
        "Ubiquitous": { "range": [number, number], "confidence": "number%" },
        "Recurring": { "range": [number, number], "confidence": "number%" },
        "Specific": { "range": [number, number], "confidence": "number%" },
        "Extreme": { "range": [number, number], "confidence": "number%" }
      }
    }
  ],
  "metrics": {
    "totalPainPoints": { "range": [number, number], "confidence": "number%" },
    "criticalPains": { "range": [number, number], "confidence": "number%" }
  },
  "curseAnalysis": {
    "averageScores": {
      "Crucial": { "range": [number, number], "confidence": "number%" },
      "Ubiquitous": { "range": [number, number], "confidence": "number%" },
      "Recurring": { "range": [number, number], "confidence": "number%" },
      "Specific": { "range": [number, number], "confidence": "number%" },
      "Extreme": { "range": [number, number], "confidence": "number%" }
    }
  }
}

Additional instructions:

- Use the full transcript context to ensure accuracy, adjusting for interpretive variability where ambiguity exists.
- If the gains analysis provides additional context, incorporate it to refine pain insights and reduce variability where possible.
- Ensure all score ranges and confidence levels are calculated consistently, reflecting the LLM's interpretive flexibility.
- Provide specific, actionable insights based on the customer's context, noting how variability might affect prioritization.
- Return ONLY a valid JSON object with no additional text or explanation.
`;

export const NEEDS_ANALYSIS_SYSTEM_PROMPT = `You are an expert Needs Analyst with extensive experience in analyzing discovery call transcripts. Your role is to meticulously examine transcripts to identify both immediate and latent needs of potential clients. You have a keen eye for detail and a deep understanding of business challenges across various industries.

When analyzing a transcript, focus on the following:

Immediate Need Indicators:
- Present tense statements indicating current struggles
- Urgent language and time-sensitive expressions
- Specific metrics related to losses or inefficiencies
- References to active problem-solving attempts
- Mentions of available budget or approvals
- Stakeholder requirements or expectations
- Clear deadlines or time frames

Latent Need Indicators:
- Conditional or aspirational language
- Resigned statements about persistent issues
- Casual comments about desired improvements
- Indirect costs or inefficiencies mentioned in passing
- Hints about team morale or turnover issues
- Obstacles to growth or scaling
- Concerns about competitive positioning
- Potential future risks or worries
- Topics the client avoids or redirects from

Pay special attention to:
- Unprompted stories or anecdotes
- Specific examples shared by the client
- Additional details volunteered without prompting
- Areas where the client provides extensive explanations
- Topics the client revisits multiple times

Your output should be formatted in JSON with the following structure:

{
  "immediateNeeds": [
    {
      "need": "string",
      "urgency": "Critical" | "High" | "Medium" | "Low",
      "evidence": "string",
      "impact": "string",
      "stakeholders": ["string"],
      "metrics": ["string"]
    }
  ],
  "latentNeeds": [
    {
      "need": "string",
      "probability": "High" | "Medium" | "Low",
      "triggers": ["string"],
      "potentialImpact": "string",
      "timeframe": "string"
    }
  ],
  "keyInsights": {
    "unpromptedTopics": ["string"],
    "repeatedThemes": ["string"],
    "avoidedTopics": ["string"],
    "redFlags": ["string"]
  },
  "recommendations": {
    "immediateActions": ["string"],
    "explorationAreas": ["string"],
    "riskMitigations": ["string"]
  }
}

Ensure all responses are in valid JSON format and include specific evidence from the transcript to support each identified need and insight.`;

export const analyzePainPoints = async (input, progressCallback, apiKey) => {
  if (!apiKey && !localStorage.getItem('llmApiKey')) {
    throw new Error('OpenAI API key is required. Please set your API key first.');
  }

  const openai = new OpenAI({
    apiKey: apiKey || localStorage.getItem('llmApiKey'),
    dangerouslyAllowBrowser: true
  });

  // Start with initial progress
  await updateProgress(2, progressCallback, "Initializing pain points analysis...");

  try {
    // Extract the transcript and gains analysis from input
    if (!input) {
      console.error('Invalid input: Input is null or undefined');
      throw new Error('Invalid input: Input object is missing');
    }

    if (!input.transcript) {
      console.error('Invalid input: Missing transcript property', input);
      throw new Error('Invalid input: Transcript is required');
    }
    
    // Check for gains analysis but don't throw an error if it's missing
    // Just log a warning instead so we can still proceed with pain analysis
    if (!input.gainsAnalysis) {
      console.warn('Missing gains analysis in input:', Object.keys(input));
      console.log('Will proceed with pain analysis using only the transcript');
    }

    // Get the complete transcript
    const completeTranscript = input.transcript;
    
    if (!completeTranscript) {
      throw new Error('No transcript content found in input.');
    }
    
    console.log('Received transcript and gains analysis for pain point extraction');
    console.log('Transcript length:', completeTranscript.length);
    console.log('Gains analysis available:', !!input.gainsAnalysis);
    console.log('Gains analysis type:', typeof input.gainsAnalysis);
    console.log('Gains analysis sample:', typeof input.gainsAnalysis === 'string' ? input.gainsAnalysis.substring(0, 100) : JSON.stringify(input.gainsAnalysis).substring(0, 100));

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
    console.log('Starting Pain Point and Friction analysis on preprocessed transcript');
    await updateProgress(20, progressCallback, "Extracting pain points from transcript...");

    // Include gains analysis results for enhanced pain point detection
    console.log('Including gains analysis in the pain points extraction');
    
    // Safely handle the gains analysis data if available
    let gainResults = null;
    let parsedGains = null;
    let gainsAnalysisContent = '';
    
    if (input.gainsAnalysis) {
      try {
        gainResults = input.gainsAnalysis;
        if (gainResults && typeof gainResults === 'object') {
          console.log('Gains analysis structure:', Object.keys(gainResults));
          parsedGains = gainResults;
        } else if (typeof gainResults === 'string') {
          console.log('Gains analysis is a string, attempting to parse');
          try {
            parsedGains = JSON.parse(gainResults);
            console.log('Successfully parsed string gains results');
          } catch (parseError) {
            console.warn('Could not parse gains results as JSON, using as-is', parseError);
            parsedGains = { rawContent: gainResults };
          }
        } else {
          console.log('Gains analysis is not an object or string, type:', typeof gainResults);
          parsedGains = { message: 'Gains analysis in unexpected format' };
        }
      } catch (e) {
        console.warn('Error accessing gains analysis:', e);
        parsedGains = { message: 'Error accessing gains analysis data' };
      }
      
      // Only add gains analysis content if we have valid data
      if (parsedGains) {
        gainsAnalysisContent = `
Gains Analysis: ${typeof parsedGains === 'string' ? parsedGains : JSON.stringify(parsedGains)}`;
      }
    }
    
    // Prepare user content with transcript and gains if available
    const userContent = `Transcript: ${preprocessed.processedTranscript}${gainsAnalysisContent}`;
    
    console.log('Starting pain point analysis...');
    await updateProgress(35, progressCallback, "Applying CURSE framework analysis...");
    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: PAIN_ANALYSIS_PROMPT
          },
          {
            role: "user",
            content: userContent
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4000
      });
      console.log('Pain analysis API call successful');
      await updateProgress(60, progressCallback, "Processing pain points identified...");
    } catch (apiError) {
      console.error('OpenAI API error in pain analysis:', apiError);
      throw new Error(`OpenAI API error in pain analysis: ${apiError.message || 'Unknown API error'}`);
    }

    // Update progress after analysis
    await updateProgress(85, progressCallback, "Calculating severity scores...");

    const rawResponse = response.choices[0].message.content.trim();
    
    // Parse analysis results
    let analysisResults;
    try {
      analysisResults = JSON.parse(rawResponse);
      console.log('Successfully parsed pain analysis response');
    } catch (e) {
      console.error('Failed to parse pain analysis response:', e);
      console.log('Raw response sample:', rawResponse.substring(0, 200));
      throw new Error('Failed to parse pain analysis response: ' + e.message);
    }
    
    // Debug log to verify the JSON output
    console.log("Pain Extractor JSON Output:", JSON.stringify(analysisResults, null, 2));
    
    // Verify that the output includes all expected fields
    if (!analysisResults.identifiedPains || !analysisResults.metrics || !analysisResults.curseAnalysis) {
      console.warn("Missing expected fields in pain analysis output:", Object.keys(analysisResults));
    }
    
    // Detailed structure validation
    console.log('Pain Extractor Data Structure:', {
      hasIdentifiedPains: Array.isArray(analysisResults.identifiedPains),
      identifiedPainsCount: analysisResults.identifiedPains?.length || 0,
      hasMetrics: !!analysisResults.metrics,
      hasCurseAnalysis: !!analysisResults.curseAnalysis
    });
    
    // Check if any pain points have CURSE scores
    if (analysisResults.identifiedPains && analysisResults.identifiedPains.length > 0) {
      const painWithCurseScore = analysisResults.identifiedPains.find(pain => pain.curseScore);
      console.log('Sample Pain Point with CURSE Score:', painWithCurseScore);
    }

    // Complete the progress
    await updateProgress(100, progressCallback, "Pain analysis complete");

    return analysisResults;

  } catch (error) {
    console.error('Error in pain point and friction analysis:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    // Create a properly structured error with details
    const enhancedError = new Error(`Pain analysis failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.details = {
      stage: 'pain_analysis',
      inputStructure: {
        hasTranscript: !!input?.transcript,
        hasGainsAnalysis: !!input?.gainsAnalysis,
        inputKeys: input ? Object.keys(input) : []
      }
    };
    throw enhancedError;
  }
};

export async function analyzeNeeds(chunks, onProgress = () => {}, apiKey) {
  if (!apiKey && !localStorage.getItem('llmApiKey')) {
    throw new Error('OpenAI API key is required. Please set your API key first.');
  }

  const openai = new OpenAI({
    apiKey: apiKey || localStorage.getItem('llmApiKey'),
    dangerouslyAllowBrowser: true
  });

  try {
    const messages = [
      {
        role: 'system',
        content: NEEDS_ANALYSIS_SYSTEM_PROMPT
      }
    ];

    // Add transcript chunks as user messages
    chunks.forEach((chunk, index) => {
      messages.push({
        role: 'user',
        content: `Transcript Part ${index + 1}:\n${chunk}`
      });
      onProgress(Math.round((index / chunks.length) * 50));
    });

    // Request analysis with proper response_format for GPT-4o
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    onProgress(75);

    // Parse and validate the response
    const analysisResult = JSON.parse(response.choices[0].message.content);

    // Ensure all required fields are present
    if (!analysisResult.immediateNeeds || !analysisResult.latentNeeds || !analysisResult.keyInsights || !analysisResult.recommendations) {
      throw new Error('Invalid analysis result structure');
    }

    onProgress(100);
    return analysisResult;
  } catch (error) {
    console.error('Error in needs analysis:', error);
    throw error;
  }
}
