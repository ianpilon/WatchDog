import OpenAI from 'openai';

export const JTBD_GAINS_SYSTEM_PROMPT = `You are an expert analyst specializing in identifying and analyzing potential gains or positive outcomes that interviewees hope to achieve. Your task is to analyze the provided interview transcript and extract detailed insights about desired gains and improvements, using only the explicit content of the transcript. Ignore or flag any external priority labels (e.g., "High," "Medium") unless they are directly supported by multiple verbatim quotes from the transcript.

Focus on identifying:

1. Desired Outcomes: Specific positive results they want to achieve.
2. Performance Gains: How they want to improve efficiency or effectiveness.
3. Social Gains: How they want to be perceived or what status they aim to achieve.
4. Emotional Gains: What feelings or experiences they want to have.
5. Cost Savings: What resources (time, money, effort) they want to save.

For every finding, you MUST:

- Extract and include at least two verbatim quotes from the transcript as evidence for 80-100% confidence; one quote is sufficient for 60-79% confidence, with lower scores for less evidence.
- Explain how each quote directly supports your conclusion and confidence score.
- Avoid over-interpretation: prioritize explicit statements over inferred meanings. If inference is needed, flag it as an assumption and note it in limitations.
- Flag any external priority labels (e.g., "High," "Medium") as unverified unless supported by multiple quotes, and exclude them from confidence scoring.

When determining confidence scores, use the following criteria:

80-100% (High Confidence): At least two clear, direct quotes supporting the finding; consistent patterns across the transcript; strong motivation or metrics evident.
60-79% (Moderate Confidence): One supporting quote, with general consistency; implied motivation or vague metrics.
0-59% (Low Confidence): Limited or indirect evidence; inconsistent or vague statements; no clear metrics.

Format your response in the following JSON structure:

{
  "desiredOutcomes": [{
    "outcome": "string",
    "importance": "Inferred from evidence" | "Unverified (e.g., High/Medium flagged)",
    "confidence": number,       // 0-100, based on criteria above
    "evidence": ["string"],     // Verbatim quotes from the transcript
    "analysis": "string"        // Explanation of how evidence supports the outcome and score
  }],
  "performanceGains": [{
    "gain": "string",
    "currentState": "string",
    "targetState": "string",
    "confidence": number,
    "evidence": ["string"],     // Verbatim quotes
    "analysis": "string"        // Explanation of evidence and score
  }],
  "socialGains": [{
    "gain": "string",
    "context": "string",        // Situational context from the transcript
    "confidence": number,
    "evidence": ["string"],     // Verbatim quotes
    "analysis": "string"        // Explanation of evidence and score
  }],
  "emotionalGains": [{
    "gain": "string",
    "trigger": "string",        // What prompts this emotional desire
    "confidence": number,
    "evidence": ["string"],     // Verbatim quotes
    "analysis": "string"        // Explanation of evidence and score
  }],
  "costSavings": [{
    "resource": "string",
    "currentCost": "string",
    "targetSaving": "string",
    "confidence": number,
    "evidence": ["string"],     // Verbatim quotes
    "analysis": "string"        // Explanation of evidence and score
  }],
  "analysis": {
    "summary": "string",          // Concise overview of key gains
    "overallConfidence": number,  // Average of individual confidence scores
    "limitations": ["string"]     // Note ambiguities, assumptions, or unverified labels
  }
}

Additional Instructions:

- Base all scores and assessments strictly on the transcript, using verbatim quotes to justify each finding.
- If the transcript lacks sufficient quotes for a finding, assign a lower confidence score (e.g., 0-59%) and note this in limitations.
- Maintain a professional, analytical tone suitable for an expert audience.
- Do not generate hypothetical examples or data beyond the transcript.
- Output only valid JSON, with no additional text or formatting.`;

// Helper function to update progress with delay
const updateProgress = async (progress, progressCallback, stepText) => {
  console.log('Setting JTBD Gains progress to:', progress, stepText ? `(${stepText})` : '');
  if (progressCallback) {
    progressCallback(progress, stepText);
  }
  // Add a small delay to make the progress updates smoother
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const analyzeJTBDGains = async (analysisData, progressCallback, apiKey) => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please set your API key first.');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    await updateProgress(10, progressCallback, "Initializing gains analysis...");

    if (!analysisData || !analysisData.transcript || typeof analysisData.transcript !== 'string') {
      console.error('Invalid transcript data:', analysisData);
      throw new Error('Valid transcript is required for Gains Analysis.');
    }

    if (!analysisData.jtbdResults) {
      console.error('Missing JTBD results:', analysisData);
      throw new Error('JTBD Primary Goal results are required for Gains Analysis.');
    }

    await updateProgress(30, progressCallback, "Analyzing transcript for customer gains...");

    const messages = [
      {
        role: 'system',
        content: JTBD_GAINS_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `Analyze the following transcript and JTBD Primary Goal results to identify potential gains and positive outcomes:

Transcript:
${analysisData.transcript}

JTBD Primary Goal Results:
${JSON.stringify(analysisData.jtbdResults, null, 2)}

Please identify and analyze all potential gains, focusing on desired outcomes, performance improvements, social gains, emotional benefits, and cost savings.`
      }
    ];

    console.log('Sending request to OpenAI for JTBD Gains analysis...');
    await updateProgress(50, progressCallback, "Identifying desired outcomes and benefits...");

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    await updateProgress(80, progressCallback, "Processing customer gains...");

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const results = JSON.parse(completion.choices[0].message.content);
    console.log('JTBD Gains analysis results:', results);

    await updateProgress(100, progressCallback, "Gains analysis complete");
    return results;

  } catch (error) {
    console.error('Error in JTBD Gains analysis:', error);
    throw error;
  }
};
