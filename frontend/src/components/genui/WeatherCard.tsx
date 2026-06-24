import type { WeatherBlock } from "./types";

interface Props {
  block: WeatherBlock;
}

export function WeatherCard({ block }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-soil">{block.location}</h3>
        <span className="text-2xl font-bold text-harvest">{block.tempC}°C</span>
      </div>
      <p className="mt-1 text-sm text-gray-600">{block.forecast}</p>
      <p className="mt-2 text-sm text-gray-500">
        Rain chance: <span className="font-medium">{block.rainChance}%</span>
      </p>
    </div>
  );
}
