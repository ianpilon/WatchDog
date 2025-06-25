# Final Behavioral Report Code Reference

Below is the code responsible for displaying and styling the Final Behavioral Report in the application. You can reference this file later if you need to recreate or modify the report's rendering logic.

```javascript
const renderBehavioralReport = (result) => {
  if (!result)
    return <p className="text-muted-foreground">No behavioral report generated.</p>;

  const {
    reportTitle,
    behavioralOverview,
    multiplierInsights,
    diminisherInsights,
    sentimentPatterns,
    actionableRecommendations,
    reportConfidence,
  } = result;

  // Fallback title if none provided
  const title = reportTitle || "Final Behavioral Report";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderSection("Behavioral Overview", behavioralOverview)}

        {multiplierInsights && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-sky-700">
              Multiplier Insights
            </h3>
            {renderSection("Summary", multiplierInsights.summary)}
            {multiplierInsights.keyExamples &&
              multiplierInsights.keyExamples.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-md font-medium mb-1 text-gray-600">
                    Key Examples:
                  </h4>
                  {multiplierInsights.keyExamples.map((example, index) => (
                    <Card
                      key={`multiplier-${index}`}
                      className="mb-3 p-3 bg-sky-50 border-sky-200 shadow-sm"
                    >
                      {renderSection(
                        "Behavior Type",
                        example.behaviorType,
                        "mb-1 text-sm font-semibold text-sky-800"
                      )}
                      {example.specificExample &&
                        renderSection(
                          "Specific Example",
                          <pre className="whitespace-pre-wrap text-xs">
                            {example.specificExample}
                          </pre>,
                          "mb-1"
                        )}
                      {renderSection(
                        "Analysis",
                        example.analysis,
                        "mb-1 text-xs"
                      )}
                      {renderSection(
                        "Observed Impact",
                        example.observedImpact,
                        "text-xs"
                      )}
                    </Card>
                  ))}
                </div>
              )}
            {multiplierInsights.overallStrengthsDemonstrated &&
              multiplierInsights.overallStrengthsDemonstrated.length > 0 &&
              renderSection(
                "Overall Strengths Demonstrated",
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {multiplierInsights.overallStrengthsDemonstrated.map((strength, i) => (
                    <li key={`strength-${i}`}>{strength}</li>
                  ))}
                </ul>
              )}
          </div>
        )}

        {diminisherInsights && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2 text-red-700">
              Diminisher Insights
            </h3>
            {renderSection("Summary", diminisherInsights.summary)}
            {diminisherInsights.keyExamples &&
              diminisherInsights.keyExamples.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-md font-medium mb-1 text-gray-600">
                    Key Examples:
                  </h4>
                  {diminisherInsights.keyExamples.map((example, index) => (
                    <Card
                      key={`diminisher-${index}`}
                      className="mb-3 p-3 bg-red-50 border-red-200 shadow-sm"
                    >
                      {renderSection(
                        "Behavior Type",
                        example.behaviorType,
                        "mb-1 text-sm font-semibold text-red-800"
                      )}
                      {example.specificExample &&
                        renderSection(
                          "Specific Example",
                          <pre className="whitespace-pre-wrap text-xs">
                            {example.specificExample}
                          </pre>,
                          "mb-1"
                        )}
                      {renderSection(
                        "Analysis",
                        example.analysis,
                        "mb-1 text-xs"
                      )}
                      {renderSection(
                        "Observed Impact",
                        example.observedImpact,
                        "text-xs"
                      )}
                    </Card>
                  ))}
                </div>
              )}
            {diminisherInsights.areasForDevelopment &&
              diminisherInsights.areasForDevelopment.length > 0 &&
              renderSection(
                "Areas for Development",
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {diminisherInsights.areasForDevelopment.map((area, i) => (
                    <li key={`devArea-${i}`}>{area}</li>
                  ))}
                </ul>
              )}
          </div>
        )}

        {sentimentPatterns && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2 text-amber-700">
              Sentiment Patterns
            </h3>
            {renderSection("Overall Sentiment", sentimentPatterns.overallSentiment)}
            {sentimentPatterns.keyObservations &&
              sentimentPatterns.keyObservations.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-md font-medium mb-1 text-gray-600">
                    Key Observations:
                  </h4>
                  {sentimentPatterns.keyObservations.map((obs, index) => (
                    <Card
                      key={`sentiment-obs-${index}`}
                      className="mb-3 p-3 bg-amber-50 border-amber-200 shadow-sm"
                    >
                      {renderSection("Observation", obs.observation, "mb-1 text-xs")}
                      {obs.linkedBehavior &&
                        renderSection(
                          "Linked Behavior",
                          obs.linkedBehavior,
                          "text-xs text-gray-500"
                        )}
                    </Card>
                  ))}
                </div>
              )}
          </div>
        )}

        {actionableRecommendations && actionableRecommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2 text-green-700">
              Actionable Recommendations
            </h3>
            <ul className="space-y-2">
              {actionableRecommendations.map((rec, index) => (
                <li
                  key={`rec-${index}`}
                  className="p-3 border rounded-md bg-green-50 border-green-200 shadow-sm"
                >
                  <p className="font-medium text-sm text-green-800">
                    {rec.recommendation}
                  </p>
                  {rec.focusArea && (
                    <p className="text-xs text-gray-500 mt-1">
                      Focus Area: {rec.focusArea}
                    </p>
                  )}
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
```

*Note: The code above uses Tailwind CSS for styling along with custom components like `Card`, `CardHeader`, `CardTitle`, and `CardContent`. It also utilizes a helper function `renderSection` to render different sections with consistent styling.*
