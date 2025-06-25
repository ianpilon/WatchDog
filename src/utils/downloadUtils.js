/**
 * Utility functions for handling HTML downloads
 * 
 * These functions help ensure consistent styling and behavior
 * when downloading HTML content from the application.
 */

/**
 * Processes HTML content to ensure badges are properly styled in downloaded HTML
 * 
 * This function:
 * 1. Finds all badge elements using comprehensive selectors
 * 2. Applies appropriate styling based on badge content
 * 3. Handles badges inside tooltips
 * 4. Removes tooltip wrappers while preserving content
 * 
 * @param {HTMLElement} containerElement - The HTML container element to process
 * @returns {HTMLElement} - The processed container with properly styled badges
 */
export const processBadgesForDownload = (containerElement) => {
  if (!containerElement) return containerElement;
  
  // Define comprehensive selectors to catch all badge types
  const badgeSelectors = [
    '[class*="badge"]',  // Classes containing 'badge'
    '[data-badge]',        // Elements with data-badge attribute
    'span[class*="inline-flex"][class*="rounded"]', // Typical badge styling
    'span[class*="bg-"][class*="text-"][class*="rounded"]', // Color-styled badges
    // Specific to our app's badge components
    'span[class*="success"]', 
    'span[class*="warning"]',
    'span[class*="destructive"]',
    'span[class*="default"]',
    'span[class*="secondary"]',
    'span[class*="outline"]'
  ];
  
  // Process all badges in the container
  const badges = containerElement.querySelectorAll(badgeSelectors.join(', '));
  processBadgeElements(badges);
  
  // Handle badges that might be inside tooltip wrappers
  const tooltipWrappers = containerElement.querySelectorAll(
    '[role="tooltip"], [data-state], [data-radix-popper-content-wrapper]'
  );
  
  tooltipWrappers.forEach(wrapper => {
    // Process badges inside tooltips first
    const badgesInTooltip = wrapper.querySelectorAll(badgeSelectors.join(', '));
    processBadgeElements(badgesInTooltip);
    
    // Then handle the tooltip wrapper itself
    const parent = wrapper.parentNode;
    const child = wrapper.querySelector('*:not([role="tooltip"])');
    if (child && parent) {
      parent.replaceChild(child, wrapper);
    }
  });
  
  return containerElement;
};

/**
 * Helper function to process a collection of badge elements
 * 
 * @param {NodeList} badgeElements - Collection of badge elements to process
 */
const processBadgeElements = (badgeElements) => {
  badgeElements.forEach(badge => {
    // Get the text content of the badge
    const badgeText = badge.textContent.trim();
    
    // Skip empty badges
    if (!badgeText) return;
    
    // Determine the badge variant based on content
    const { bgColor, textColor, borderColor } = getBadgeColors(badgeText);
    
    // Create a new span with inline styling to replace the badge
    const newBadge = document.createElement('span');
    newBadge.textContent = badgeText;
    newBadge.style.display = 'inline-flex';
    newBadge.style.alignItems = 'center';
    newBadge.style.backgroundColor = bgColor;
    newBadge.style.color = textColor;
    newBadge.style.borderRadius = '9999px';
    newBadge.style.padding = '0.125rem 0.625rem';
    newBadge.style.fontSize = '0.75rem';
    newBadge.style.fontWeight = '600';
    newBadge.style.border = `1px solid ${borderColor}`;
    newBadge.style.lineHeight = '1.25';
    
    // Replace the original badge with our new one
    badge.parentNode.replaceChild(newBadge, badge);
  });
};

/**
 * Determines appropriate colors for a badge based on its text content
 * 
 * @param {string} badgeText - The text content of the badge
 * @returns {Object} - Object containing background, text, and border colors
 */
const getBadgeColors = (badgeText) => {
  // Default colors (gray)
  let bgColor = '#e5e7eb';
  let textColor = '#374151';
  let borderColor = '#d1d5db';
  
  // Success/High/Green variant
  if (badgeText.includes('80-100%') || 
      badgeText.toLowerCase().includes('high') || 
      badgeText.includes('strong evidence')) {
    bgColor = '#dcfce7'; // success/green background
    textColor = '#166534'; // success/green text
    borderColor = '#bbf7d0'; // success/green border
  } 
  // Warning/Medium/Amber variant
  else if (badgeText.includes('60-79%') || 
           badgeText.toLowerCase().includes('medium') || 
           badgeText.toLowerCase().includes('moderate') || 
           badgeText.includes('some inference')) {
    bgColor = '#fef3c7'; // warning/amber background
    textColor = '#92400e'; // warning/amber text
    borderColor = '#fde68a'; // warning/amber border
  } 
  // Destructive/Low/Red variant
  else if (badgeText.includes('0-59%') || 
           badgeText.toLowerCase().includes('low') || 
           badgeText.toLowerCase().includes('limited evidence')) {
    bgColor = '#fee2e2'; // destructive/red background
    textColor = '#b91c1c'; // destructive/red text
    borderColor = '#fecaca'; // destructive/red border
  } 
  // Critical variant (also red)
  else if (badgeText.toLowerCase().includes('critical')) {
    bgColor = '#fee2e2'; // destructive/red background
    textColor = '#b91c1c'; // destructive/red text
    borderColor = '#fecaca'; // destructive/red border
  }
  
  return { bgColor, textColor, borderColor };
};

/**
 * Adds a confidence score rubric to the footer of downloaded HTML
 * 
 * @param {string} htmlContent - The HTML content string
 * @returns {string} - HTML content with added confidence rubric in the footer
 */
export const addConfidenceRubricToFooter = (htmlContent) => {
  // Find the footer div
  const footerMatch = htmlContent.match(/<div class="footer">([\s\S]*?)<\/div>/);
  
  if (!footerMatch) return htmlContent;
  
  const footerContent = footerMatch[0];
  const rubricHtml = `
    <div class="footer">
      <p>Generated by DemandScan - Customer Problem Analysis Tool</p>
      
      <div class="confidence-rubric" style="margin-top: 20px; padding: 15px; border-top: 1px solid #e5e7eb; text-align: left;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Confidence Score Rubric:</h4>
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <p style="font-weight: 500; margin-bottom: 5px;">
              <span style="display: inline-block; padding: 2px 8px; background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 9999px; font-size: 12px;">80-100% Confidence</span>
            </p>
            <p style="font-size: 13px; color: #6b7280; margin-top: 5px;">Strong evidence with explicit statements in the transcript</p>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <p style="font-weight: 500; margin-bottom: 5px;">
              <span style="display: inline-block; padding: 2px 8px; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 9999px; font-size: 12px;">60-79% Confidence</span>
            </p>
            <p style="font-size: 13px; color: #6b7280; margin-top: 5px;">Moderate evidence with some inference required</p>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <p style="font-weight: 500; margin-bottom: 5px;">
              <span style="display: inline-block; padding: 2px 8px; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 9999px; font-size: 12px;">0-59% Confidence</span>
            </p>
            <p style="font-size: 13px; color: #6b7280; margin-top: 5px;">Limited evidence requiring significant inference</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return htmlContent.replace(footerContent, rubricHtml);
};
