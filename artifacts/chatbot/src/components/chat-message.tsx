import React, { memo } from "react";
import { Bot, User, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: string;
  content: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

export const ChatMessage = memo(
  ({ role, content, isStreaming, onRegenerate, showRegenerate }: ChatMessageProps) => {
    const [copied, setCopied] = React.useState(false);

    const onCopy = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div
        className={cn(
          "w-full py-6 px-4 md:px-8",
          role === "assistant" ? "bg-muted/30" : ""
        )}
      >
        <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center shrink-0 border",
              role === "assistant"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-foreground"
            )}
          >
            {role === "assistant" ? <Bot size={18} /> : <User size={18} />}
          </div>
          
          <div className="flex-1 space-y-2 overflow-hidden min-w-0">
            <MarkdownRenderer content={content} />
            
            {isStreaming && (
              <div className="flex gap-1 items-center mt-2 h-6">
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" />
              </div>
            )}

            {!isStreaming && role === "assistant" && (
              <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={onCopy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
                {showRegenerate && onRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onRegenerate}
                  >
                    <RotateCcw size={14} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
