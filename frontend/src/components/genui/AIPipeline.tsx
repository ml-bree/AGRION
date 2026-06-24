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
      case "idle": return "text-gray-400";
      case "processing": return "text-harvest animate-pulse";
      case "complete": return "text-green-600";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "idle": return <Clock className="w-4 h-4 text-gray-400" />;
      case "processing": return <Loader2 className="w-4 h-4 text-harvest animate-spin" />;
      case "complete": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-soil flex items-center gap-2">
          <Cpu className="w-5 h-5 text-harvest" />
          AI Pipeline
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {completedSteps}/5 steps complete
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
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
                step.status === "processing" ? "bg-harvest/5 border border-harvest/20" : 
                step.status === "complete" ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <span className="text-gray-500">{stepIcons[key]}</span>
              <span className="text-sm font-medium text-gray-700 flex-1">{stepLabels[key]}</span>
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
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800">Advisory generated successfully — delivered via voice + SMS</p>
        </div>
      )}
    </div>
  );
}