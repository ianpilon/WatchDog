import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BackdropTooltip } from "@/components/ui/backdrop-tooltip";
import { agents } from '../data/agents';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Code, Info } from 'lucide-react';

import { processBadgesForDownload, addConfidenceRubricToFooter } from '../utils/downloadUtils';

/**
 * Helper function to determine badge variant based on confidence score
 * Returns appropriate UI variant for the confidence level badge
 */
const getConfidenceBadgeVariant = (score) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "destructive";
};

/**
 * Helper function to get confidence range text based on score
 * Returns the appropriate confidence range in percentage format
 */
const getConfidenceRange = (score) => {
  if (score >= 80) return "80-100%";
  if (score >= 60) return "60-79%";
  return "0-59%";
};

/**
 * Helper function to determine badge variant based on urgency level
 * CHANGES (2025-02-03):
 * - Added null-safe check with optional chaining
 * - Standardized urgency levels
 * - Added case-insensitive comparison
 */
const getUrgencyVariant = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'default';
  }
};

/**
 * Component to render analysis results from various agents
 * 
 * CHANGES (2025-02-03):
 * - Added proper error handling for invalid result structures
 * - Updated needs analysis rendering to match new data structure
 * - Added evidence and context display
 * - Improved UI organization and readability
 */
const AnalysisResults = ({ showResult, localAnalysisResults, longContextResults, jtbdAnalysis }) => {


  // Add state for tracking open collapsible sections
  const [openSections, setOpenSections] = useState({
    longContext: {},
    jtbd: {}
  });

  /**
   * Renders JTBD analysis results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderJTBDResults = (result) => {
    if (!result) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Run the JTBD Analysis agent to see results here.</p>
        </div>
      );
    }

    const {
      coreJob = {},
      functionalAspects = [],
      emotionalAspects = [],
      socialAspects = [],
      currentSolutions = [],
      hiringCriteria = [],
      analysisMetadata = {}
    } = result.jtbdAnalysis || {};

    if (!coreJob.statement) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No JTBD analysis results available. Please run the analysis first.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Job To Be Done</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{coreJob.statement}</h4>
                <p className="text-sm text-muted-foreground mb-2">Context: {coreJob.context || 'Not specified'}</p>
                <p className="text-sm">Desired Outcome: {coreJob.desiredOutcome || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-2xl font-bold">{functionalAspects.length + emotionalAspects.length + socialAspects.length}</div>
                <div className="text-sm text-muted-foreground">Total Aspects</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-2xl font-bold">{analysisMetadata.confidenceScore ? getConfidenceRange(Math.round(analysisMetadata.confidenceScore * 100)) : '--'}</div>
                <div className="text-sm text-muted-foreground">Confidence Score</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-2xl font-bold">{currentSolutions.length}</div>
                <div className="text-sm text-muted-foreground">Current Solutions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Functional Aspects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {functionalAspects.map((aspect, index) => (
                  <div key={index} className="bg-secondary p-3 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{aspect.aspect}</p>
                      <Badge variant="default">{aspect.importance}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{aspect.evidence}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emotional Aspects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emotionalAspects.map((aspect, index) => (
                  <div key={index} className="bg-secondary p-3 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{aspect.aspect}</p>
                      <Badge variant="secondary">{aspect.importance}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{aspect.evidence}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Aspects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialAspects.map((aspect, index) => (
                  <div key={index} className="bg-secondary p-3 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{aspect.aspect}</p>
                      <Badge variant="outline">{aspect.importance}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{aspect.evidence}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentSolutions.map((solution, index) => (
                <div key={index} className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{solution.solution}</h4>
                    <Badge variant={
                      solution.effectiveness === 'high' ? "default" :
                      solution.effectiveness === 'medium' ? "secondary" : "outline"
                    }>{solution.effectiveness}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Limitations: {solution.limitations}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hiringCriteria.map((criterion, index) => (
                <div key={index} className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{criterion.criterion}</h4>
                    <Badge variant={
                      criterion.importance === 'high' ? "default" :
                      criterion.importance === 'medium' ? "secondary" : "outline"
                    }>{criterion.importance}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Context: {criterion.context}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {analysisMetadata.keyInsights && analysisMetadata.keyInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {analysisMetadata.keyInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {analysisMetadata.limitations && analysisMetadata.limitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Limitations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
      </div>
    );
  }
   * - Enhanced display of pain points with CURSE scores
   */
  const renderPainResults = (result) => {
    if (!result) return null;

    console.log('Pain Analysis Results:', result);
    
    // Handle both the new and old data formats
    const { 
      identifiedPains = [], 
      metrics = { totalPainPoints: 0, criticalPains: 0 },
      curseAnalysis = { averageScores: {} }
    } = result;
    
    console.log('Extracted pain data:', {
      identifiedPainsCount: identifiedPains.length,
      hasMetrics: !!metrics,
      hasCurseAnalysis: !!curseAnalysis
    });

    // Sort pain points by severity (Critical → High → Moderate → Low → Minimal)
    const sortedPains = [...identifiedPains].sort((a, b) => {
      // Calculate severity for both pain points
      const severityA = a.curseScore ? 
        calculateSeverityFromCurseScore(a.curseScore) : 
        a.severity || 'Medium';
      
      const severityB = b.curseScore ? 
        calculateSeverityFromCurseScore(b.curseScore) : 
        b.severity || 'Medium';
      
      // Map severity levels to numeric values for sorting
      const severityMap = {
        'Critical': 5,
        'High': 4,
        'Moderate': 3,
        'Medium': 3, // Treat Medium same as Moderate
        'Low': 2,
        'Minimal': 1
      };
      
      // Sort in descending order (higher severity first)
      return severityMap[severityB] - severityMap[severityA];
    });

    return (
      <div className="space-y-6">
        {/* Pain Points Card */}
        <Card>
          <CardHeader>
            <CardTitle>Identified Pain Points</CardTitle>
            <CardDescription>Key pain points identified from the interview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedPains.map((pain, index) => {
                // Calculate severity from curseScore if available or use existing severity
                const severity = pain.curseScore ? 
                  calculateSeverityFromCurseScore(pain.curseScore) : 
                  pain.severity || 'Medium';
                
                const { variant, className } = getSeverityBadgeStyles(severity);
                
                // Use either title or painStatement depending on the data format
                const painTitle = pain.title || pain.painStatement || 'Unnamed Pain Point';
                
                return (
                  <div key={index} className="bg-secondary p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{painTitle}</h4>
                      <BackdropTooltip
                        triggerClassName="inline-block"
                        className="max-w-md text-xs bg-secondary"
                        content={
                          <div className="space-y-2">
                            {severity === 'Critical' && (
                              <>
                                <p>Existential threat to operations or goals.</p>
                                <p>Immediately blocks progress; renders goals unachievable; demands urgent intervention</p>
                              </>
                            )}
                            {severity === 'High' && (
                              <>
                                <p>Major obstacle to operations or goals.</p>
                                <p>Significantly hinders progress; requires substantial resources to overcome; creates ongoing friction</p>
                              </>
                            )}
                            {severity === 'Medium' || severity === 'Moderate' && (
                              <>
                                <p>Notable hindrance to efficiency.</p>
                                <p>Measurable impact on time, resources, or quality; causes regular frustration</p>
                              </>
                            )}
                            {severity === 'Low' && (
                              <>
                                <p>Minor inconvenience.</p>
                                <p>Creates occasional inefficiencies; easily worked around; limited impact on goals</p>
                              </>
                            )}
                            {severity === 'Minimal' && (
                              <>
                                <p>Barely noticeable friction.</p>
                                <p>Negligible impact on operations; rarely noticed; extremely low priority</p>
                              </>
                            )}
                          </div>
                        }
                      >
                        <Badge variant={variant} className={className}>{severity} severity</Badge>
                      </BackdropTooltip>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Category:</span> {pain.category}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-muted-foreground">Supporting Evidence:</span> "<span className="italic">{pain.evidence}</span>"
                    </p>
                    <p className="text-sm mb-2">
                      <span className="font-medium">Impact:</span> {pain.impact}
                    </p>
                    
                    {/* Display CURSE scores if available */}
                    {pain.curseScore && (
                      <div className="bg-[#FAFBFD] p-3 rounded-md mb-3 shadow-sm">
                        <p className="text-sm text-muted-foreground">
                          <BackdropTooltip
                            triggerClassName="font-medium underline decoration-dotted"
                            className="max-w-md text-xs bg-secondary"
                            content={
                              <div className="space-y-2">
                                <p className="font-semibold">The CURSE framework is a comprehensive evaluation system that helps prioritize customer pain points by measuring five key dimensions using a simple 0-5 scale:</p>
                                <p><strong>C - Crucial:</strong> How important is this problem to the customer's goals? A higher score means the pain point is more central to what they're trying to accomplish.</p>
                                <p><strong>U - Ubiquitous:</strong> How widespread is this problem across the customer's experience? A higher score indicates the problem affects many aspects of their work or many people within their organization.</p>
                                <p><strong>R - Recurring:</strong> How often does this problem happen? Higher scores mean the customer faces this challenge repeatedly rather than just occasionally.</p>
                                <p><strong>S - Specific:</strong> How well-defined is the problem? Higher scores indicate a clear, concrete issue rather than a vague feeling or general frustration.</p>
                                <p><strong>E - Extreme:</strong> How severe is the pain? Higher scores reflect problems that cause significant distress, wasted time, or financial impact.</p>
                                <p>The system combines these five dimensions to calculate an overall severity rating for each pain point. This helps prioritize which issues deserve immediate attention (Critical and High severity) versus those that can be addressed later (Moderate, Low, and Minimal severity).</p>
                              </div>
                            }
                          >
                            <span className="font-medium">CURSE Scores:</span>
                          </BackdropTooltip>{' '}
                          {Object.entries(pain.curseScore).map(([key, value]) => {
                            // Check if this is the new format with ranges and confidence
                            if (value && typeof value === 'object' && value.range) {
                              return (
                                <span key={key}>
                                  {key}: {value.range[0]}-{value.range[1]} ({value.confidence}){' '}
                                </span>
                              );
                            } else {
                              // Original format with direct values
                              return <span key={key}>{key}: {value}{' '}</span>;
                            }
                          })}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {pain.stakeholders?.map((stakeholder, idx) => (
                        <Badge key={idx} variant="outline">{stakeholder}</Badge>
                      ))}
                    </div>
                    {pain.metrics && pain.metrics.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Key Metrics:</span>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground">
                          {pain.metrics.map((metric, idx) => (
                            <li key={idx}>{metric}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              
            {/* Analysis Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Analysis Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    // Generate insights based on the pain points content
                    if (!identifiedPains || identifiedPains.length === 0) {
                      return 'No customer pain points were identified in this analysis.';
                    }
                    
                    // Get categories and their counts
                    const categories = {};
                    identifiedPains.forEach(pain => {
                      if (pain.category) {
                        categories[pain.category] = (categories[pain.category] || 0) + 1;
                      }
                    });
                    
                    // Sort categories by frequency
                    const sortedCategories = Object.entries(categories)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category]) => category);
                    
                    // Count critical and high severity pains
                    const criticalPains = identifiedPains.filter(p => calculateSeverityFromCurseScore(p.curseScore) === 'Critical');
                    const highPains = identifiedPains.filter(p => calculateSeverityFromCurseScore(p.curseScore) === 'High');
                    
                    // Extract titles of top pain points by severity
                    const topPainTitles = [...criticalPains, ...highPains]
                      .slice(0, 3)
                      .map(p => p.title.replace(/[.,;!]$/, ''));
                    
                    // Build the summary text
                    let summary = `This analysis identified ${identifiedPains.length} customer pain points `;
                    
                    if (sortedCategories.length > 0) {
                      if (sortedCategories.length === 1) {
                        summary += `in the ${sortedCategories[0]} category. `;
                      } else if (sortedCategories.length === 2) {
                        summary += `across ${sortedCategories[0]} and ${sortedCategories[1]} categories. `;
                      } else {
                        const mainCategories = sortedCategories.slice(0, 2).join(', ');
                        summary += `primarily in ${mainCategories}, and ${sortedCategories.length - 2} other categories. `;
                      }
                    }
                    
                    // Add information about critical/high pain points
                    if (criticalPains.length > 0) {
                      summary += `There ${criticalPains.length === 1 ? 'is' : 'are'} ${criticalPains.length} critical pain point${criticalPains.length === 1 ? '' : 's'} `;
                      if (topPainTitles.length > 0 && criticalPains.length <= 2) {
                        summary += `including "${criticalPains[0].title}" `;
                      }
                      summary += 'that require immediate attention. ';
                    }
                    
                    if (highPains.length > 0) {
                      summary += `There ${highPains.length === 1 ? 'is' : 'are'} also ${highPains.length} high severity pain point${highPains.length === 1 ? '' : 's'} `;
                      if (topPainTitles.length > 0 && highPains.length <= 2 && criticalPains.length === 0) {
                        summary += `such as "${highPains[0].title}" `;
                      }
                      summary += 'impacting customer experience. ';
                    }
                    
                    // Add common impact themes if available
                    const commonImpacts = identifiedPains
                      .map(p => p.impact)
                      .filter(Boolean)
                      .slice(0, 3);
                    
                    if (commonImpacts.length > 0) {
                      // Extract keywords from impacts
                      const impactText = commonImpacts.join(' ').toLowerCase();
                      const issueWords = ['delay', 'frustrat', 'confus', 'difficult', 'time', 'error', 'fail', 'complex', 'slow', 'cost'];
                      const foundIssues = issueWords.filter(word => impactText.includes(word));
                      
                      if (foundIssues.length > 0) {
                        summary += `Common issues include ${foundIssues.slice(0, 2).join(' and ')}, which are affecting customer satisfaction.`;
                      }
                    }
                    
                    return summary;
                  })()}
                </p>
                

              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      );
    };


  /**
   * Renders friction results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderFrictionResults = (result) => {
    if (!result) return null;

    console.log('Friction Analysis Results:', result);
    
    // Handle both new and old formats for backward compatibility
    // New format will have primaryGoal and inferences fields
    // Old format had frictionAnalysis and metrics directly at the top level
    
    let frictionAnalysis = [];
    let primaryGoal = null;
    let inferences = [];
    
    if (Array.isArray(result)) {
      // This means the results were passed directly as an array of friction points
      frictionAnalysis = result;
    } else if (typeof result === 'object') {
      // Check if we're dealing with the new format or old format
      if (result.frictionAnalysis) {
        // New format
        frictionAnalysis = result.frictionAnalysis || [];
        primaryGoal = result.primaryGoal || null;
        inferences = result.inferences || [];
      } else {
        // Assume this is already in the frictionAnalysis format but passed directly
        frictionAnalysis = result;
      }
    }
    
    // Backward compatibility for metrics
    const metrics = result?.metrics || { 
      totalFrictionPoints: frictionAnalysis.length,
      criticalBlockers: frictionAnalysis.filter(f => f.severity === 'Critical').length 
    };
    
    console.log('Extracted friction data:', {
      frictionAnalysisCount: frictionAnalysis.length,
      hasPrimaryGoal: !!primaryGoal,
      hasInferences: inferences.length > 0
    });

    // Only return null if we have no friction analysis data to display
    if (frictionAnalysis.length === 0 && !primaryGoal && inferences.length === 0) {
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Friction Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle>Frictions Preventing Progress</CardTitle>
            <CardDescription>
              {primaryGoal ? 
                `Analysis of friction points preventing progress toward: ${primaryGoal}` : 
                'Analysis of significant blockers and friction points'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{metrics?.totalFrictionPoints || frictionAnalysis.length}</div>
                  <div className="text-sm text-muted-foreground">Total Friction Points</div>
                </div>
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{metrics?.criticalBlockers || 0}</div>
                  <div className="text-sm text-muted-foreground">Critical Blockers</div>
                </div>
              </div>

              {/* Detailed Friction Points */}
              <div className="space-y-4">
                {frictionAnalysis.map((friction, index) => {
                  // Determine severity based on whether we're using the old or new format
                  const severity = friction.severity || 'Medium';
                  const { variant, className } = getSeverityBadgeStyles(severity);
                  
                  return (
                    <div key={`friction-${index}`} className="bg-secondary p-3 rounded-md mb-3 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold">{friction.title}</h4>
                        <BackdropTooltip
                          triggerClassName="inline-block"
                          className="max-w-md text-xs bg-secondary"
                          content={
                            <div className="space-y-2">
                              {severity === 'Critical' && (
                                <>
                                  <p>Existential threat to operations or goals.</p>
                                  <p>Immediately blocks progress; renders goals unachievable; demands urgent intervention</p>
                                </>
                              )}
                              {severity === 'High' && (
                                <>
                                  <p>Major obstacle to operations or goals.</p>
                                  <p>Significantly hinders progress; requires substantial resources to overcome; creates ongoing friction</p>
                                </>
                              )}
                              {severity === 'Medium' || severity === 'Moderate' && (
                                <>
                                  <p>Notable hindrance to efficiency.</p>
                                  <p>Measurable impact on time, resources, or quality; causes regular frustration</p>
                                </>
                              )}
                              {severity === 'Low' && (
                                <>
                                  <p>Minor inconvenience.</p>
                                  <p>Creates occasional inefficiencies; easily worked around; limited impact on goals</p>
                                </>
                              )}
                              {severity === 'Minimal' && (
                                <>
                                  <p>Barely noticeable friction.</p>
                                  <p>Negligible impact on operations; rarely noticed; extremely low priority</p>
                                </>
                              )}
                            </div>
                          }
                        >
                          <Badge variant={variant} className={className}>{severity} severity</Badge>
                        </BackdropTooltip>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium">Impact:</span> {friction.impact}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium text-muted-foreground">Supporting Evidence:</span> <span className="italic">{friction.evidence}</span></p>
                        
                        {friction.tags && friction.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {friction.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        
                        {friction.recommendations && friction.recommendations.length > 0 && (
                          <div className="mt-3">
                            <div className="bg-[#FAFBFD] p-3 rounded-md shadow-sm">
                              <p className="text-sm font-medium mb-1">Recommendations:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {friction.recommendations.map((rec, recIndex) => (
                                  <li key={recIndex}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Analysis Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Analysis Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    This analysis identified {frictionAnalysis.length} friction points that are preventing progress toward {primaryGoal ? `the primary goal of "${primaryGoal}"` : 'the customer\'s primary goal'}. 
                    {frictionAnalysis.filter(f => f.severity === 'Critical').length > 0 && 
                      `There ${frictionAnalysis.filter(f => f.severity === 'Critical').length === 1 ? 'is' : 'are'} ${frictionAnalysis.filter(f => f.severity === 'Critical').length} critical friction point${frictionAnalysis.filter(f => f.severity === 'Critical').length === 1 ? '' : 's'} that must be addressed immediately. `
                    }
                    {frictionAnalysis.filter(f => f.severity === 'High').length > 0 && 
                      `There ${frictionAnalysis.filter(f => f.severity === 'High').length === 1 ? 'is' : 'are'} ${frictionAnalysis.filter(f => f.severity === 'High').length} high severity friction point${frictionAnalysis.filter(f => f.severity === 'High').length === 1 ? '' : 's'} causing significant delays. `
                    }
                    Common themes include {Array.from(new Set(frictionAnalysis.flatMap(f => f.tags || []))).slice(0, 3).join(', ')}.
                  </p>
                  
                  {inferences && inferences.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Analysis Notes:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {inferences.map((inference, idx) => (
                          <li key={idx}>{inference.assumption}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inferences Section - Only shown if we have inferences */}
        {inferences && inferences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Inferences</CardTitle>
              <CardDescription>Additional context inferred from the transcript</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inferences.map((inference, index) => (
                  <div key={`inference-${index}`} className="border border-border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{inference.assumption}</h4>
                    <p className="text-sm mb-2">{inference.reasoning}</p>
                    
                    {inference.quotes && inference.quotes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Supporting quotes:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {inference.quotes.map((quote, quoteIndex) => (
                            <li key={quoteIndex} className="italic">"{quote}"</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* End of content */}
        
      </div>
    );
  };

  /**
   * Renders long context results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const LongContextResults = ({ results }) => {
    const [showDebug, setShowDebug] = useState(false);

    if (!results) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Run the Long Context Chunking analysis to see results here.</p>
        </div>
      );
    }

    const { finalSummary, sectionSummaries, chunks, metadata } = results;

    return (
      <div className="space-y-6">
        {/* Section Summaries */}
        <Card>
          <CardHeader>
            <CardTitle>Key Sections</CardTitle>
            <CardDescription>Major themes and topics from the conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectionSummaries.map((section, index) => (
                <Collapsible 
                  key={index}
                  open={openSections.longContext[`section-${index}`]} 
                  onOpenChange={(isOpen) => {
                    setOpenSections(prev => ({
                      ...prev,
                      longContext: {
                        ...prev.longContext,
                        [`section-${index}`]: isOpen
                      }
                    }));
                  }}
                >
                  <div className="bg-secondary p-4 rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <h4 className="font-semibold">Section {index + 1}</h4>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {section}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Debug View */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Button 
                variant="ghost" 
                className="p-0"
                onClick={() => setShowDebug(!showDebug)}
              >
                <Code className="h-4 w-4 mr-2" />
                Debug Information
                {showDebug ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {showDebug && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Metadata</h4>
                  <pre className="bg-secondary p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Original Chunks</h4>
                  <div className="space-y-2">
                    {chunks.map((chunk, index) => (
                      <Collapsible 
                        key={index}
                        open={openSections.longContext[`chunk-${index}`]} 
                        onOpenChange={(isOpen) => {
                          setOpenSections(prev => ({
                            ...prev,
                            longContext: {
                              ...prev.longContext,
                              [`chunk-${index}`]: isOpen
                            }
                          }));
                        }}
                      >
                        <div className="bg-secondary p-4 rounded-lg">
                          <CollapsibleTrigger className="flex items-center justify-between w-full">
                            <span className="font-mono text-sm">Chunk {index + 1}</span>
                            <ChevronDown className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <pre className="mt-2 text-sm overflow-x-auto whitespace-pre-wrap">
                              {chunk}
                            </pre>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  };

  /**
   * Renders chunking results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderChunkingResults = (result) => {
    if (!result || !result.chunks) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Run the Long Context Chunking agent to see results here.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {result.detailedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">{result.detailedAnalysis}</div>
            </CardContent>
          </Card>
        )}

        {result.chunkSummaries && result.chunkSummaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Chunk Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.chunkSummaries.map((summary, index) => (
                  <div key={index} className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Chunk {index + 1}</h4>
                    <div className="whitespace-pre-wrap">{summary}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Original Chunks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.chunks.map((chunk, index) => (
                <div key={index} className="bg-secondary p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Chunk {index + 1}</h4>
                  <div className="whitespace-pre-wrap">{chunk}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Renders needs analysis results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderNeedsAnalysis = (result) => {
    if (!result || !result.immediateNeeds || !result.latentNeeds) {
      console.error('Invalid needs analysis result structure:', result);
      return (
        <Card>
          <CardHeader>
            <CardTitle>Needs Analysis</CardTitle>
            <CardDescription>Error: Invalid result structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-red-500">
              Unable to display needs analysis results. The data structure is invalid.
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Needs Analysis</CardTitle>
          <CardDescription>Immediate and latent needs identified from the interview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Immediate Needs */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Immediate Needs</h3>
              <div className="space-y-4">
                {result.immediateNeeds.map((need, index) => (
                  <div key={index} className="bg-secondary p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{need.need}</h4>
                        <Badge variant={getUrgencyVariant(need.urgency)} className="mt-1">
                          {need.urgency} Urgency
                        </Badge>
                      </div>
                    </div>
                    {need.context && (
                      <p className="text-muted-foreground mt-2">{need.context}</p>
                    )}
                    {need.evidence && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                        <p className="text-sm text-muted-foreground italic">{need.evidence}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Latent Needs */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Latent Needs</h3>
              <div className="space-y-4">
                {result.latentNeeds.map((need, index) => (
                  <div key={index} className="bg-secondary p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{need.need}</h4>
                        <Badge variant={getConfidenceBadgeVariant(need.confidence)} className="mt-1">
                          {getConfidenceRange(need.confidence)} Confidence
                        </Badge>
                      </div>
                    </div>
                    {need.rationale && (
                      <p className="text-muted-foreground mt-2">{need.rationale}</p>
                    )}
                    {need.evidence && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                        <p className="text-sm text-muted-foreground italic">{need.evidence}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Insights if present */}
            {result.insights && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Additional Insights</h3>
                <div className="bg-secondary p-6 rounded-lg">
                  <p className="text-muted-foreground">{result.insights}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Renders demand analysis results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderDemandAnalysis = (result) => {
    if (!result) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Run the Demand Analyst agent to see results here.</p>
        </div>
      );
    }

    const getDemandLevelBadge = (level) => {
      switch (level) {
        case 1:
          return <Badge variant="secondary">Learning Demand (L1)</Badge>;
        case 2:
          return <Badge variant="default">Solution Demand (L2)</Badge>;
        case 3:
          return <Badge variant="success">Vendor Demand (L3)</Badge>;
        default:
          return <Badge variant="outline">Unknown Level</Badge>;
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Demand Analysis Results</span>
              <div className="flex flex-nowrap items-center gap-2">
                {getDemandLevelBadge(result.demandLevel)}
                <Badge variant="outline">Confidence: {getConfidenceRange(result.confidenceScore)}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Analysis Summary</h4>
                <p className="text-sm text-muted-foreground">{result.reasoning.summary}</p>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map(level => (
                  <Card key={level}>
                    <CardHeader>
                      <CardTitle className="text-sm">Level {level} Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.analysis[`level${level}Indicators`].map((indicator, index) => (
                          <div key={index} className="text-sm">
                            <p className="italic text-muted-foreground">"{indicator.quote}"</p>
                            <p className="text-xs text-muted-foreground mt-1">Context: {indicator.context}</p>
                          </div>
                        ))}
                        {result.analysis[`level${level}Indicators`].length === 0 && (
                          <p className="text-sm text-muted-foreground">No indicators found for this level</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {result.recommendations && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Next Steps</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.recommendations.nextSteps.map((step, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{step}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Areas for Investigation</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.recommendations.areasForInvestigation.map((area, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{area}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Renders opportunity qualification results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderOpportunityQualification = (result) => {
    if (!result) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Run the Opportunity Qualification agent to see results here.</p>
        </div>
      );
    }

    const getScoreColor = (score) => {
      switch (score) {
        case 5:
        case 4:
          return 'text-green-500';
        case 3:
          return 'text-orange-500';
        default:
          return 'text-red-500';
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Qualification Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Assessment */}
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Overall Assessment: {result.overallAssessment}</h3>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Problem Experience</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(result.scores.problemExperience.score)}`}>
                      {result.scores.problemExperience.score}/5
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Confidence: {getConfidenceRange(result.scores.problemExperience.confidence)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Active Search</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(result.scores.activeSearch.score)}`}>
                      {result.scores.activeSearch.score}/5
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Confidence: {getConfidenceRange(result.scores.activeSearch.confidence)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Problem Fit</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(result.scores.problemFit.score)}`}>
                      {result.scores.problemFit.score}/5
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Confidence: {getConfidenceRange(result.scores.problemFit.confidence)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Problem Experience</h4>
                    <p className="text-sm text-muted-foreground mb-2">{result.scores.problemExperience.analysis}</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.scores.problemExperience.evidence.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground italic">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Active Search</h4>
                    <p className="text-sm text-muted-foreground mb-2">{result.scores.activeSearch.analysis}</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.scores.activeSearch.evidence.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground italic">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Problem Fit</h4>
                    <p className="text-sm text-muted-foreground mb-2">{result.scores.problemFit.analysis}</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.scores.problemFit.evidence.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground italic">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.recommendations.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Red Flags</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.redFlags.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.limitations && result.limitations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Analysis Limitations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.limitations.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Renders final report results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderFinalReport = (result) => {
    if (!result) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Run the Final Research Analysis Report agent to see results here.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Final Research Analysis Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">{result.executiveSummary}</p>
              </div>

              {/* Key Findings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Key Findings</h3>

                {/* Current Situation */}
                <div className="space-y-2">
                  <h4 className="font-medium">Current Situation</h4>
                  <p className="text-sm text-muted-foreground">{result.keyFindings.currentSituation.summary}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.keyFindings.currentSituation.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Goals and Outcomes */}
                <div className="space-y-2">
                  <h4 className="font-medium">Goals and Desired Outcomes</h4>
                  <p className="text-sm text-muted-foreground">{result.keyFindings.goalsAndOutcomes.summary}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.keyFindings.goalsAndOutcomes.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Pain Points */}
                <div className="space-y-2">
                  <h4 className="font-medium">Pain Points and Areas of Friction</h4>
                  <p className="text-sm text-muted-foreground">{result.keyFindings.painPoints.summary}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.keyFindings.painPoints.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{point}</li>
                    ))}
                  </ul>
                </div>


              </div>

              {/* Strategic Recommendations */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.strategicRecommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{recommendation}</li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Next Steps</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.nextSteps.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{step}</li>
                  ))}
                </ul>
              </div>

              {/* Metadata */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <Badge variant={getConfidenceBadgeVariant(result.metadata.confidenceScore)}>
                    {getConfidenceRange(result.metadata.confidenceScore)}
                  </Badge>
                </div>
                {result.metadata.dataGaps.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Data Gaps</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.metadata.dataGaps.map((gap, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Renders JTBD primary goal results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderJTBDPrimaryGoal = (result) => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Job Components</CardTitle>
              <CardDescription>Key aspects of the job the customer is trying to accomplish</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result.jobComponents).map(([type, data]) => (
                  <div key={type} className="bg-secondary p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold capitalize">
                        {type} Jobs
                      </h4>
                      <BackdropTooltip 
                        content={
                          <div className="max-w-sm p-2">
                            {type === 'functional' && (
                              <span>The core action or task the customer is trying to accomplish, like drilling a hole.</span>
                            )}
                            {type === 'emotional' && (
                              <span>The feelings the customer wants to experience or avoid while doing the job, like feeling confident or avoiding frustration.</span>
                            )}
                            {type === 'social' && (
                              <span>How the customer wants to be perceived by others while doing the job, like being seen as handy or resourceful.</span>
                            )}
                          </div>
                        }
                        triggerClassName="cursor-help"
                      >
                        <svg className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </BackdropTooltip>
                    </div>
                    <p className="mb-2">{data.description}</p>
                    {data.evidence && data.evidence.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {data.evidence.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground">"<i>{item}</i>"</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Job Component Confidence Score */}
                    {result.analysis && result.analysis.confidenceScore && (
                      <div className="bg-[#FAFBFD] p-3 rounded-md mt-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Jobs Confidence:</h4>
                          <BackdropTooltip
                            content={
                              <div className="max-w-sm p-2">
                                <p className="font-medium mb-1">Confidence Score Rubric:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                  <li><span className="font-medium text-green-600">80-100%:</span> Strong evidence with explicit statements</li>
                                  <li><span className="font-medium text-amber-600">60-79%:</span> Moderate evidence with some inference</li>
                                  <li><span className="font-medium text-red-600">0-59%:</span> Limited evidence requiring significant inference</li>
                                </ul>
                              </div>
                            }
                            triggerClassName="cursor-help"
                          >
                            <Badge variant={getConfidenceBadgeVariant(
                              type === 'functional' ? result.analysis.confidenceScore * 100 : 
                              type === 'emotional' ? result.analysis.confidenceScore * 95 : 
                              result.analysis.confidenceScore * 90
                            )} className="cursor-help">
                              {getConfidenceRange(
                                type === 'functional' ? result.analysis.confidenceScore * 100 : 
                                type === 'emotional' ? result.analysis.confidenceScore * 95 : 
                                result.analysis.confidenceScore * 90
                              )} Confidence
                            </Badge>
                          </BackdropTooltip>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Indicates confidence in correctly identifying the customer's {type.toLowerCase()} job components. Low confidence may suggest further research is needed.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Primary Goal Analysis</CardTitle>
              </div>
              <CardDescription>Identifying the core objective that drives customer behavior and decision-making</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="font-medium">{result.primaryGoal.statement}</p>
                  {result.primaryGoal.context && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                      <p className="text-sm text-muted-foreground">"<i>{result.primaryGoal.context}</i>"</p>
                    </div>
                  )}
                </div>
                
                {/* Primary Goal Confidence Score */}
                {result.primaryGoal.confidence && (
                  <div className="bg-white/90 p-3 rounded-md mt-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">Primary Goal Confidence:</h4>
                      <BackdropTooltip
                        content={
                          <div className="max-w-sm p-2">
                            <p className="font-medium mb-1">Confidence Score Rubric:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li><span className="font-medium text-green-600">80-100%:</span> Strong evidence with explicit statements</li>
                              <li><span className="font-medium text-amber-600">60-79%:</span> Moderate evidence with some inference</li>
                              <li><span className="font-medium text-red-600">0-59%:</span> Limited evidence requiring significant inference</li>
                            </ul>
                          </div>
                        }
                        triggerClassName="cursor-help"
                      >
                        <Badge variant={getConfidenceBadgeVariant(result.primaryGoal.confidence * 100)} className="cursor-help">
                          {getConfidenceRange(result.primaryGoal.confidence * 100)} Confidence
                        </Badge>
                      </BackdropTooltip>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Indicates confidence in correctly identifying the customer's primary goal. Low confidence may suggest further research is needed in this area.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    );
  };

  /**
   * Renders JTBD gains results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderJTBDGains = (result) => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Desired Outcomes</CardTitle>
            <CardDescription>Specific positive results the customer is looking for from getting the job done</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Desired Outcomes */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Desired Outcomes</h3>
                  <BackdropTooltip
                    content={
                      <div className="max-w-sm p-2">
                        <span>The specific results customers hope to achieve when they successfully complete their job-to-be-done.</span>
                      </div>
                    }
                    triggerClassName="cursor-help"
                  >
                    <svg className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </BackdropTooltip>
                </div>
                <div className="grid gap-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    {result.desiredOutcomes.map((outcome, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{outcome.outcome}</h4>
                          </div>
                        </div>
                        {outcome.analysis && (
                          <div className="mt-2 mb-3">
                            <h5 className="text-sm font-medium">Analysis:</h5>
                            <p className="text-sm text-muted-foreground">{outcome.analysis}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {outcome.evidence.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground italic">{item}</li>
                            ))}
                          </ul>
                        </div>
                        {result.analysis.limitations && result.analysis.limitations.some(limitation => 
                          (limitation.toLowerCase().includes("desired outcomes") || 
                          limitation.toLowerCase().includes("emotional")) && 
                          !limitation.toLowerCase().includes("social") && 
                          !limitation.toLowerCase().includes("perception") && 
                          !limitation.toLowerCase().includes("status") && 
                          !limitation.toLowerCase().includes("performance") && 
                          !limitation.toLowerCase().includes("measurable") && 
                          !limitation.toLowerCase().includes("quantitative")
                        ) && (
                          <div className="mt-3 pt-2 border-t border-border">
                            <h5 className="text-sm font-medium text-muted-foreground">Note:</h5>
                            <ul className="list-disc pl-5 mt-1">
                              {result.analysis.limitations.filter(limitation => 
                                (limitation.toLowerCase().includes("desired outcomes") || 
                                limitation.toLowerCase().includes("emotional")) && 
                                !limitation.toLowerCase().includes("social") && 
                                !limitation.toLowerCase().includes("perception") && 
                                !limitation.toLowerCase().includes("status") && 
                                !limitation.toLowerCase().includes("performance") && 
                                !limitation.toLowerCase().includes("measurable") && 
                                !limitation.toLowerCase().includes("quantitative")
                              ).map((limitation, i) => (
                                <li key={i} className="text-xs italic text-muted-foreground">{limitation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Component Confidence Score */}
                    <div className="bg-[#FAFBFD] p-3 rounded-md mt-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">Desired Outcomes Confidence:</h4>
                        <BackdropTooltip
                          content={
                            <div className="max-w-sm p-2">
                              <p className="font-medium mb-1">Confidence Score Rubric:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li><span className="font-medium text-green-600">80-100%:</span> Strong evidence with explicit statements</li>
                                <li><span className="font-medium text-amber-600">60-79%:</span> Moderate evidence with some inference</li>
                                <li><span className="font-medium text-red-600">0-59%:</span> Limited evidence requiring significant inference</li>
                              </ul>
                            </div>
                          }
                          triggerClassName="cursor-help"
                        >
                          <Badge variant={getConfidenceBadgeVariant(result.analysis.desiredOutcomesConfidence || result.analysis.overallConfidence * 0.9)} className="cursor-help">
                            {getConfidenceRange(result.analysis.desiredOutcomesConfidence || result.analysis.overallConfidence * 0.9)} Confidence
                          </Badge>
                        </BackdropTooltip>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Indicates confidence in correctly identifying the customer's desired outcomes. Low confidence may suggest further research is needed in this area.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Gains */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Performance Gains</h3>
                  <BackdropTooltip
                    content={
                      <div className="max-w-sm p-2">
                        <span>Measurable improvements in functionality, efficiency, or effectiveness that customers seek when getting their job done.</span>
                      </div>
                    }
                    triggerClassName="cursor-help"
                  >
                    <svg className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </BackdropTooltip>
                </div>
                <div className="grid gap-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    {/* Render the individual Performance Gains */}
                    {result.performanceGains.map((gain, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{gain.gain}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <span className="font-medium">Current State:</span>
                            <p className="text-muted-foreground">{gain.currentState}</p>
                          </div>
                          <div>
                            <span className="font-medium">Target State:</span>
                            <p className="text-muted-foreground">{gain.targetState}</p>
                          </div>
                        </div>
                        {gain.analysis && (
                          <div className="mt-2 mb-2">
                            <h5 className="text-sm font-medium">Analysis:</h5>
                            <p className="text-sm text-muted-foreground">{gain.analysis}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {gain.evidence.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground italic">{item}</li>
                            ))}
                          </ul>
                        </div>
                        {result.analysis.limitations && result.analysis.limitations.some(limitation => 
                          (limitation.toLowerCase().includes("performance") || 
                          limitation.toLowerCase().includes("measurable") || 
                          limitation.toLowerCase().includes("quantitative")) && 
                          !limitation.toLowerCase().includes("social") && 
                          !limitation.toLowerCase().includes("perception") && 
                          !limitation.toLowerCase().includes("status") && 
                          !limitation.toLowerCase().includes("desired outcomes") && 
                          !limitation.toLowerCase().includes("emotional")
                        ) && (
                          <div className="mt-3 pt-2 border-t border-border">
                            <h5 className="text-sm font-medium text-muted-foreground">Note:</h5>
                            <ul className="list-disc pl-5 mt-1">
                              {result.analysis.limitations.filter(limitation => 
                                (limitation.toLowerCase().includes("performance") || 
                                limitation.toLowerCase().includes("measurable") || 
                                limitation.toLowerCase().includes("quantitative")) && 
                                !limitation.toLowerCase().includes("social") && 
                                !limitation.toLowerCase().includes("perception") && 
                                !limitation.toLowerCase().includes("status") && 
                                !limitation.toLowerCase().includes("desired outcomes") && 
                                !limitation.toLowerCase().includes("emotional")
                              ).map((limitation, i) => (
                                <li key={i} className="text-xs italic text-muted-foreground">{limitation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Component Confidence Score - moved inside the parent bg-secondary div like Desired Outcomes */}
                    <div className="bg-[#FAFBFD] p-3 rounded-md mt-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">Performance Gains Confidence:</h4>
                        <BackdropTooltip
                          content={
                            <div className="max-w-sm p-2">
                              <p className="font-medium mb-1">Confidence Score Rubric:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li><span className="font-medium text-green-600">80-100%:</span> Strong evidence with explicit statements</li>
                                <li><span className="font-medium text-amber-600">60-79%:</span> Moderate evidence with some inference</li>
                                <li><span className="font-medium text-red-600">0-59%:</span> Limited evidence requiring significant inference</li>
                              </ul>
                            </div>
                          }
                          triggerClassName="cursor-help"
                        >
                          <Badge variant={getConfidenceBadgeVariant(result.analysis.performanceGainsConfidence || result.analysis.overallConfidence * 0.85)} className="cursor-help">
                            {getConfidenceRange(result.analysis.performanceGainsConfidence || result.analysis.overallConfidence * 0.85)} Confidence
                          </Badge>
                        </BackdropTooltip>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Indicates confidence in identifying quantifiable improvements the customer seeks. Lower confidence may indicate limited measurable data in the transcript.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Gains */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Social Gains</h3>
                  <BackdropTooltip
                    content={
                      <div className="max-w-sm p-2">
                        <span>The positive social perceptions and status benefits customers want to achieve through how others see them while doing their job.</span>
                      </div>
                    }
                    triggerClassName="cursor-help"
                  >
                    <svg className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </BackdropTooltip>
                </div>
                <div className="grid gap-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    {result.socialGains.map((gain, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{gain.gain}</h4>
                            <p className="text-sm text-muted-foreground">{gain.context}</p>
                          </div>
                        </div>
                        {gain.analysis && (
                          <div className="mt-2 mb-2">
                            <h5 className="text-sm font-medium">Analysis:</h5>
                            <p className="text-sm text-muted-foreground">{gain.analysis}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {gain.evidence.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground italic">{item}</li>
                            ))}
                          </ul>
                        </div>
                        {result.analysis.limitations && result.analysis.limitations.some(limitation => 
                          limitation.toLowerCase().includes("social") || 
                          limitation.toLowerCase().includes("perception") || 
                          limitation.toLowerCase().includes("status")
                        ) && (
                          <div className="mt-3 pt-2 border-t border-border">
                            <h5 className="text-sm font-medium text-muted-foreground">Note:</h5>
                            <ul className="list-disc pl-5 mt-1">
                              {result.analysis.limitations.filter(limitation => 
                                limitation.toLowerCase().includes("social") || 
                                limitation.toLowerCase().includes("perception") || 
                                limitation.toLowerCase().includes("status")
                              ).map((limitation, i) => (
                                <li key={i} className="text-xs italic text-muted-foreground">{limitation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Component Confidence Score - moved inside the parent bg-secondary div like Desired Outcomes */}
                    <div className="bg-[#FAFBFD] p-3 rounded-md mt-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">Social Gains Confidence:</h4>
                        <BackdropTooltip
                          content={
                            <div className="max-w-sm p-2">
                              <p className="font-medium mb-1">Confidence Score Rubric:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li><span className="font-medium text-green-600">80-100%:</span> Strong evidence with explicit statements</li>
                                <li><span className="font-medium text-amber-600">60-79%:</span> Moderate evidence with some inference</li>
                                <li><span className="font-medium text-red-600">0-59%:</span> Limited evidence requiring significant inference</li>
                              </ul>
                            </div>
                          }
                          triggerClassName="cursor-help"
                        >
                          <Badge variant={getConfidenceBadgeVariant(result.analysis.socialGainsConfidence || result.analysis.overallConfidence * 0.75)} className="cursor-help">
                            {getConfidenceRange(result.analysis.socialGainsConfidence || result.analysis.overallConfidence * 0.75)} Confidence
                          </Badge>
                        </BackdropTooltip>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Indicates confidence in identifying social perception benefits. Lower confidence may suggest these were inferred rather than explicitly stated in the transcript.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Analysis Summary</h3>
                  <p className="text-sm text-muted-foreground">{result.analysis.summary}</p>
                  


                  {result.analysis.limitations && result.analysis.limitations.length > 0 && 
                   !result.analysis.limitations.some(limitation => 
                    limitation.toLowerCase().includes("desired outcomes") || 
                    limitation.toLowerCase().includes("emotional") || 
                    limitation.toLowerCase().includes("explicit detail") || 
                    limitation.toLowerCase().includes("performance") || 
                    limitation.toLowerCase().includes("measurable") || 
                    limitation.toLowerCase().includes("quantitative") || 
                    limitation.toLowerCase().includes("social") || 
                    limitation.toLowerCase().includes("perception") || 
                    limitation.toLowerCase().includes("status")
                   ) && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">General Limitations:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.analysis.limitations.filter(limitation => 
                          !limitation.toLowerCase().includes("desired outcomes") && 
                          !limitation.toLowerCase().includes("emotional") && 
                          !limitation.toLowerCase().includes("explicit detail") && 
                          !limitation.toLowerCase().includes("performance") && 
                          !limitation.toLowerCase().includes("measurable") && 
                          !limitation.toLowerCase().includes("quantitative") && 
                          !limitation.toLowerCase().includes("social") && 
                          !limitation.toLowerCase().includes("perception") && 
                          !limitation.toLowerCase().includes("status")
                        ).map((limitation, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{limitation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Renders problem awareness results
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderProblemAwareness = (result) => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Problem Awareness Matrix</CardTitle>
            <CardDescription>Analysis of understanding across key dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Problem Understanding Matrix */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Problem Understanding Matrix</h3>
                <div className="grid gap-4">
                  {result.matrix.map((item, index) => (
                    <div key={index} className="bg-secondary p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold">{item.dimension}</h4>
                        <Badge variant={getConfidenceBadgeVariant(item.score)}>
                          {item.score}% Understanding
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{item.analysis}</p>
                      <div className="space-y-2">
                        <div className="evidence-section">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Supporting Evidence:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {item.evidence.map((evidence, i) => (
                              <li key={i} className="text-sm text-muted-foreground italic">{evidence}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Analysis Summary</h3>
                  <p className="text-sm text-muted-foreground">{result.analysis.summary}</p>
                  


                  {result.analysis.limitations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Limitations</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.analysis.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{limitation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Helper function to determine badge variant based on overall assessment (Yes/No/Possibly)
   * Returns appropriate UI variant for the assessment badge
   */
  const getAssessmentBadgeVariant = (assessment) => {
    if (!assessment) return 'default';
    switch (assessment.toLowerCase()) {
      case 'yes':
        return 'destructive'; // Identified diminisher behaviour (highlight)
      case 'no':
        return 'success'; // No diminisher behaviour found
      case 'possibly':
      default:
        return 'warning'; // Ambiguous / possible
    }
  };

  /**
   * Renders 'The Idea Guy' Accidental Diminisher analysis results
   * New prompt output expected to contain:
   *  - overallAssessment (Yes/No/Possibly)
   *  - confidenceScore (0-100)
   *  - confidenceJustification (string)
   *  - detailedAnalysis: {
   *      specificExamples: [...],
   *      subtleCues: [...],
   *      frequencyIntensity: string,
   *      impactOnTeamMember: string
   *    }
   *  - suggestedAlternative (string, optional)
   */
  const renderIdeaGuyResults = (result) => {
    if (!result) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Run the Idea Guy analysis to see results here.</p>
        </div>
      );
    }

    // Handle both JSON structured output and simple key/value maps gracefully
    const {
      overallAssessment,
      confidenceScore,
      confidenceJustification,
      detailedAnalysis = {},
      suggestedAlternative,
    } = result;

    const {
      specificExamples = [],
      subtleCues = [],
      frequencyIntensity = '',
      impactOnTeamMember = '',
    } = detailedAnalysis;

    return (
      <div className="space-y-6">
        {/* Overall Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold">Does the manager exhibit 'Idea Guy' behaviour?</p>
              {overallAssessment && (
                <Badge variant={getAssessmentBadgeVariant(overallAssessment)}>
                  {overallAssessment}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Confidence Score */}
        {(confidenceScore !== undefined && confidenceScore !== null) && (
          <Card>
            <CardHeader>
              <CardTitle>Confidence Score</CardTitle>
              {confidenceJustification && (
                <CardDescription>{confidenceJustification}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={getConfidenceBadgeVariant(confidenceScore)} className="text-lg px-3 py-1">
                  {confidenceScore}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis &amp; Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Specific Examples */}
            {specificExamples.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Specific Examples</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {specificExamples.map((ex, i) => (
                    <li key={i} className="text-sm text-muted-foreground italic">“{ex}”</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subtle Cues */}
            {subtleCues.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Subtle Cues</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {subtleCues.map((cue, i) => (
                    <li key={i} className="text-sm text-muted-foreground italic">{cue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Frequency / Intensity */}
            {frequencyIntensity && (
              <div>
                <h4 className="font-medium mb-1">Frequency / Intensity</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{frequencyIntensity}</p>
              </div>
            )}

            {/* Impact on Team Member */}
            {impactOnTeamMember && (
              <div>
                <h4 className="font-medium mb-1">Impact on Team Member</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{impactOnTeamMember}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Alternative */}
        {suggestedAlternative && (
          <Card>
            <CardHeader>
              <CardTitle>Suggested Alternative (Multiplier) Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestedAlternative}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  /**
   * Handles download of analysis results
   * 
   * CHANGES (2025-03-12):
   * - Changed to download HTML replica of the current view instead of JSON
   * - Added styling to make the downloaded HTML match the UI appearance
   * - Includes DemandScan branding in the downloaded file
   */
  const handleDownload = () => {
    const result = localAnalysisResults[showResult];
    if (!result) return;
    
    // Get all stylesheets from the current document
    const stylesheets = Array.from(document.styleSheets);
    let cssText = '';
    
    // Extract CSS rules from all stylesheets
    stylesheets.forEach(sheet => {
      try {
        // Skip external stylesheets that might cause CORS issues
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) return;
        
        const rules = sheet.cssRules || sheet.rules;
        for (let i = 0; i < rules.length; i++) {
          cssText += rules[i].cssText + '\n';
        }
      } catch (e) {
        console.warn('Could not access stylesheet rules:', e);
      }
    });
    
    // Get the current page content
    const resultsContainer = document.querySelector('.space-y-8');
    if (!resultsContainer) return;
    
    // Clone the container to modify it without affecting the UI
    const containerClone = resultsContainer.cloneNode(true);
    
    // Remove any download buttons from the clone
    const downloadButtons = containerClone.querySelectorAll('button');
    downloadButtons.forEach(button => {
      if (button.textContent.includes('Download')) {
        button.parentNode.removeChild(button);
      }
    });
    
    // Process badges for the downloaded HTML using our utility function
    processBadgesForDownload(containerClone);
    
    // Get the title for the report
    const title = showResult === 'longContextChunking' 
      ? 'Transcript Analysis' 
      : (showResult && agents.find(a => a.id === showResult)?.name) || 'Analysis Results';
      
    // Process the HTML to handle badges - this needs to be done in a specific way
    // First create a temporary div to hold our content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = containerClone.innerHTML;
    
    // Find all pain point cards
    const cards = tempDiv.querySelectorAll('.bg-secondary.p-4.rounded-lg, .border.border-border.p-4.rounded-lg');
    
    cards.forEach(card => {
      // Look for header sections that contain badge text
      const headerSections = card.querySelectorAll('.flex.justify-between');
      
      headerSections.forEach(header => {
        // Get all the text nodes in the header
        const textElements = header.querySelectorAll('*');
        
        // Iterate through all elements to find one with severity text
        for (let i = 0; i < textElements.length; i++) {
          const element = textElements[i];
          const text = element.textContent?.toLowerCase() || '';
          
          // If this text contains a severity label
          if (text.includes('severity')) {
            let severityType = '';
            let severityColor = '';
            let severityClass = '';
            
            // Determine which severity level it is
            if (text.includes('critical')) {
              severityType = 'Critical severity';
              severityColor = '#F00D0D'; // New bright red
              severityClass = 'badge-critical';
            } else if (text.includes('high')) {
              severityType = 'High severity';
              severityColor = '#FE8C8C'; // New light red/pink
              severityClass = 'badge-high';
            } else if (text.includes('medium') || text.includes('moderate')) {
              severityType = text.includes('medium') ? 'Medium severity' : 'Moderate severity';
              severityColor = '#FFEE8C'; // New light yellow
              severityClass = 'badge-medium';
            } else if (text.includes('low')) {
              severityType = 'Low severity';
              severityColor = '#D5EAFF'; // New light blue
              severityClass = 'badge-low';
            } else if (text.includes('minimal')) {
              severityType = 'Minimal severity';
              severityColor = '#F0F7FF'; // New lighter blue
              severityClass = 'badge-minimal';
            }
            
            // If we found a valid severity, replace the element with our badge
            if (severityType) {
              // Create a HTML badge that matches our UI
              const badgeHTML = `<span class="badge ${severityClass}">${severityType}</span>`;
              
              // Since we need to replace the whole parent that contains the React component
              // Find the parent containing just this badge
              let badgeContainer = element;
              
              // Replace with our HTML badge
              badgeContainer.outerHTML = badgeHTML;
              break; // Found and processed a badge, move to next header
            }
          }
        }
      });
    });
    
    // Update our container clone with the processed content
    containerClone.innerHTML = tempDiv.innerHTML;
    
    // Set the background color to #FAFAFA as specified
    const appBackgroundColor = '#FAFAFA';
    
    // Create a new HTML document with all the styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DemandScan - ${title}</title>
        
        <!-- Application CSS -->
        <style>
          ${cssText}
          
          /* Additional styling for the report */
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background-color: ${appBackgroundColor};
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eaeaea;
          }
          
          .report-container {
            background-color: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #eaeaea;
            text-align: center;
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          /* Explicit badge styling for HTML export */
          .badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 500;
            line-height: 1;
            white-space: nowrap;
          }
          
          .badge-critical {
            background-color: #F00D0D !important; /* New bright red */
            color: white !important;
            border: none !important;
          }
          
          .badge-high {
            background-color: #FE8C8C !important; /* New light red/pink */
            color: black !important;
            border: none !important;
          }
          
          .badge-medium, .badge-moderate {
            background-color: #FFEE8C !important; /* New light yellow */
            color: black !important;
            border: none !important;
          }
          
          .badge-low {
            background-color: #D5EAFF !important; /* New light blue */
            color: #1e40af !important;
            border: none !important;
          }
          
          .badge-minimal {
            background-color: #F0F7FF !important; /* New lighter blue */
            color: #1e40af !important;
            border: none !important;
          }
          
          /* Override any problematic styles */
          button { display: none !important; }
          
          /* Print-friendly styles */
          @media print {
            body { padding: 0; background-color: white; }
            .report-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>DemandScan Analysis</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <!-- Main content with the same styling as the app -->
        <div class="report-container">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold">${title}</h2>
                <p class="text-muted-foreground">
                  ${showResult === 'longContextChunking' 
                    ? 'The remaining analysis process uses this data as input which helps ensure the AI gives explicit and accurate results.'
                    : showResult === 'jtbd'
                      ? 'Results from the transcript identifying what the customer is trying to accomplish.'
                      : 'Here are the detailed results of the analysis'
                  }
                </p>
              </div>
            </div>
            
            <div class="space-y-8">
              ${containerClone.innerHTML}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Generated by DemandScan - Customer Problem Analysis Tool</p>
        </div>
      </body>
      </html>
    `;
    
    // Add confidence rubric to the footer
    const htmlContentWithRubric = addConfidenceRubricToFooter(htmlContent);
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlContentWithRubric], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = `${showResult === 'longContextChunking' 
      ? 'transcript_analysis' 
      : showResult}_results.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Renders analysis results based on the selected result type
   * 
   * CHANGES (2025-02-03):
   * - Improved error handling and empty state display
   * - Added confidence score display
   * - Improved UI organization and readability
   */
  const renderResults = () => {
    switch (showResult) {
      case 'longContextChunking':
        return <LongContextResults results={localAnalysisResults[showResult]} />;
      case 'jtbd':
        // Determine whether result matches new Idea Guy structure (has overallAssessment) ; fallback to old if not
        const jtbdResult = localAnalysisResults?.jtbd;
        return jtbdResult && jtbdResult.overallAssessment !== undefined
          ? renderIdeaGuyResults(jtbdResult)
          : renderJTBDPrimaryGoal(jtbdResult);

      case 'opportunityQualification':
        return renderOpportunityQualification(localAnalysisResults?.opportunityQualification);
      case 'finalReport':
        return renderFinalReport(localAnalysisResults?.finalReport);
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {showResult === 'longContextChunking' 
                ? 'Transcript has been optimized'
                : (showResult && agents.find(a => a.id === showResult)?.name)
              }
            </h2>
            <p className="text-muted-foreground">
              {showResult === 'longContextChunking' 
                ? 'The remaining analysis process uses this data as input which helps ensure the AI gives explicit and accurate results.'
                : showResult === 'jtbd'
                  ? 'Results from the transcript identifying what the customer is trying to accomplish.'
                  : 'Here are the detailed results of the analysis'
              }
            </p>
          </div>
          {showResult && localAnalysisResults[showResult] && showResult !== 'longContextChunking' && (
            <Button
              variant="outline"
              onClick={handleDownload}
              className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
            >
              Download Results
            </Button>
          )}
        </div>

        <div className="space-y-8 pb-24">
          {renderResults()}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;