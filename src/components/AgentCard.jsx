import React, { useEffect, useRef, useState } from 'react';
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getCurrentStepLabel } from "../utils/agentStepDefinitions";

const AgentCard = ({ 
  agent, 
  progress = 0, 
  onViewResults,
  isAnalyzing = false,
  hasResults = false,
  isComplete,  
  className = '',
  isOptimizingTranscript = false,
  optimizationProgress = 0,
  isSelected = false,
  stepText = ""
}) => {
  const agentId = agent.id; // Extract agent.id variable
  // For tracking state changes
  const prevIsAnalyzing = useRef(isAnalyzing);
  // For simulated progress effect
  const [displayProgress, setDisplayProgress] = useState(progress);
  const progressTimerRef = useRef(null);
  const prevIsOptimizing = useRef(isOptimizingTranscript);
  const prevProgress = useRef(progress);
  const prevOptProgress = useRef(optimizationProgress);
  // For step text
  const [currentStepText, setCurrentStepText] = useState(stepText || "Analysis in progress");
  
  // Log meaningful state changes to help debugging
  useEffect(() => {
    // Log when analysis starts or stops
    if (prevIsAnalyzing.current !== isAnalyzing) {
      console.log(`AgentCard ${agentId}: isAnalyzing changed ${prevIsAnalyzing.current} -> ${isAnalyzing}`);
      prevIsAnalyzing.current = isAnalyzing;
    }
    
    // Log when optimization starts or stops
    if (prevIsOptimizing.current !== isOptimizingTranscript) {
      console.log(`AgentCard ${agentId}: isOptimizingTranscript changed ${prevIsOptimizing.current} -> ${isOptimizingTranscript}`);
      prevIsOptimizing.current = isOptimizingTranscript;
    }
    
    // Log when progress reaches 100%
    if (prevProgress.current !== progress && progress === 100) {
      console.log(`AgentCard ${agentId}: Progress reached 100%`);
    }
    prevProgress.current = progress;
    
    // Log when optimization progress reaches 100%
    if (prevOptProgress.current !== optimizationProgress && optimizationProgress === 100) {
      console.log(`AgentCard ${agentId}: Optimization progress reached 100%`);
    }
    prevOptProgress.current = optimizationProgress;
  }, [agentId, isAnalyzing, isOptimizingTranscript, progress, optimizationProgress]);
  
  // Update the step text whenever any relevant props change
  useEffect(() => {
    // Directly set the text without any transitions
    if (stepText) {
      // If explicitly provided, use that
      setCurrentStepText(stepText);
    } else if (isAnalyzing && agentId) {
      // Generate dynamic text based on the agent and progress
      setCurrentStepText(getCurrentStepLabel(agentId, progress) || "Analysis in progress");
    } else if (isOptimizingTranscript) {
      // Generate text based on optimization progress
      if (optimizationProgress < 30) {
        setCurrentStepText("Scanning transcript...");
      } else if (optimizationProgress < 60) {
        setCurrentStepText("Optimizing content...");
      } else {
        setCurrentStepText("Finalizing optimization...");
      }
    }
  }, [agentId, progress, optimizationProgress, stepText, isAnalyzing, isOptimizingTranscript]);
  
  // Effect for simulating incremental progress movement
  useEffect(() => {
    // Clear any existing timer when component unmounts or when analysis stops
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, []);
  
  // Effect to handle progress updates and simulation
  useEffect(() => {
    // Update display progress when actual progress changes
    setDisplayProgress(progress);
    
    // Clear any existing timer when progress changes
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    
    // Only set up incremental progress if we're analyzing and not at 100%
    if ((isAnalyzing || isOptimizingTranscript) && progress < 100 && !hasResults) {
      // Calculate the maximum progress we should simulate to (never exceed actual progress + 10%)
      const maxSimulatedProgress = Math.min(progress + 10, 95);
      
      // Start a timer that increments the display progress slightly every 300ms
      progressTimerRef.current = setInterval(() => {
        setDisplayProgress(current => {
          // Only increment if we haven't reached the max simulated progress
          if (current < maxSimulatedProgress) {
            // Increment by a random small amount between 0.1 and 0.5
            return Math.min(current + (Math.random() * 0.4 + 0.1), maxSimulatedProgress);
          }
          return current;
        });
      }, 300);
    }
    
    // Clean up timer when progress reaches 100 or analysis stops
    if (progress >= 100 || hasResults || (!isAnalyzing && !isOptimizingTranscript)) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
  }, [progress, isAnalyzing, isOptimizingTranscript, hasResults]);
  
  const getStatusBadge = () => {
    // First priority: Show grey optimization progress
    if (isOptimizingTranscript) {
      // Use displayProgress for smoother animation
      const displayOptProgress = isOptimizingTranscript ? displayProgress : optimizationProgress;
      console.log('Showing grey progress bar:', displayOptProgress);
      return (
        <Badge 
          variant="outline" 
          className="text-gray-500 border-transparent bg-transparent flex flex-col gap-2 p-0 w-full"
        >
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-1 px-0">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                {currentStepText || "Optimizing transcript"}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                key={`${agentId}-bar-${progress}`}
                className="h-full bg-gray-400" 
                style={{ width: `${displayOptProgress}%` }}
              />
            </div>
          </div>
        </Badge>
      );
    }
    
    // Second priority: Show green analysis progress
    // Only show if not optimizing transcript AND no results available yet
    if ((isAnalyzing || (progress > 0 && progress < 100)) && !isOptimizingTranscript && !hasResults) {
      // Use displayProgress for smoother animation
      console.log('Showing green progress bar:', displayProgress, 'hasResults:', hasResults);
      return (
        <Badge 
          variant="outline" 
          className="text-green-600 border-transparent bg-transparent flex flex-col gap-2 p-0 w-full"
        >
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-1 px-0">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                {currentStepText || "Analysis in progress"}
              </span>
            </div>
            <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
              <div 
                key={`${agentId}-bar-${progress}`}
                className="h-full bg-green-500" 
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        </Badge>
      );
    }
    
    // No badge shown for completed or waiting agents
    return null;
  };

  const getActionButton = () => {
    // Check hasResults first (for AI Agent Analysis), then fall back to isComplete if provided
    if (hasResults || (isComplete === true)) {  
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewResults}
          className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
        >
          View Results
        </Button>
      );
    }
    return null;
  };

  // Determine if the card should be clickable (only if it has results)
  const isClickable = hasResults || (isComplete === true);
  
  return (
    <Card 
      className={`flex flex-col p-4 ${className} ${isSelected ? 'border-blue-200 border-2' : ''} ${isClickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
      onClick={() => {
        if (isClickable) {
          onViewResults();
        }
      }}
    >
      <div className="flex-grow">
        <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          {agent.description}
        </CardDescription>
      </div>

      <div className="mt-4 flex justify-between items-center min-h-[24px]">
        <div className="flex-grow">
          {getStatusBadge()}
        </div>
        <div className="ml-4 flex-shrink-0">
          {/* Still keep the button for visual indication but the whole card is now clickable */}
          {getActionButton()}
        </div>
      </div>
    </Card>
  );
};

export default AgentCard;