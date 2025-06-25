import OpenAI from 'openai';

export const JTBD_PRIMARY_GOAL_SYSTEM_PROMPT = `Detecting "The Idea Guy" Diminisher (for Self-Reflection & Future Coaching)
You are an expert leadership coach. Your task is to analyze the following transcript of a real conversation between a manager and their team member(s). The primary purpose of this analysis is for the manager's self-reflection, to identify potential 'Accidental Diminisher' patterns, and to eventually inform coaching and training. Your analysis should focus only on identifying behaviors consistent with 'The Idea Guy' Accidental Diminisher profile.

Context for Analysis:
• Goal: Manager's self-reflection and future coaching.
• Transcript Type: Real, recorded conversation.
• Setting: Could be any manager-team interaction (one-on-one, project update, problem-solving, performance discussion, etc.).
• Focus: Identify both overt examples and subtle cues of 'The Idea Guy' behavior.
• Intent vs. Impact: Consider the manager's likely positive intent but analyze the potential diminishing impact on the team member(s).
• Evidence: Your analysis must be based solely on the provided transcript. Quote specific examples. Do not infer or invent information.
• Nuance: Provide a simple "Yes/No/Possibly" for obvious behaviors with a brief explanation. For more nuanced context or subtle cues, provide a more in-depth analysis of why something is or isn't this particular behavior.
• Frequency/Intensity: If the behavior is observed, comment on its frequency or intensity within this interaction.
• Alternative Multiplier Approach: If 'Idea Guy' diminishing behavior is identified, briefly suggest an alternative Multiplier approach the manager could have taken in that specific instance.

Transcript:
[Insert Transcript of Manager-Subordinate Interview Here]

Analysis for 'The Idea Guy' Accidental Diminisher Profile:
'The Idea Guy' is a creative, innovative thinker who loves an idea-rich environment and is a veritable fountain of ideas.

• Likely Positive Intent: To spark ideas in others, to be creative and helpful.
• Potential Diminishing Impact: The team chases too many ideas, progress on existing work stalls, people become idea-lazy waiting for the manager's next idea, and may stop generating their own.

Analyze the manager's contributions based on the transcript:
1. Does the manager rapidly generate multiple new ideas, suggestions, or possibilities, potentially overwhelming the team member or shifting focus frequently from the current topic or previously established plans?
2. Does the manager introduce new concepts or directions before the team member has had a chance to fully explore, develop, or implement previous ones?
3. Does the manager's enthusiasm for their own new thoughts appear to overshadow, interrupt, or derail the team member's line of thinking, contributions, or work on existing priorities?
4. Is there evidence that the team member might be struggling to keep up with the influx of ideas, or that existing initiatives might be left unfinished due to the introduction of new ones by the manager?
5. Does the manager provide space and encouragement for the team member's ideas to be fully developed and explored, or do they predominantly drive the ideation?

Format your response as a JSON object using the LLM Output Structure below.

LLM Output Structure:
1. Overall Assessment:
   • Does the manager exhibit 'Idea Guy' tendencies in this interaction? (Yes/No/Possibly)
2. Confidence Score in this Assessment:
   • High Confidence (80-100%): Multiple clear, direct quotes supporting the finding; consistent patterns across different parts of the transcript; minimal contradictions or ambiguity.
   • Moderate Confidence (60-79%): Some supporting quotes but may be less direct; patterns exist but with some inconsistencies; some ambiguity or potential alternative interpretations.
   • Low Confidence (0-59%): Limited or indirect supporting evidence; inconsistent or contradictory patterns; high ambiguity or multiple competing interpretations.
   • Justification for Confidence Score: [Briefly explain why this confidence level was chosen, referencing the nature of the evidence.]
3. Detailed Analysis & Evidence:
   • Specific Examples: [Quote specific phrases or interactions from the manager in the transcript that support your "Overall Assessment." For each quote, explain why it points to 'The Idea Guy' behavior, considering intent vs. potential impact.]
   • Subtle Cues (if any): [If applicable, describe any subtle cues or more nuanced patterns that suggest 'The Idea Guy' tendency.]
   • Frequency/Intensity: [Comment on how often or how strongly this behavior appears in the transcript.]
   • Impact on Team Member (Observed or Potential): [Based on the transcript, describe any observed reactions from the team member or the potential impact this behavior might have on them.]
4. Suggested Alternative (Multiplier) Approach (if 'Idea Guy' diminishing behavior is identified):
   • [For one key instance identified, briefly suggest how the manager could have approached it as a 'Challenger' or 'Liberator' to better engage the team member. Be specific to the transcript content.]
5. If 'Idea Guy' behavior is not evident:
   • [State clearly: "Based on this transcript, there is no clear evidence of the manager exhibiting 'The Idea Guy' Accidental Diminisher behavior." Briefly explain why, if useful.]`;

const SYNTHESIS_PROMPT = `You are an expert behavioral analyst specializing in identifying 'The Idea Guy' Accidental Diminisher patterns from conversation transcripts. You will be provided with a series of JSON objects, each representing an analysis of a segment of a manager-team member conversation.

Your task is to synthesize these individual segment analyses into a single, cohesive JSON object that represents the overall patterns and conclusions for the entire conversation. Create a unified view that:
1. Determines the overall assessment of 'Idea Guy' behavior for the entire interaction.
2. Calculates a consolidated confidence score, justifying it based on the consistency and strength of evidence across all segments.
3. Combines and deduplicates specific examples and subtle cues from individual analyses, ensuring a comprehensive list of evidence.
4. Summarizes the frequency, intensity, and overall impact (observed or potential) of the behavior across the entire conversation.
5. If 'Idea Guy' behavior is identified, provides a consolidated and impactful suggested alternative (Multiplier) approach, drawing from the most relevant suggestions in the segment analyses or forming a new overarching one.
6. If 'Idea Guy' behavior is not evident across the entirety, this should be clearly stated and justified.

IMPORTANT: Format your final synthesized response as a JSON object using the exact structure below. Ensure all fields are present and populated according to your synthesized findings.

LLM Output Structure for Synthesized Analysis:
{
  "Overall Assessment": "Yes/No/Possibly",
  "Confidence Score in this Assessment": "High Confidence (80-100%)/Moderate Confidence (60-79%)/Low Confidence (0-59%)",
  "Justification for Confidence Score": "[Briefly explain why this confidence level was chosen, referencing the consistency and strength of evidence across all analyzed segments.]",
  "Detailed Analysis & Evidence": {
    "Specific Examples": [
      {
        "quote": "[Quote specific phrases or interactions from the manager in the transcript that support your 'Overall Assessment'.]",
        "explanation": "[Explain why this quote points to 'The Idea Guy' behavior, considering intent vs. potential impact.]"
      }
      // ... more examples if found across segments
    ],
    "Subtle Cues (if any)": "[Describe any subtle cues or more nuanced patterns observed across segments that suggest 'The Idea Guy' tendency.]",
    "Frequency/Intensity": "[Comment on how often or how strongly this behavior appears across the entire transcript.]",
    "Impact on Team Member (Observed or Potential)": "[Based on the entire transcript, describe any observed reactions from the team member or the potential impact this behavior might have on them.]"
  },
  "Suggested Alternative (Multiplier) Approach (if 'Idea Guy' diminishing behavior is identified)": {
    "description": "[For the most significant instance or a common pattern identified across segments, suggest how the manager could have approached it as a 'Challenger' or 'Liberator' to better engage the team member. Be specific to the transcript content.]"
  },
  "If 'Idea Guy' behavior is not evident": {
    "statement": "[State clearly: 'Based on this transcript, there is no clear evidence of the manager exhibiting \'The Idea Guy\' Accidental Diminisher behavior.' Briefly explain why, drawing from the overall analysis of all segments.]"
  }
}

Please ensure your output is a single, valid JSON object adhering to this structure. Synthesize the information from the provided chunk analyses:
`;

const IDEA_GUY_CONTEXT_PROMPT = `Contextual “Idea Guy” Assessment (Broader, Subtle-Cue Focus)
You are an expert leadership coach. Analyse the transcript holistically to surface any weaker or borderline signs of the manager acting as an “Idea Guy” Accidental Diminisher.  
Unlike the strict check, this pass should:
• Look for patterns that, when combined, could still reduce team ownership or focus.  
• Identify indirect or implied impacts (e.g. team hesitation, frequent topic-switching, idea overload).  
• Be willing to say “Possibly” when the evidence is suggestive but not conclusive.  

Output JSON structure:
{
  "Overall Contextual Impression": "No Evidence / Possibly / Likely",
  "Confidence": "High / Moderate / Low",
  "Subtle Indicators": ["bullet-point list of cues"],
  "Supporting Quotes": ["short quotes that illustrate the cues"],
  "Reasoning": "Brief paragraph summarising how these cues combine to suggest an ‘Idea Guy’ tendency."
}`;

const analyzeChunk = async (openai, chunk, chunkIndex, totalChunks) => {
  const messages = [
    {
      role: 'system',
      content: JTBD_PRIMARY_GOAL_SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: `Please analyze this interview transcript chunk (${chunkIndex + 1}/${totalChunks}):\n\n${chunk}`
    }
  ];
  console.log(`[analyzeChunk] Preparing to call OpenAI for chunk ${chunkIndex + 1}. Messages length: ${JSON.stringify(messages).length} chars.`);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2500
  });

  return JSON.parse(response.choices[0].message.content);
};

const synthesizeAnalyses = async (openai, analyses) => {
  const messages = [
    {
      role: 'system',
      content: SYNTHESIS_PROMPT
    },
    {
      role: 'user',
      content: `Please synthesize these JTBD analyses into a single cohesive analysis:\n\n${JSON.stringify(analyses, null, 2)}`
    }
  ];
  console.log(`[synthesizeAnalyses] Preparing to call OpenAI for synthesis. Messages length: ${JSON.stringify(messages).length} chars.`);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2500
  });

  return JSON.parse(response.choices[0].message.content);
};

// Helper function to update progress with delay
const updateProgress = async (progress, progressCallback, stepText) => {
  console.log('Setting JTBD Primary Goal progress to:', progress, stepText ? `(${stepText})` : '');
  if (progressCallback) {
    progressCallback(progress, stepText);
  }
  // Add a small delay to make the progress updates smoother
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Define a chunk size (e.g., in characters). Adjust as needed.
// GPT-4o context window is large, but prompts can also be large.
// Let's aim for chunks that leave ample room for the prompt and response.
// Approximate tokens: 1 token ~ 4 chars. Max context 128k tokens.
// Prompt is ~1k tokens. Let's say 15k tokens for a chunk to be safe with current prompt (60k chars)
const CHAR_CHUNK_SIZE = 60000; // Characters, not tokens

export const analyzeJTBDPrimaryGoal = async (transcriptData, progressCallback, apiKey) => {
  console.log('Starting Multiplier Behavior Analysis with:', {
    hasTranscript: !!transcriptData,
    hasProgressCallback: !!progressCallback,
    hasApiKey: !!apiKey
  });

  if (!apiKey) {
    console.error('Missing API key');
    throw new Error('OpenAI API key is required. Please set your API key first.');
  }

  if (!transcriptData || typeof transcriptData !== 'string') {
    console.error('Invalid transcript data:', typeof transcriptData);
    throw new Error('Invalid transcript data. Expected a string.');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    await updateProgress(5, progressCallback, "Initializing analysis...");
    console.log('Initialized OpenAI client');

    // 1. Split transcript into chunks
    const chunks = [];
    for (let i = 0; i < transcriptData.length; i += CHAR_CHUNK_SIZE) {
      chunks.push(transcriptData.substring(i, i + CHAR_CHUNK_SIZE));
    }
    console.log(`Transcript split into ${chunks.length} chunks.`);
    await updateProgress(10, progressCallback, `Transcript split into ${chunks.length} chunks.`);

    // 2. Analyze each chunk
    const chunkAnalyses = [];
    const totalChunks = chunks.length;
    // Define progress range for chunk analysis (e.g., 10% to 70% of total progress)
    const chunkAnalysisStartProgress = 10;
    const chunkAnalysisEndProgress = 70;
    const progressPerChunk = totalChunks > 0 ? (chunkAnalysisEndProgress - chunkAnalysisStartProgress) / totalChunks : 0;

    for (let i = 0; i < totalChunks; i++) {
      const chunk = chunks[i];
      const currentChunkProgress = chunkAnalysisStartProgress + (i * progressPerChunk);
      await updateProgress(Math.round(currentChunkProgress), progressCallback, `Analyzing chunk ${i + 1} of ${totalChunks}...`);
      console.log(`Analyzing chunk ${i + 1}/${totalChunks}`);
      try {
        const chunkAnalysis = await analyzeChunk(openai, chunk, i, totalChunks);
        chunkAnalyses.push(chunkAnalysis);
      } catch (chunkError) {
        console.error(`Error analyzing chunk ${i + 1}:`, chunkError);
        // Optionally, decide if one chunk error should stop the whole process
        // For now, we'll let it continue and try to synthesize what we have, or throw at the end.
        throw new Error(`Failed to analyze chunk ${i + 1}: ${chunkError.message}`);
      }
    }
    console.log('All chunks analyzed.');
    await updateProgress(chunkAnalysisEndProgress, progressCallback, "All chunks analyzed. Synthesizing results...");

    // 3. Synthesize results
    // If only one chunk, and it's small enough, synthesis might be skipped or direct result used.
    // For now, always synthesize for consistency, even if one chunk.
    if (chunkAnalyses.length === 0) {
        console.error('No chunks were analyzed successfully.');
        throw new Error('No analysis results to synthesize.');
    }

    console.log('Synthesizing analyses...');
    const synthesisResult = await synthesizeAnalyses(openai, chunkAnalyses);
    await updateProgress(90, progressCallback, "Generating contextual analysis...");
    console.log('Synthesis complete.');

    // Contextual / Subtle-cue Analysis
    let contextualAnalysis = null;
    try {
      const contextualResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: IDEA_GUY_CONTEXT_PROMPT },
          { role: "user", content: transcriptData }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1500
      });
      contextualAnalysis = JSON.parse(contextualResponse.choices[0].message.content);
    } catch (ctxErr) {
      console.warn('Contextual analysis failed:', ctxErr?.message || ctxErr);
    }

    // Validate main (explicit) synthesis
    if (!synthesisResult["Overall Assessment"] || !synthesisResult["Confidence Score in this Assessment"]) {
      console.error('Invalid synthesized analysis result structure for "The Idea Guy":', synthesisResult);
      throw new Error('Invalid synthesized analysis result structure: Missing expected fields for "The Idea Guy" analysis.');
    }

    await updateProgress(100, progressCallback, "Analysis complete");
    console.log('Analysis complete');

    // Return combined view
    return {
      explicitAnalysis: synthesisResult,
      contextualAnalysis: contextualAnalysis
    };

  } catch (error) {
    console.error('Error in Multiplier Behavior Analysis:', error);
    if (progressCallback) progressCallback(0, "Analysis error: " + error.message.substring(0, 50) + "...");
    throw error;
  }
};
