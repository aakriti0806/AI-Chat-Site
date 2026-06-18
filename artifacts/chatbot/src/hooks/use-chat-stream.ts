import { useState, useCallback } from "react";
import { getSendOpenaiMessageUrl } from "@workspace/api-client-react";

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamMessage = useCallback(async (
    conversationId: number, 
    content: string, 
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (err: Error) => void
  ) => {
    setIsStreaming(true);
    
    try {
      const url = getSendOpenaiMessageUrl(conversationId);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // SSE format: data: {...}\n\n
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  onChunk(data.content);
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }

      onComplete?.();
    } catch (err) {
      if (err instanceof Error) {
        onError?.(err);
      } else {
        onError?.(new Error("Unknown error"));
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamMessage, isStreaming };
}
