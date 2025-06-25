export const agents = [
  {
    id: 'longContextChunking',
    name: 'Transcript Optimization',
    description: 'Analyzes and chunks long text content for better processing',
    icon: '📝'
  },
  {
    id: 'ideaGuy', // Changed from 'jtbd' to 'ideaGuy' to better reflect actual purpose
    name: "The Idea Guy",
    description: "Detects and analyzes multiplier behaviors within manager–subordinate interactions captured in the transcript.",
    icon: '🎯',
    requiresPreviousAgent: 'longContextChunking'
  },
  {
    id: 'alwaysOn',
    name: 'Always On',
    description: 'Detects "Always On" Accidental Diminisher behaviour in manager–team conversations.',
    icon: '⚡️',
    requiresPreviousAgent: 'ideaGuy' // Updated dependency to new ID
  },
  {
    id: 'opportunityQualification',
    name: "Opportunity Qualification",
    description: "Evaluates if the interviewee represents a qualified opportunity based on problem experience, active search, and problem fit",
    icon: '🎯',
    requiresPreviousAgent: 'longContextChunking'
  },
  {
    id: 'finalReport',
    name: "Final Behavioral Report",
    description: "Generates a comprehensive report summarizing behavioral findings from all analysis agents.",
    icon: '📊',
    requiresPreviousAgent: ['ideaGuy', 'alwaysOn'] // Updated dependency to new ID
  }
];