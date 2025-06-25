import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { agents } from '../data/agents';
import ExplanationPanel from './ExplanationPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// eslint-disable-next-line import/no-unresolved
import impressionMd from "../../.md_files/impression_scale_rubric.md?raw";

/**
 * Simplified AnalysisResults component.
 * Supports only:
 *  - longContextChunking (optimized transcript)
 *  - jtbd (primary goal)
 *  - opportunityQualification
 *  - finalReport
 */
const AnalysisResults = ({ showResult, localAnalysisResults }) => {
  const renderLongContextResults = (result) => {
    if (!result) return <p className="text-muted-foreground">No optimized transcript found.</p>;
    return (
      <Card>
        <CardHeader><CardTitle>Optimized Transcript</CardTitle></CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm">{result.optimizedTranscript || JSON.stringify(result, null, 2)}</pre>
        </CardContent>
      </Card>
    );
  };

  // Helper to render a section with a title and content
  const renderSection = (title, content, className = "mb-4") => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;
    return (
      <div className={className}>
        <h3 className="text-md font-semibold mb-1 text-gray-700">{title}</h3>
        {typeof content === 'string' ? (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
        ) : (
          content
        )}
      </div>
    );
  };

  // Renamed function and updated logic for 'The Idea Guy' analysis
  const renderIdeaGuyAnalysis = (result) => {
    if (!result) return <p className="text-muted-foreground">No 'Idea Guy' analysis results available.</p>;

    // --- adapt to new combined structure ---
    const explicit = result.explicitAnalysis || result; // fallback to legacy
    const contextual = result.contextualAnalysis;
    const behaviorName = result.behaviorName || 'The Idea Guy';

    const renderExplicit = () => {
      if (!explicit) return null;
      const {
        "Overall Assessment": overallAssessment,
        "Confidence Score in this Assessment": confidenceScore,
        "Justification for Confidence Score": confidenceJustification,
        "Detailed Analysis & Evidence": detailedAnalysis,
        "Suggested Alternative (Multiplier) Approach": suggestedAlternative,
        "If 'Idea Guy' behavior is not evident": notEvidentStatement
      } = explicit;

      if (notEvidentStatement) {
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Explicit Evidence Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {renderSection("Overall Assessment", notEvidentStatement.statement)}
              <ExplanationPanel 
                type='explicit'
                quotes={Array.isArray(notEvidentStatement.statement) ? notEvidentStatement.statement : (typeof notEvidentStatement.statement === 'string' ? notEvidentStatement.statement.split('\n').filter(s=>s.trim()) : [])} 
              />
            </CardContent>
          </Card>
        );
      }

      const specificExamples = detailedAnalysis?.["Specific Examples"];
      const subtleCues = detailedAnalysis?.["Subtle Cues (if any)"]; // explicit subtle cues
      const frequencyIntensity = detailedAnalysis?.["Frequency/Intensity"];
      const impactOnTeamMember = detailedAnalysis?.["Impact on Team Member (Observed or Potential)"];

      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Explicit Evidence Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSection("Overall Assessment", overallAssessment)}
            {confidenceScore && renderSection("Confidence", confidenceScore)}
            {detailedAnalysis && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Detailed Analysis & Evidence</h3>
                {renderSection("Specific Examples", specificExamples)}
                {renderSection("Subtle Cues", subtleCues)}
                {renderSection("Frequency/Intensity", frequencyIntensity)}
                {renderSection("Impact on Team Member", impactOnTeamMember)}
              </div>
            )}
            {suggestedAlternative && renderSection("Suggested Alternative (Multiplier) Approach", suggestedAlternative)}
            <ExplanationPanel 
              type='explicit'
              quotes={Array.isArray(specificExamples) ? specificExamples : (typeof specificExamples === 'string' ? specificExamples.split('\n').filter(s=>s.trim()) : [])} 
            />
          </CardContent>
        </Card>
      );
    };

    const renderContextual = () => {
      if (!contextual) return null;
      const {
        "Overall Contextual Impression": impression,
        "Confidence": ctxConf,
        "Subtle Indicators": indicators,
        "Supporting Quotes": quotes,
        "Reasoning": reasoning,
        // Note: 'behaviorPattern' field does not exist in this contextual output
      } = contextual;

      const explanationMap = {
        "Unlikely": "Few or ambiguous cues (0–2 pts). < 25% confidence.",
        "Possibly": "Some cues, inconsistent (3–4 pts). 25–50% confidence.",
        "Likely": "Consistent cues (5–6 pts). 50–75% confidence.",
        "Very Likely": "Strong recurring cues (7+ pts). > 75% confidence.",
        // We should map the contextual ratings ('No Evidence', 'Possibly', 'Likely') here
        "No Evidence": "No clear cues identified (0 pts). < 25% confidence.", // Added mapping
        "Possibly": "Some subtle cues, inconsistent (1-2 pts approx). 25–50% confidence.", // Adjusted explanation
        "Likely": "Consistent subtle cues (3+ pts approx). > 50% confidence.", // Adjusted explanation
      };

      // Get the rating explanation based on the specific field from contextual prompt
      const ratingExplanation = explanationMap[contextual["Overall Contextual Impression"]?.trim()] || "Explanation unavailable.";

      // Construct the behavior part of the text - HARDCODED
      const behaviorText = `'${behaviorName}' Accidental Diminisher behavior.`;

      // Construct the full display text string
      const displayText = `'${contextual["Overall Contextual Impression"]}' exhibiting ${behaviorText} — ${ratingExplanation}`; 
 
      // Create the impression section with info icon and explanation tooltip
      const impressionTitle = (
        <div>
          <div className="flex items-center">
            <span>Overall Impression</span>
            <Dialog>
              <DialogTrigger asChild>
                <span className="ml-1 text-xs cursor-pointer text-blue-600">ⓘ</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl w-full"> 
                <DialogHeader>
                  <DialogTitle>Impression Scale</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm max-h-[70vh] overflow-y-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => <div className="py-2"><table className="table-auto w-full border-collapse border border-slate-400" {...props} /></div>,
                      thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="mt-4 border-l-4 pl-4 italic" {...props} />, 
                      ol: ({node, ...props}) => <ol className="mb-4 list-decimal list-inside" {...props} />, 
                      th: ({node, ...props}) => <th className="border border-slate-300 px-2 py-1 text-left font-medium whitespace-nowrap" {...props} />,
                      td: ({node, ...props}) => <td className="border border-slate-300 px-2 py-1" {...props} />,
                      p: ({node, ...props}) => {
                        const firstSentence = "The analysis assigns one of four overall impressions"; // Updated text
                        const blockquoteText = "The agent tallies points";
                        const isBlockquotePara = node?.children?.[0]?.value?.startsWith(blockquoteText);

                        let className = '';
                        if (node?.children?.[0]?.value?.startsWith(firstSentence)) {
                          className = 'mb-4'; 
                        } else if (isBlockquotePara) {
                          className = 'mt-4 italic text-sm text-gray-600'; 
                        }
                        return <p className={className} {...props} />;
                      }
                    }}
                  >
                    {impressionMd}
                  </ReactMarkdown>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-gray-500 mt-1"> 
            What the analysis thinks happened based on a scoring rubric
          </p>
        </div>
      );

      // The impression value text
      const impressionEl = <span className="text-sm">{displayText}</span>;
      
      // For the confidence section with color pill and explanation tooltip
      const confidenceValue = contextual?.Confidence || "N/A";
      
      // Determine pill color based on confidence level
      const getConfidenceColor = (level) => {
        switch(level?.trim()?.toLowerCase()) {
          case "low":
            return "bg-red-100 text-red-800 border-red-200"; // Red for low confidence
          case "moderate":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Yellow for moderate confidence
          case "high":
            return "bg-green-100 text-green-800 border-green-200"; // Green for high confidence
          default:
            return "bg-gray-100 text-gray-800 border-gray-200"; // Default/fallback color
        }
      };
      
      const pillColorClass = getConfidenceColor(confidenceValue);
      
      const confidenceTitle = (
        <div>
          <div>
            <div>LLM Confidence Score</div>
            <div className="text-xs text-gray-500 mb-1">How sure the AI analyzer is about its own conclusion, based on the evidence quality.</div>
          </div>
          <div className="flex items-center">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${pillColorClass} border`}>
              {confidenceValue === 'High' ? 'Highly' : 
               confidenceValue === 'Moderate' ? 'Moderately' : 
               confidenceValue === 'Low' ? 'Minimally' : confidenceValue} Confident
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <span className="ml-1 text-xs cursor-pointer text-blue-600">ⓘ</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>LLM Confidence Score</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm max-w-none">
                  <p className="font-medium text-base italic mb-4">
                    How sure the AI analyzer is about its own conclusion, based on the evidence quality.
                  </p>
                  <p>
                    This score (High/Moderate/Low) reflects the AI's confidence in its own assessment of the "Overall Contextual Impression" (e.g., Likely, Possibly, No Evidence) based on the subtle cues found in the transcript.
                  </p>
                  <p>
                    It is based on the clarity, consistency, and directness of the evidence detected according to the analysis prompt's criteria. It is distinct from the confidence percentage range shown in the main impression text, which defines the rating itself based on the point rubric.
                  </p>
                  <div className="py-2">
                    <table className="table-auto w-full border-collapse border border-slate-400 mt-2">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="border border-slate-300 px-2 py-1 text-left font-medium whitespace-nowrap">Confidence Level</th>
                          <th className="border border-slate-300 px-2 py-1 text-left font-medium">Criteria</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 px-2 py-1 font-medium">High</td>
                          <td className="border border-slate-300 px-2 py-1">
                            Clear, consistent evidence throughout the transcript. Multiple supporting instances. 
                            Minimal ambiguity or alternative interpretations. Strong pattern recognition.
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-1 font-medium">Moderate</td>
                          <td className="border border-slate-300 px-2 py-1">
                            Some evidence, but with inconsistencies or mixed signals. Alternative interpretations possible.
                            Pattern exists but is not dominant or may be contextual.
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-2 py-1 font-medium">Low</td>
                          <td className="border border-slate-300 px-2 py-1">
                            Limited or ambiguous evidence. Difficult to determine conclusively.
                            Significant alternative explanations exist. Isolated instances rather than patterns.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* We moved this text inside the modal */}
        </div>
      );
      
      // Since we've incorporated the confidence value into the pill, we'll use an empty element
      const confidenceEl = <span></span>;

      return (
        <Card>
          <CardHeader>
            <CardTitle>Suggestive Evidence Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Overall Impression section */}
            {renderSection(impressionTitle, impressionEl)}
            
            {/* Confidence section */}
            {renderSection(confidenceTitle, confidenceEl)}
            {renderSection("Reasoning", reasoning)}
            {indicators && indicators.length > 0 && renderSection("Subtle Indicators", indicators.join("\n"))}
            {quotes && quotes.length > 0 && renderSection("Supporting Quotes", quotes.join("\n"))}
            <ExplanationPanel 
              type='contextual'
              quotes={quotes || []} 
            />
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="space-y-6">
        {renderExplicit()}
        {renderContextual()}
      </div>
    );
  };

  const renderOpportunityQualification = (result) => {
    if (!result) return <p className="text-muted-foreground">No opportunity qualification results.</p>;
    
    // Check if result has the expected structure
    const hasStructuredData = result.overallAssessment && result.summary && result.scores;
    
    if (hasStructuredData) {
      return (
        <Card>
          <CardHeader><CardTitle>Opportunity Qualification</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Overall Assessment:</h3>
                <span className="font-bold text-blue-600">{result.overallAssessment}</span>
              </div>
              <p className="text-gray-700 mb-4">{result.summary}</p>
              
              <h3 className="text-lg font-medium mb-3">Scores:</h3>
              {Object.entries(result.scores).map(([key, score]) => (
                <div key={key} className="mb-3 border-b pb-3">
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-bold">{score.score}/5</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{score.analysis}</p>
                </div>
              ))}
              
              {result.recommendations && result.recommendations.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-2">Recommendations:</h3>
                  <ul className="list-disc pl-5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm mb-1">{rec}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Fallback to raw JSON display if structure is not as expected
    return (
      <Card>
        <CardHeader><CardTitle>Opportunity Qualification</CardTitle></CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </CardContent>
      </Card>
    );
  };

  const renderBehavioralReport = (result) => {
    if (!result) return <p className="text-muted-foreground">No behavioral report generated.</p>;

    const {
      reportTitle,
      behavioralOverview,
      multiplierInsights,
      diminisherInsights,
      sentimentPatterns,
      actionableRecommendations,
      reportConfidence
    } = result;

    const title = reportTitle || "Final Behavioral Report"; // Fallback title

    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {renderSection("Behavioral Overview", behavioralOverview)}

          {multiplierInsights && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-sky-700">Multiplier Insights</h3>
              {renderSection("Summary", multiplierInsights.summary)}
              {multiplierInsights.keyExamples && multiplierInsights.keyExamples.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-md font-medium mb-1 text-gray-600">Key Examples:</h4>
                  {multiplierInsights.keyExamples.map((example, index) => (
                    <Card key={`multiplier-${index}`} className="mb-3 p-3 bg-sky-50 border-sky-200 shadow-sm">
                      {renderSection("Behavior Type", example.behaviorType, "mb-1 text-sm font-semibold text-sky-800")}
                      {example.specificExample && renderSection("Specific Example", <pre className="whitespace-pre-wrap text-xs">{example.specificExample}</pre>, "mb-1")}
                      {renderSection("Analysis", example.analysis, "mb-1 text-xs")}
                      {renderSection("Observed Impact", example.observedImpact, "text-xs")}
                    </Card>
                  ))}
                </div>
              )}
              {multiplierInsights.overallStrengthsDemonstrated && multiplierInsights.overallStrengthsDemonstrated.length > 0 &&
                renderSection("Overall Strengths Demonstrated",
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {multiplierInsights.overallStrengthsDemonstrated.map((strength, i) => <li key={`strength-${i}`}>{strength}</li>)}
                  </ul>
                )
              }
            </div>
          )}

          {diminisherInsights && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2 text-red-700">Diminisher Insights</h3>
              {renderSection("Summary", diminisherInsights.summary)}
              {diminisherInsights.keyExamples && diminisherInsights.keyExamples.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-md font-medium mb-1 text-gray-600">Key Examples:</h4>
                  {diminisherInsights.keyExamples.map((example, index) => (
                    <Card key={`diminisher-${index}`} className="mb-3 p-3 bg-red-50 border-red-200 shadow-sm">
                      {renderSection("Behavior Type", example.behaviorType, "mb-1 text-sm font-semibold text-red-800")}
                      {example.specificExample && renderSection("Specific Example", <pre className="whitespace-pre-wrap text-xs">{example.specificExample}</pre>, "mb-1")}
                      {renderSection("Analysis", example.analysis, "mb-1 text-xs")}
                      {renderSection("Observed Impact", example.observedImpact, "text-xs")}
                    </Card>
                  ))}
                </div>
              )}
              {diminisherInsights.areasForDevelopment && diminisherInsights.areasForDevelopment.length > 0 &&
                renderSection("Areas for Development",
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {diminisherInsights.areasForDevelopment.map((area, i) => <li key={`devArea-${i}`}>{area}</li>)}
                  </ul>
                )
              }
            </div>
          )}

          {sentimentPatterns && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2 text-amber-700">Sentiment Patterns</h3>
              {renderSection("Overall Sentiment", sentimentPatterns.overallSentiment)}
              {sentimentPatterns.keyObservations && sentimentPatterns.keyObservations.length > 0 && (
                 <div className="mt-2">
                  <h4 className="text-md font-medium mb-1 text-gray-600">Key Observations:</h4>
                  {sentimentPatterns.keyObservations.map((obs, index) => (
                    <Card key={`sentiment-obs-${index}`} className="mb-3 p-3 bg-amber-50 border-amber-200 shadow-sm">
                      {renderSection("Observation", obs.observation, "mb-1 text-xs")}
                      {obs.linkedBehavior && renderSection("Linked Behavior", obs.linkedBehavior, "text-xs text-gray-500")}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {actionableRecommendations && actionableRecommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2 text-green-700">Actionable Recommendations</h3>
              <ul className="space-y-2">
                {actionableRecommendations.map((rec, index) => (
                  <li key={`rec-${index}`} className="p-3 border rounded-md bg-green-50 border-green-200 shadow-sm">
                    <p className="font-medium text-sm text-green-800">{rec.recommendation}</p>
                    {rec.focusArea && <p className="text-xs text-gray-500 mt-1">Focus Area: {rec.focusArea}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reportConfidence && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">Report Confidence</h3>
              {renderSection("Score", `${reportConfidence.score}/100`)}
              {renderSection("Reasoning", reportConfidence.reasoning)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAlwaysOnAnalysis = (result) => {
    if (!result) return <p className="text-muted-foreground">No 'Always On' analysis results available.</p>;
    
    // Extract top-level data
    const { 
      "Overall Assessment": overallAssessment, 
      "Confidence Score in this Assessment": confidenceScore, 
      "Justification for Confidence Score": justificationText, 
      "Detailed Analysis & Evidence": detailedAnalysis,
      "Suggested Alternative Approach": suggestedAlternative,
      "If 'Always On' behavior is not evident": notEvidentData
    } = result;
      
    // Check if there's no evidence of the behavior
    const hasNoEvidence = overallAssessment === "No" || 
                          overallAssessment?.toLowerCase().includes("no evidence") ||
                          notEvidentData;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Always On Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasNoEvidence ? (
            // Display the "no evidence" case
            <div>
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-medium">Result:</h3>
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  No Evidence Found
                </span>
              </div>
              <p className="text-gray-700">
                {notEvidentData?.statement || 
                 "Based on this transcript, there is no clear evidence of the manager exhibiting 'Always On' Accidental Diminisher behavior."}
              </p>
            </div>
          ) : (
            // Display normal case with evidence
            <>
              {/* Overall Assessment */}
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium">Overall Assessment:</h3>
                  <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    {overallAssessment}
                  </span>
                </div>
                {confidenceScore && (
                  <div className="flex items-start mb-1">
                    <span className="font-medium text-sm text-gray-700 w-24">Confidence:</span>
                    <span className="text-sm">{confidenceScore}</span>
                  </div>
                )}
                {justificationText && (
                  <div className="mb-4">
                    <span className="font-medium text-sm text-gray-700 block mb-1">Justification:</span>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap pl-2 border-l-2 border-gray-300">
                      {justificationText}
                    </p>
                  </div>
                )}
              </div>

              {/* Detailed Analysis Section */}
              {detailedAnalysis && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3">Detailed Analysis & Evidence</h3>
                  
                  {/* Specific Examples */}
                  {detailedAnalysis["Specific Examples"] && Array.isArray(detailedAnalysis["Specific Examples"]) && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2">Specific Examples:</h4>
                      {detailedAnalysis["Specific Examples"].map((example, index) => (
                        <Card key={`example-${index}`} className="mb-3 bg-red-50 border-red-200">
                          <CardContent className="py-3">
                            <blockquote className="text-sm italic border-l-4 pl-3 border-red-300 mb-2">
                              {example.quote}
                            </blockquote>
                            <p className="text-sm">{example.explanation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Subtle Cues */}
                  {detailedAnalysis["Subtle Cues (if any)"] && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2">Subtle Indicators:</h4>
                      <div className="bg-amber-50 border border-amber-200 rounded p-3">
                        <p className="text-sm">{detailedAnalysis["Subtle Cues (if any)"]}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Frequency/Intensity */}
                  {detailedAnalysis["Frequency/Intensity"] && renderSection(
                    "Frequency/Intensity", 
                    detailedAnalysis["Frequency/Intensity"],
                    "mb-4 bg-gray-50 p-3 rounded border border-gray-200"
                  )}
                  
                  {/* Impact */}
                  {detailedAnalysis["Impact on Team Member (Observed or Potential)"] && renderSection(
                    "Impact on Team Members", 
                    detailedAnalysis["Impact on Team Member (Observed or Potential)"],
                    "mb-4 bg-gray-50 p-3 rounded border border-gray-200"
                  )}
                </div>
              )}
              
              {/* Suggested Alternative Approach */}
              {suggestedAlternative && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
                  <h3 className="text-md font-semibold mb-2 text-green-800">Suggested Alternative Approach</h3>
                  <p className="text-sm">{suggestedAlternative}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

const renderResults = () => {
    switch (showResult) {
      case 'longContextChunking':
        return renderLongContextResults(localAnalysisResults[showResult]);
      case 'ideaGuy': // Updated from 'jtbd'
        return renderIdeaGuyAnalysis(localAnalysisResults?.ideaGuy); // Updated property name
      case 'alwaysOn':
      return renderAlwaysOnAnalysis(localAnalysisResults?.alwaysOn);
    case 'opportunityQualification':
        return renderOpportunityQualification(localAnalysisResults?.opportunityQualification);
      case 'finalReport':
        return renderBehavioralReport(localAnalysisResults?.finalReport);
      default:
        return <p className="text-muted-foreground">Select an analysis to view results.</p>;
    }
  };

  const handleDownload = () => {
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) return;
    // Clone the results container
    const containerClone = resultsContainer.cloneNode(true);
    // Remove any download buttons from the clone
    const downloadButtons = containerClone.querySelectorAll('button');
    downloadButtons.forEach((button) => {
      if (button.textContent.includes('Download')) {
        button.parentNode.removeChild(button);
      }
    });
    
    // Set the clone's width to match the original container's width
    containerClone.style.width = resultsContainer.offsetWidth + 'px';
    
    // Collect all inline styles and linked stylesheets from the document
    const styleNodes = Array.from(document.querySelectorAll('style')).map(style => style.outerHTML);
    const linkNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.outerHTML);
    const styles = styleNodes.concat(linkNodes).join('\n');
    
    // Construct the full HTML content for just the results
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Analysis Results</title>
  ${styles}
</head>
<body>
  <div style="display: block; width: ${resultsContainer.offsetWidth}px; margin-left: auto; margin-right: auto;">
    ${containerClone.outerHTML}
  </div>
</body>
</html>`;
    
    // Create a Blob and trigger the download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_results.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="analysis-results">
      <div className="download-container" style={{ marginBottom: '1rem' }}>
        <button onClick={handleDownload} className="btn btn-download">Download Results</button>
      </div>
      <div id="resultsContainer">
        {renderResults()}
      </div>
    </div>
  );
};

export default AnalysisResults;
