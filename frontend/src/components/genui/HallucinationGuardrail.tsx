import type { GuardrailBlock } from "./types";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Info,
  AlertCircle
} from "lucide-react";

interface Props {
  block: GuardrailBlock;
}

export function HallucinationGuardrail({ block }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-soil flex items-center gap-2">
          <Shield className="w-5 h-5 text-harvest" />
          Hallucination Guardrail
        </h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          QA Gate Active
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* In-Scope Query */}
        <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-800">In-Scope Query</span>
          </div>
          <p className="text-sm text-gray-700 mb-2 font-medium">"{block.inScope.query}"</p>
          <div className="bg-white p-3 rounded border border-green-200 text-sm text-gray-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            → "{block.inScope.response}"
          </div>
        </div>

        {/* Out-of-Scope Query */}
        <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">Out-of-Scope Query</span>
          </div>
          <p className="text-sm text-gray-700 mb-2 font-medium">"{block.outOfScope.query}"</p>
          <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            → "{block.outOfScope.response}"
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <span className="font-medium">Key Feature:</span> If Neo4j returns no matching node, 
          the model says "I don't have that information" rather than improvising — 
          this is our single most important QA gate for responsible AI.
        </p>
      </div>
    </div>
  );
}