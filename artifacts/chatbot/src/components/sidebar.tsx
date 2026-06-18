import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageSquare, Plus, MoreHorizontal, Trash2, Edit2, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListOpenaiConversations, useDeleteOpenaiConversation, useRenameOpenaiConversation, getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function ChatSidebar() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const { data: conversations = [] } = useListOpenaiConversations();
  const deleteMutation = useDeleteOpenaiConversation();
  const renameMutation = useRenameOpenaiConversation();

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation("/chat");
      }
    });
  };

  const startEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = (id: number) => {
    if (editTitle.trim()) {
      renameMutation.mutate({ id, data: { title: editTitle.trim() } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          setEditingId(null);
        }
      });
    } else {
      setEditingId(null);
    }
  };

  return (
    <div className="w-64 h-full bg-sidebar flex flex-col border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-4 flex flex-col gap-4">
        <Button 
          className="w-full justify-start gap-2 shadow-sm font-medium"
          onClick={() => setLocation("/chat")}
        >
          <Plus size={18} />
          New Chat
        </Button>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/50" />
          <Input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..." 
            className="pl-9 bg-sidebar-accent/50 border-transparent focus-visible:border-sidebar-ring h-9 text-sm"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-1 pb-4">
          {filteredConversations.map(conv => (
            <div key={conv.id} className="group flex items-center relative rounded-md hover:bg-sidebar-accent/50 transition-colors">
              {editingId === conv.id ? (
                <div className="flex w-full items-center gap-1 p-2">
                  <Input 
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit(conv.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-7 px-2 text-sm bg-background"
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => saveEdit(conv.id)}>
                    <Check size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <>
                  <Link href={`/chat/${conv.id}`} className="flex-1 p-2 flex items-center gap-3 overflow-hidden text-sm">
                    <MessageSquare size={16} className="shrink-0 text-sidebar-foreground/70" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate">{conv.title}</span>
                      <span className="text-[10px] text-sidebar-foreground/50">
                        {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute right-1 bg-sidebar hover:bg-sidebar-accent">
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(conv.id, conv.title)}>
                        <Edit2 size={14} className="mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(conv.id)} className="text-destructive focus:bg-destructive/10">
                        <Trash2 size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
