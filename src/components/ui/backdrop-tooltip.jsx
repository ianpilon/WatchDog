import React, { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * BackdropTooltip component that adds a dark backdrop overlay when the tooltip is visible
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - The tooltip trigger element
 * @param {React.ReactNode} props.content - The tooltip content
 * @param {string} props.className - Additional classes for the tooltip content
 * @param {string} props.triggerClassName - Additional classes for the trigger element
 * @param {object} props.contentProps - Additional props for the TooltipContent component
 */
const BackdropTooltip = ({ children, content, className, triggerClassName, contentProps }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Dark overlay when tooltip is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <TooltipProvider>
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger className={triggerClassName}>
            {children}
          </TooltipTrigger>
          <TooltipContent 
            className={cn("z-50", className)} 
            {...contentProps}
          >
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export { BackdropTooltip };
