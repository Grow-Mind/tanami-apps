"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input } as const;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CHAT_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, terjadi kesalahan." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full p-6 shadow-lg"
          size="icon"
        >
          <Bot className="w-8 h-8" />
        </Button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-96 z-50 shadow-xl rounded-xl flex flex-col dark:bg-zinc-900">
          <CardHeader className="p-3 border-b flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              NamiBot - Tanami
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs"
            >
              ✕
            </Button>
          </CardHeader>

          <div
            ref={scrollRef}
            className="flex-1 p-3 space-y-2 overflow-y-auto text-sm"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[85%] ${
                  m.role === "user"
                    ? "ml-auto bg-green-100 dark:bg-green-800 text-black dark:text-white"
                    : "mr-auto bg-gray-100 dark:bg-zinc-700 text-black dark:text-white"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Mengetik...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2 p-2 border-t"
          >
            <Textarea
              rows={1}
              placeholder="Tanyakan tentang tanaman..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="resize-none"
            />
            <Button type="submit" size="icon" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
