/**
 * Agent step definitions for dynamic progress bar labels
 * This file defines the progression steps for each agent in the system
 */

// JTBD Primary Goal Agent steps
const JTBD_PRIMARY_GOAL_STEPS = [
  { threshold: 0, label: "Analyzing transcript..." },
  { threshold: 20, label: "Detecting multiplier behaviors..." },
  { threshold: 40, label: "Extracting behavior instances..." },
  { threshold: 60, label: "Evaluating behavior impact..." },
  { threshold: 80, label: "Finalizing multiplier behavior analysis..." }
];

// JTBD Gains Analysis Agent steps
const JTBD_GAINS_STEPS = [
  { threshold: 0, label: "Processing transcript..." },
  { threshold: 20, label: "Identifying outcome expectations..." },
  { threshold: 40, label: "Mapping potential gains..." },
  { threshold: 60, label: "Prioritizing opportunities..." },
  { threshold: 80, label: "Finalizing gains analysis..." }
];

// Pain Extractor Agent steps
const PAIN_EXTRACTOR_STEPS = [
  { threshold: 0, label: "Analyzing transcript..." },
  { threshold: 20, label: "Identifying pain points..." },
  { threshold: 40, label: "Applying CURSE framework..." },
  { threshold: 60, label: "Evaluating severity levels..." },
  { threshold: 80, label: "Finalizing pain analysis..." }
];

// Friction Analysis Agent steps
const FRICTION_ANALYSIS_STEPS = [
  { threshold: 0, label: "Processing transcript..." },
  { threshold: 20, label: "Identifying friction points..." },
  { threshold: 40, label: "Mapping user journeys..." },
  { threshold: 60, label: "Evaluating impact..." },
  { threshold: 80, label: "Finalizing friction analysis..." }
];

// Problem Awareness Matrix Agent steps
const PROBLEM_AWARENESS_STEPS = [
  { threshold: 0, label: "Analyzing customer inputs..." },
  { threshold: 20, label: "Mapping awareness levels..." },
  { threshold: 40, label: "Identifying knowledge gaps..." },
  { threshold: 60, label: "Building awareness matrix..." },
  { threshold: 80, label: "Finalizing problem awareness..." }
];

// Final Report Agent steps
const FINAL_REPORT_STEPS = [
  { threshold: 0, label: "Gathering analysis results..." },
  { threshold: 20, label: "Synthesizing insights..." },
  { threshold: 40, label: "Formulating recommendations..." },
  { threshold: 60, label: "Structuring report..." },
  { threshold: 80, label: "Finalizing comprehensive report..." }
];

// Map agent IDs to their respective step arrays
const AGENT_STEPS = {
  'jtbd': JTBD_PRIMARY_GOAL_STEPS,
  'jtbdGains': JTBD_GAINS_STEPS,
  'painExtractor': PAIN_EXTRACTOR_STEPS,
  'frictionAnalysis': FRICTION_ANALYSIS_STEPS,
  'problemAwareness': PROBLEM_AWARENESS_STEPS,
  'finalReport': FINAL_REPORT_STEPS,
};

/**
 * Get the step definitions for a specific agent
 * @param {string} agentId - The ID of the agent
 * @returns {Array} Array of step objects with threshold and label properties
 */
export const getAgentSteps = (agentId) => {
  return AGENT_STEPS[agentId] || [
    { threshold: 0, label: "Analysis in progress..." },
    { threshold: 50, label: "Processing data..." },
    { threshold: 80, label: "Finalizing results..." }
  ];
};

/**
 * Get the current step label based on progress percentage
 * @param {string} agentId - The ID of the agent
 * @param {number} progress - Current progress percentage (0-100)
 * @returns {string} The appropriate step label for the current progress
 */
export const getCurrentStepLabel = (agentId, progress) => {
  const steps = getAgentSteps(agentId);
  // Find the latest step that has a threshold less than or equal to the current progress
  const currentStep = [...steps].reverse().find(step => progress >= step.threshold);
  return currentStep?.label || "Analysis in progress...";
};
