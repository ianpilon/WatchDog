import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQs = () => {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="bg-white p-4 rounded-lg shadow">
          <AccordionTrigger className="text-lg font-medium">What is NeuroKick?</AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-700">
              A tool that analyzes leadership conversation transcripts, extracts key insights about leadership behaviours, and generates detailed analysis reports using specialized AI Agents.
            </p>
            <p className="text-gray-700 mt-2">
              Uses sophisticated prompt engineering for core problem extraction, identifying explicit and implicit needs, leadership requirements, and desired outcomes, identify's both immediate and future needs, evaluates the problem opportunity for fit and go/no go decision-making.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="bg-white p-4 rounded-lg shadow">
          <AccordionTrigger className="text-lg font-medium">How the system interprets qualitative data</AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-700 space-y-4">
              <h3 className="font-semibold text-lg">Understanding NeuroKick's Approach to Qualitative Assessment</h3>
              
              <p>
                NeuroKick's "The Idea Guy" analyzer uses a systematic approach to identify and evaluate "Accidental Diminisher" leadership behaviors in conversations. Here's how the system assesses qualitative data:
              </p>
              
              <h4 className="font-medium text-base mt-4">1. Dual Assessment Framework</h4>
              <p>
                The system employs two complementary analysis methods to address different levels of behavioral evidence:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Explicit Evidence Assessment</strong>: Identifies clear, repeated instances with observable impact</li>
                <li><strong>Suggestive Evidence Assessment</strong>: Detects subtle cues that may indicate potential behavior patterns</li>
                <li><strong>Behavioral Report</strong>: Synthesizes both assessments into actionable insights and recommendations</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">2. Evidence Point System</h4>
              <p>
                The Suggestive Evidence Assessment uses a point-based rubric with three key dimensions:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Pattern Strength</strong>: How closely a cue matches a specific behavior pattern (+1 pt)</li>
                <li><strong>Frequency/Intensity</strong>: Whether behavior appears multiple times or with notable force (+1 pt)</li>
                <li><strong>Impact</strong>: Whether it coincides with silence, derailment, or idea abandonment (+1 pt)</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">3. Impression Scale Rating</h4>
              <p>
                Cumulative points map to four evidence-based impression levels:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Unlikely</strong>: Few or ambiguous cues (0–2 pts). &lt; 25% confidence in pattern existence</li>
                <li><strong>Possibly</strong>: Some subtle cues but limited or inconsistent evidence (3–4 pts). 25–50% confidence</li>
                <li><strong>Likely</strong>: Consistent subtle cues suggesting a probable pattern (5–6 pts). 50–75% confidence</li>
                <li><strong>Very Likely</strong>: Strong, recurring cues clearly indicating a pattern (7+ pts). &gt; 75% confidence</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">4. AI Confidence Assessment</h4>
              <p>
                The AI provides a meta-evaluation of its own assessment reliability:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Minimally Confident (Low)</strong>: Limited or ambiguous evidence; difficult to determine conclusively; significant alternative explanations exist</li>
                <li><strong>Moderately Confident</strong>: Some evidence, but with inconsistencies or mixed signals; alternative interpretations possible</li>
                <li><strong>Highly Confident</strong>: Clear, consistent evidence throughout; multiple supporting instances; minimal ambiguity</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">5. Evidence-Based Visualization</h4>
              <p>
                The interface clearly communicates assessment certainty through multiple visual elements:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Impression Statements</strong>: Clear articulation of behavioral pattern with confidence level (e.g., "'Possibly' exhibiting 'The Idea Guy' Accidental Diminisher behavior")</li>
                <li><strong>Color-Coded Confidence</strong>: Intuitive pills showing confidence levels (red for Low, yellow for Moderate, green for High)</li>
                <li><strong>Information Tooltips</strong>: Detailed explanations of how assessments and confidence levels are determined</li>
                <li><strong>Supporting Evidence</strong>: Direct quotes and subtle indicators that informed the assessment</li>
              </ul>
              
              <p className="mt-4">
                This systematic approach ensures that leadership behavior assessments maintain scientific rigor while clearly communicating degrees of certainty, enabling users to make informed decisions based on transparent, evidence-grounded insights.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="bg-white p-4 rounded-lg shadow">
          <AccordionTrigger className="text-lg font-medium">How does 'The Idea Guy' Leadership Analysis work?</AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-700 space-y-4">
              <p>
                The Idea Guy analyzer is a specialized tool that identifies and evaluates "Accidental Diminisher" leadership behaviors in conversation transcripts, with a focus on the "Idea Guy" pattern. Here's how it works:
              </p>
              
              <ol className="list-decimal list-inside space-y-3">
                <li><strong>Transcript Processing:</strong> The system takes leadership conversation transcripts as input, optimizes them for analysis, and processes them using specialized GPT-4o-powered agents.</li>
                
                <li><strong>Dual Analysis Approach:</strong> The system employs two complementary analysis methods:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li><strong>Explicit Evidence Assessment:</strong> Looks for clear, repeated instances of "Idea Guy" behavior with observable impact</li>
                    <li><strong>Suggestive Evidence Assessment:</strong> Detects subtle cues that may indicate "Idea Guy" behavior patterns</li>
                  </ul>
                </li>
                
                <li><strong>"Idea Guy" Behavioral Indicators:</strong> The system analyzes manager behaviors such as:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>Rapidly generating multiple ideas or suggestions that may overwhelm team members</li>
                    <li>Introducing new concepts before previous ones are fully explored</li>
                    <li>Enthusiasm for own ideas overshadowing team members' contributions</li>
                    <li>Evidence of team struggling to keep up with influx of ideas</li>
                    <li>Limited space for team members to develop their own ideas</li>
                  </ul>
                </li>
                
                <li><strong>Evidence Point System:</strong>
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>Each subtle cue is evaluated on pattern strength, frequency/intensity, and impact</li>
                    <li>Points accumulate to determine the overall impression (Unlikely, Possibly, Likely, Very Likely)</li>
                    <li>The AI also provides a meta-evaluation of its own confidence (Minimally, Moderately, or Highly Confident)</li>
                  </ul>
                </li>
                
                <li><strong>Final Behavioral Report:</strong> The system synthesizes all analyses into a comprehensive report containing:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>Behavioral overview with specific examples of "Idea Guy" behaviors</li>
                    <li>Multiplier insights showcasing positive leadership moments</li>
                    <li>Diminisher insights highlighting areas of concern</li>
                    <li>Sentiment patterns observed throughout the conversation</li>
                    <li>Actionable recommendations for improving leadership effectiveness</li>
                  </ul>
                </li>
                
                <li><strong>Alternative Multiplier Approaches:</strong>
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>For each identified "Idea Guy" pattern, the system suggests alternative "Multiplier" approaches the manager could have taken</li>
                    <li>Recommendations focus on becoming a "Challenger" or "Liberator" instead of an "Idea Guy"</li>
                    <li>Specific, context-aware suggestions tied to the actual conversation transcript</li>
                  </ul>
                </li>
              </ol>
              
              <p>
                This system helps leaders identify potential accidental diminishing behaviors in their management style and provides actionable guidance for shifting toward multiplier leadership practices that amplify team intelligence and capability.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="bg-white p-4 rounded-lg shadow">
          <AccordionTrigger className="text-lg font-medium">Where is my data stored?</AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-700 space-y-4">
              <p className="font-medium italic mb-4">
                NeuroKick prioritizes a local-first approach with temporary cloud processing, minimizing persistent data storage outside your control.
              </p>
              
              <h3 className="font-semibold text-lg">Data Collection and Usage</h3>
              
              <p>
                When using NeuroKick, you primarily provide:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Leadership conversation transcripts</li>
                <li>Project information and metadata</li>
                <li>User authentication information</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">Data Processing Journey</h4>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Initial Upload</strong>: When you upload leadership conversation transcripts, this text data is temporarily stored in the application's memory.</li>
                <li><strong>AI Processing</strong>: The transcripts are sent to specialized AI agents built around GPT-4o that analyze the content, extracting pain points, jobs-to-be-done insights, problem awareness metrics, and other leadership insights.</li>
                <li><strong>Structured Data Creation</strong>: The AI analysis transforms raw transcript text into structured data with metrics, confidence levels, and evidence-backed insights.</li>
              </ol>
              
              <h4 className="font-medium text-base mt-4">Storage Architecture</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Local Storage</strong>: NeuroKick stores analysis results in your browser using local storage mechanisms.</li>
                <li><strong>No Central Database</strong>: There is no centralized server database that persistently stores your data.</li>
                <li><strong>Temporary Processing</strong>: Data is temporarily held in memory during processing before being presented in the UI and stored locally.</li>
                <li><strong>GPT API Integration</strong>: When data is sent to GPT-4o for analysis, it passes through OpenAI's API, which has its own data handling policies.</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">Privacy Considerations</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Transcript Content</strong>: The leadership conversation transcripts contain the most sensitive information, potentially including personal opinions and business-specific information.</li>
                <li><strong>Evidence Extraction</strong>: The system extracts verbatim quotes as evidence, which means portions of original transcripts are preserved in the analysis results.</li>
                <li><strong>Limited Data Sharing</strong>: NeuroKick does not share your data with third parties beyond the necessary AI processing services.</li>
                <li><strong>Local-First Approach</strong>: By emphasizing local storage, the application minimizes data exposure.</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">User Control</h4>
              <p>
                You maintain control of your data, with the ability to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Delete local data</li>
                <li>Choose what transcripts to upload</li>
                <li>Export or share results when needed</li>
              </ul>
              
              <h4 className="font-medium text-base mt-4">Data Security</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Transcript data is processed through secure API connections</li>
                <li>Results are stored locally on your device, providing inherent security through isolation</li>
                <li>The evidence-grounded approach means that analysis can always be traced back to specific transcript content</li>
              </ul>
              

            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FAQs;
