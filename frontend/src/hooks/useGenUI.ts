import { useEffect, useState } from "react";
import type { GenUIBlock } from "../components/genui/types";

interface GenUIState {
  blocks: GenUIBlock[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches and streams generative-UI state from the backend.
 *
 * The backend emits newline-delimited JSON blocks (NDJSON); each line is one
 * `GenUIBlock` that maps to a component under `components/genui/`. Blocks are
 * appended as they arrive so the UI renders progressively.
 */
export function useGenUI(sessionId: string): GenUIState {
  const [blocks, setBlocks] = useState<GenUIBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function stream() {
      setLoading(true);
      setError(null);
      setBlocks([]);

      try {
        const res = await fetch(`/api/v1/genui/${sessionId}`, {
          signal: controller.signal,
          headers: { Accept: "application/x-ndjson" },
        });
        if (!res.ok || !res.body) {
          throw new Error(`Stream failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep the trailing partial line

          for (const line of lines) {
            if (!line.trim()) continue;
            const block = JSON.parse(line) as GenUIBlock;
            setBlocks((prev) => [...prev, block]);
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }

    stream();
    return () => controller.abort();
  }, [sessionId]);

  return { blocks, loading, error };
}
