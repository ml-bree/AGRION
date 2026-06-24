import type { GenUIBlock } from "./types";
import { ActionAlert } from "./ActionAlert";
import { FinancialYieldChart } from "./FinancialYieldChart";
import { WeatherCard } from "./WeatherCard";

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
    default: {
      // Exhaustiveness check: a new block type without a case is a compile error.
      const _never: never = block;
      return _never;
    }
  }
}
