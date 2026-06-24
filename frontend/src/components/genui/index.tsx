import type { GenUIBlock } from "./types";
import { ActionAlert } from "./ActionAlert";
import { FinancialYieldChart } from "./FinancialYieldChart";
import { WeatherCard } from "./WeatherCard";
import { AIPipeline } from "./AIPipeline";
import { USSDSimulator } from "./USSDSimulator";
import { AIChatInterface } from "./AIChatInterface";
import { HallucinationGuardrail } from "./HallucinationGuardrail";
import { MultilingualSupport } from "./MultilingualSupport";

/**
 * Renders a single AI block by dispatching on its discriminator. New block
 * types are added here alongside their component.
 */
export function GenUIRenderer({ block }: { block: GenUIBlock }) {
  switch (block.type) {
    case "weather":
      return <WeatherCard block={block} />;
    case "financial_yield":
      return <FinancialYieldChart block={block} />;
    case "action_alert":
      return <ActionAlert block={block} />;
    case "ai_pipeline":
      return <AIPipeline block={block} />;
    case "ussd_simulator":
      return <USSDSimulator block={block} />;
    case "ai_chat":
      return <AIChatInterface block={block} />;
    case "guardrail":
      return <HallucinationGuardrail block={block} />;
    case "multilingual":
      return <MultilingualSupport block={block} />;
    default: {
      // Exhaustiveness check: a new block type without a case is a compile error.
      const _never: never = block;
      return _never;
    }
  }
}