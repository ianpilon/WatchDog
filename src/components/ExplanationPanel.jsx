import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Pre-bundled raw markdown so Vite can include it at build time
// eslint-disable-next-line import/no-unresolved
import explicitMd from '../../md_file_folder/explicit_analysis_criteria.md?raw';
// eslint-disable-next-line import/no-unresolved
import contextualMd from '../../md_file_folder/contextual_analysis_criteria.md?raw';

/**
 * Lightweight panel that explains why the agent classified behaviour as Explicit or Contextual.
 * Props:
 *  - quotes: array of strings shown as evidence (optional)
 *  - type: 'explicit' or 'contextual'
 */
const ExplanationPanel = ({ quotes = [], type = 'explicit' }) => {
  const [markdown, setMarkdown] = useState('');

  // Load the correct markdown based on type
  useEffect(() => {
    try {
      const mdContent = type === 'explicit' ? explicitMd : contextualMd;
      setMarkdown(mdContent || '');
    } catch {
      // Fallback short description if import failed (should not happen if files exist)
      if (type === 'explicit') {
        setMarkdown('# Explicit Analysis\nFocuses on clear, repeated diminishing behaviour with observable impact.');
      } else {
        setMarkdown('# Contextual Analysis\nSurfaces subtler cues that may indicate diminishing patterns.');
      }
    }
  }, [type]);

  return (
    <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100 space-y-3 text-sm">
      <h4 className="font-semibold">Why this classification?</h4>
      <div>
        <strong>{type === 'explicit' ? 'Explicit criteria:' : 'Contextual criteria:'}</strong>
        {type === 'explicit' ? (
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li><strong>Clear evidence required</strong> - Needs multiple instances matching known patterns</li>
            <li><strong>High frequency/intensity</strong> - Must appear often or with significant force</li>
            <li><strong>Observable impact</strong> - Direct evidence of team disruption</li>
          </ul>
        ) : (
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li><strong>Pattern recognition</strong> - Looks for subtle cues that combine into potential concerns</li>
            <li><strong>Lower threshold</strong> - May flag isolated instances worth monitoring</li>
            <li><strong>Implied impact</strong> - Considers potential effects even without direct evidence</li>
          </ul>
        )}
      </div>

      {quotes && quotes.length > 0 && (
        <div>
          <strong>Supporting quotes considered:</strong>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            {quotes.map((q, i) => (
              <li key={`q-${i}`} className="italic">“{q}”</li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple markdown rendering – fallback to raw text if markdown lib unavailable */}
      {markdown && (
        <div className="pt-2 border-t">
          <details>
            <summary className="cursor-pointer text-blue-600">Learn more about {type === 'explicit' ? 'Explicit Analysis' : 'Contextual Analysis'}</summary>
            <div className="prose mt-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="mb-4 mt-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="mb-3 mt-5" {...props} />,
                  h3: ({node, ...props}) => <h3 className="mb-2 mt-4" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-4 list-disc ml-5" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="italic border-l-4 pl-4 my-4" {...props} />
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
