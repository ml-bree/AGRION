import type { AIPipelineBlock } from "./types";
import { 
  Cpu, 
  Database, 
  Shield, 
  Brain, 
  MessageSquare,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";

interface Props {
  block: AIPipelineBlock;
}

export function AIPipeline({ block }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle": return "text-copper dark:text-dark-text3";
      case "processing": return "text-marigold dark:text-dark-accent animate-pulse";
      case "complete": return "text-marigold dark:text-dark-accent";
      default: return "text-copper dark:text-dark-text3";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "idle": return <Clock className="w-4 h-4 text-copper dark:text-dark-text3" />;
      case "processing": return <Loader2 className="w-4 h-4 text-marigold dark:text-dark-accent animate-spin" />;
      case "complete": return <CheckCircle className="w-4 h-4 text-marigold dark:text-dark-accent" />;
      default: return <Clock className="w-4 h-4 text-copper dark:text-dark-text3" />;
    }
  };

  const stepKeys = ["intent", "neo4j", "grounding", "featherless", "advisory"] as const;
  const stepLabels = {
    intent: "Intent Extraction",
    neo4j: "Neo4j Query",
    grounding: "Grounding Check",
    featherless: "Featherless AI (Llama 3.1 8B)",
    advisory: "Advisory Generation"
  };
  
  const stepIcons = {
    intent: <Brain className="w-4 h-4" />,
    neo4j: <Database className="w-4 h-4" />,
    grounding: <Shield className="w-4 h-4" />,
    featherless: <Cpu className="w-4 h-4" />,
    advisory: <MessageSquare className="w-4 h-4" />
  };

  const completedSteps = Object.values(block.steps).filter(s => s.status === "complete").length;

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Cpu className="w-5 h-5 text-marigold dark:text-dark-accent" />
          AI Pipeline
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-dallas dark:text-dark-text2">
            {completedSteps}/5 steps complete
          </span>
          <span className="text-xs text-dallas dark:text-dark-text2 bg-cream dark:bg-dark-bg2 px-2 py-1 rounded">
            {block.latency}ms
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {stepKeys.map((key) => {
          const step = block.steps[key];
          return (
            <div 
              key={key} 
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                step.status === "processing" ? "bg-marigold/5 dark:bg-dark-accent/5 border border-marigold/20 dark:border-dark-accent/20" : 
                step.status === "complete" ? "bg-marigold/10 dark:bg-dark-accent/10" : "bg-cream dark:bg-dark-bg2"
              }`}
            >
              <span className="text-dallas dark:text-dark-text2">{stepIcons[key]}</span>
              <span className="text-sm font-medium text-thunder dark:text-dark-text flex-1">{stepLabels[key]}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${getStatusColor(step.status)}`}>
                  {step.status === "idle" && "Waiting"}
                  {step.status === "processing" && "Processing..."}
                  {step.status === "complete" && step.value}
                </span>
                {getStatusIcon(step.status)}
              </div>
            </div>
          );
        })}
      </div>

      {block.status === "complete" && (
        <div className="mt-4 p-3 bg-marigold/10 dark:bg-dark-accent/10 border border-marigold/30 dark:border-dark-accent/30 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-marigold dark:text-dark-accent" />
          <p className="text-sm text-thunder dark:text-dark-text">Advisory generated successfully — delivered via voice + SMS</p>
        </div>
      )}
    </div>
  );
}