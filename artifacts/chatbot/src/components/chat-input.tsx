import React, { useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = React.useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    resize();
  }, [content]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-8 py-4">
      <div className="relative flex items-end w-full border rounded-2xl bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={disabled}
          className="min-h-[56px] max-h-[200px] w-full resize-none border-0 shadow-none focus-visible:ring-0 rounded-2xl py-4 pl-4 pr-14 bg-transparent text-base"
          rows={1}
        />
        <div className="absolute right-2 bottom-2">
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            className="h-10 w-10 rounded-xl"
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-xs text-muted-foreground">
          AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
