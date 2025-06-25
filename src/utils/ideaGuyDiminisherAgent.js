// Renamed from jtbdPrimaryGoalAgent.js to ideaGuyDiminisherAgent.js
// Exports the same functionality for detecting "The Idea Guy" Accidental Diminisher behaviour.
// For backward-compatibility we continue to export analyzeJTBDPrimaryGoal under the same name
// while also providing a new alias analyzeIdeaGuyDiminisher so existing callers keep working
// during the transition.

export { analyzeJTBDPrimaryGoal as analyzeIdeaGuyDiminisher, analyzeJTBDPrimaryGoal } from './jtbdPrimaryGoalAgent.js';
