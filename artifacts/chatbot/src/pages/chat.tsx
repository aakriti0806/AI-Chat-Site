import { useState, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ChatSidebar } from "@/components/sidebar";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { useTheme } from "@/components/theme-provider";
import { UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  useGetOpenaiConversation, 
  useCreateOpenaiConversation, 
  useRenameOpenaiConversation,
  getGetOpenaiConversationQueryKey,
  getListOpenaiConversationsQueryKey
} from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useQueryClient } from "@tanstack/react-query";

interface Message {
  role: string;
  content: string;
  id?: number;
}

export function ChatLayout() {
  const [, params] = useRoute("/chat/:id");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  
  const conversationId = params?.id ? parseInt(params.id) : undefined;
  
  const { data: conversation, isLoading } = useGetOpenaiConversation(
    conversationId as number,
    { query: { enabled: !!conversationId, queryKey: getGetOpenaiConversationQueryKey(conversationId as number) } }
  );

  const createMutation = useCreateOpenaiConversation();
  const renameMutation = useRenameOpenaiConversation();
  const { streamMessage, isStreaming } = useChatStream();
  
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (conversation) {
      setLocalMessages(conversation.messages);
    } else if (!conversationId) {
      setLocalMessages([]);
    }
  }, [conversation, conversationId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, isStreaming]);

  const handleSend = async (content: string) => {
    let targetConvId = conversationId;
    
    // Add user message to UI immediately
    setLocalMessages(prev => [...prev, { role: "user", content }]);
    
    // Create new conversation if needed
    if (!targetConvId) {
      const conv = await createMutation.mutateAsync({ data: { title: "New Chat" } });
      targetConvId = conv.id;
      
      // Auto-rename based on first message
      const title = content.split(" ").slice(0, 6).join(" ");
      renameMutation.mutate({ id: conv.id, data: { title } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() })
      });
      
      setLocation(`/chat/${conv.id}`);
    }

    // Add empty assistant message for streaming
    setLocalMessages(prev => [...prev, { role: "assistant", content: "" }]);

    await streamMessage(
      targetConvId,
      content,
      (chunk) => {
        setLocalMessages(prev => {
          const newMessages = [...prev];
          const last = newMessages[newMessages.length - 1];
          if (last.role === "assistant") {
            last.content += chunk;
          }
          return newMessages;
        });
      },
      () => {
        queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(targetConvId!) });
      }
    );
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ChatSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <ChatSidebar />
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-lg tracking-tight hidden sm:block">
              {conversation?.title || "New Chat"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </div>
        </header>

        <ScrollArea className="flex-1 relative" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="animate-pulse text-muted-foreground">Loading...</span>
            </div>
          ) : localMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground text-sm">
                Ask a question, request code generation, or just have a chat. I'm here to assist.
              </p>
            </div>
          ) : (
            <div className="pb-4">
              {localMessages.map((msg, i) => (
                <ChatMessage 
                  key={msg.id || i} 
                  role={msg.role} 
                  content={msg.content}
                  isStreaming={isStreaming && i === localMessages.length - 1 && msg.role === "assistant" && !msg.content}
                  showRegenerate={i === localMessages.length - 1 && msg.role === "assistant"}
                  // onRegenerate={() => {}} // Could be wired up
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
