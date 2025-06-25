import OpenAI from 'openai';

// System prompt tailored for "Always On" Accidental Diminisher detection
export const ALWAYS_ON_PRIMARY_GOAL_SYSTEM_PROMPT = `Detecting "Always On" Diminisher (for Self-Reflection & Future Coaching)
You are an expert leadership coach. Your task is to analyze the following transcript of a real conversation between a manager and their team member(s). The primary purpose of this analysis is for the manager's self-reflection, to identify potential 'Accidental Diminisher' patterns, and to inform future coaching and training. Your analysis should focus only on identifying behaviors consistent with the 'Always On' Accidental Diminisher profile.

Context for Analysis:
• Goal: Manager's self-reflection and future coaching.
• Transcript Type: Real, recorded conversation.
• Setting: Could be any manager-team interaction (one-on-one, project update, problem-solving, performance discussion, etc.).
• Focus: Identify both overt examples and subtle cues of 'Always On' behavior.
• Intent vs. Impact: Consider the manager's likely positive intent but analyze the potential diminishing impact on the team member(s).
• Evidence: Your analysis must be based solely on the provided transcript. Quote specific examples. Do not infer or invent information.
• Nuance: Provide a simple "Yes/No/Possibly" for obvious behaviors with a brief explanation. For more nuanced context or subtle cues, provide a more in-depth analysis of why something is or isn't this particular behavior.
• Frequency/Intensity: If the behavior is observed, comment on its frequency or intensity within this interaction.
• Alternative Multiplier Approach: If 'Always On' diminishing behavior is identified, briefly suggest an alternative Multiplier approach the manager could have taken in that specific instance.

Transcript:
[Insert Transcript of Manager-Subordinate Interview Here]

Analysis for 'Always On' Accidental Diminisher Profile:
The 'Always On' leader is a dynamic, charismatic individual with high energy and a commanding presence, often dominating conversations with their enthusiasm and constant engagement.

• Likely Positive Intent: To inspire and energize the team, to lead by example, and to create a lively, motivated work environment.
• Potential Diminishing Impact: The manager's relentless energy and dominance can exhaust team members, suppress quieter voices (e.g., introverts), reduce team engagement, and lead to the manager being tuned out as "white noise," diminishing their influence and the team's contributions.

Analyze the manager's contributions based on the transcript:
1. Does the manager consistently dominate the conversation with high energy, frequent interruptions, or excessive talking, leaving little space for team members to contribute?
2. Does the manager's enthusiasm or presence appear to overwhelm or exhaust the team member, potentially causing them to disengage or avoid interaction?
3. Is there evidence that the manager fails to create space for quieter team members (e.g., introverts) to share ideas or that their constant engagement favors action-oriented extroverts?
4. Does the manager's behavior suggest they are unaware of cues that team members are disengaging, such as hesitancy, minimal responses, or avoidance of eye contact?
5. Does the manager provide opportunities for team members to lead discussions or share ideas, or do they maintain a "center-stage" presence throughout the interaction?

Format your response as a JSON object using the LLM Output Structure below.

LLM Output Structure:
{
  "Overall Assessment": "Yes/No/Possibly",
  "Confidence Score in this Assessment": "High Confidence (80-100%)/Moderate Confidence (60-79%)/Low Confidence (0-59%)",
  "Justification for Confidence Score": "[Briefly explain why this confidence level was chosen, referencing the nature of the evidence.]",
  "Detailed Analysis & Evidence": {
    "Specific Examples": [
      {
        "quote": "[Quote specific phrases or interactions from the manager in the transcript that support your 'Overall Assessment'.]",
        "explanation": "[Explain why this quote points to 'Always On' behavior, considering intent vs. potential impact.]"
      }
    ],
    "Subtle Cues (if any)": "[Describe any subtle cues or more nuanced patterns that suggest 'Always On' tendency, such as team member hesitancy or minimal responses.]",
    "Frequency/Intensity": "[Comment on how often or how strongly this behavior appears in the transcript.]",
    "Impact on Team Member (Observed or Potential)": "[Based on the transcript, describe any observed reactions from the team member or the potential impact this behavior might have on them.]"
  },
  "Suggested Alternative (Multiplier) Approach (if 'Always On' diminishing behavior is identified)": {
    "description": "[For one key instance identified, briefly suggest how the manager could have approached it as a 'Liberator' or 'Amplifier' to better engage the team member. Be specific to the transcript content.]"
  },
  "If 'Always On' behavior is not evident": {
    "statement": "[State clearly: 'Based on this transcript, there is no clear evidence of the manager exhibiting \\"Always On\\" Accidental Diminisher behavior.' Briefly explain why, if useful.]"
  }
}`;

// Contextual subtle-cue prompt (optional second pass)
const ALWAYS_ON_CONTEXT_PROMPT = `Contextual "Always On" Assessment (Broader, Subtle-Cue Focus)
You are an expert leadership coach. Analyse the transcript holistically to surface any weaker or borderline signs of the manager acting as an "Always On" Accidental Diminisher.
Unlike the strict check, this pass should:
• Look for patterns that, when combined, could still exhaust the team or suppress quieter voices.
• Identify indirect or implied impacts (e.g. disengagement, minimal responses, avoidance behaviour).
• Be willing to say "Possibly" when the evidence is suggestive but not conclusive.

Output JSON structure:
{
  "Overall Contextual Impression": "No Evidence / Possibly / Likely",
  "Confidence": "High / Moderate / Low",
  "Subtle Indicators": ["bullet-point list of cues"],
  "Supporting Quotes": ["short quotes that illustrate the cues"],
  "Reasoning": "Brief paragraph summarising how these cues combine to suggest an 'Always On' tendency."
}`;

// --- Shared helper logic (copied from jtbdPrimaryGoalAgent) ---

const CHAR_CHUNK_SIZE = 60000; // Same chunk size as other agent

const updateProgress = async (progress, progressCallback, stepText) => {
  if (progressCallback) progressCallback(progress, stepText);
  await new Promise(r => setTimeout(r, 50));
};

const analyzeChunk = async (openai, chunk, chunkIndex, totalChunks) => {
  try {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: ALWAYS_ON_PRIMARY_GOAL_SYSTEM_PROMPT },
      { role: "user", content: chunk }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1500
  });
  return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(`Chunk ${chunkIndex+1} analysis error:`, error);
    throw new Error(`Failed to analyze chunk ${chunkIndex+1}: ${error.message}`);
  }
};

const synthesizeAnalyses = async (openai, analyses) => {
  // For now simply return the first analysis if only one, else use a synthesis chat call like other agent
  if (analyses.length === 1) return analyses[0];
  
  try {
    const SYNTHESIS_PROMPT = `You are an expert behavioral analyst specialising in identifying 'Always On' Accidental Diminisher patterns from conversation transcripts. You will be provided with a series of JSON objects, each representing an analysis of a segment of a manager-team member conversation.\n\nYour task is to synthesise these individual segment analyses into a single, cohesive JSON object following the same output structure.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYNTHESIS_PROMPT },
        { role: "user", content: JSON.stringify(analyses) }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(`Synthesis error:`, error);
    throw new Error(`Failed to synthesize analyses: ${error.message}`);
  }
};

// Main exported function
export const analyzeAlwaysOnPrimaryGoal = async (transcriptData, progressCallback, apiKey) => {
  if (!apiKey) throw new Error('OpenAI API key is required.');
  if (!transcriptData || typeof transcriptData !== 'string') throw new Error('Invalid transcript data.');

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  try {
    await updateProgress(5, progressCallback, "Initializing Always On analysis...");

    // 1. Chunk transcript
    const chunks = [];
    for (let i = 0; i < transcriptData.length; i += CHAR_CHUNK_SIZE) {
      chunks.push(transcriptData.substring(i, i + CHAR_CHUNK_SIZE));
    }
    await updateProgress(10, progressCallback, `Transcript split into ${chunks.length} chunks.`);

    // 2. Analyse each chunk
    const analyses = [];
    const totalChunks = chunks.length;
    const startP = 10;
    const endP = 70;
    const perChunk = totalChunks ? (endP - startP) / totalChunks : 0;

    for (let i = 0; i < totalChunks; i++) {
      await updateProgress(Math.round(startP + i * perChunk), progressCallback, `Analyzing chunk ${i + 1}/${totalChunks}...`);
      const chunkRes = await analyzeChunk(openai, chunks[i], i, totalChunks);
      analyses.push(chunkRes);
    }

    // 3. Synthesise
    await updateProgress(80, progressCallback, "Synthesizing results...");
    const synthesis = await synthesizeAnalyses(openai, analyses);

    // 4. Contextual subtle pass (best effort)
    let contextual = null;
    try {
      const ctx = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: ALWAYS_ON_CONTEXT_PROMPT },
          { role: "user", content: transcriptData }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1200
      });
      contextual = JSON.parse(ctx.choices[0].message.content);
    } catch (e) {
      console.warn('Contextual Always On analysis failed:', e?.message || e);
    }

    await updateProgress(100, progressCallback, "Always On analysis complete");
    return { explicitAnalysis: synthesis, contextualAnalysis: contextual };
  } catch (err) {
    if (progressCallback) progressCallback(0, "Always On analysis error: " + err.message.substring(0, 60));
    throw err;
  }
};
