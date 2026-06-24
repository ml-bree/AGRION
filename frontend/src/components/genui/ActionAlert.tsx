import type { ActionAlertBlock } from "./types";

interface Props {
  block: ActionAlertBlock;
}

const SEVERITY_STYLES: Record<ActionAlertBlock["severity"], string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-red-200 bg-red-50 text-red-800",
};

export function ActionAlert({ block }: Props) {
  return (
    <div className={`rounded-xl border p-4 ${SEVERITY_STYLES[block.severity]}`}>
      <h3 className="font-semibold">{block.title}</h3>
      <p className="mt-1 text-sm">{block.message}</p>
    </div>
  );
}
