import { GenUIRenderer } from "./components/genui";
import { useGenUI } from "./hooks/useGenUI";

export default function App() {
  // Demo session; in a real app this comes from routing or auth.
  const { blocks, loading, error } = useGenUI("demo");

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-bold text-harvest">AgriConnect Nigeria</h1>
        <p className="text-sm text-gray-500">
          Advisory dashboard — generative UI from the farming knowledge graph.
        </p>
      </header>

      {loading && <p className="text-gray-500">Loading advisory…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      <div className="space-y-4">
        {blocks.map((block, i) => (
          <GenUIRenderer key={i} block={block} />
        ))}
      </div>
    </main>
  );
}
