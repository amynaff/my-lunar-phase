"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { useCycleData } from "@/hooks/use-cycle-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lifeStage, currentPhase, currentMoonPhase } = useCycleData();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    "What should I eat today?",
    "Best exercise for my phase?",
    "How can I support my hormones?",
    "Self-care ideas for today",
  ];

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          lifeStage,
          currentPhase,
          moonPhase: currentMoonPhase,
        }),
      });

      const data = await response.json();
      const assistantContent =
        data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-6 text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-purple/15">
              <Sparkles className="h-8 w-8 text-accent-purple" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-text-primary">
                Luna AI
              </h2>
              <p className="text-sm text-text-secondary font-quicksand mt-1">
                Your personal wellness companion
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-4 py-2 text-sm rounded-xl border border-border-light bg-bg-card text-text-secondary font-quicksand hover:bg-bg-secondary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-3 w-fit rounded-2xl bg-bg-card border border-border-light"
          >
            <Loader2 className="h-4 w-4 text-accent-purple animate-spin" />
            <span className="text-sm text-text-muted font-quicksand">Luna is thinking...</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border-light px-4 py-3 bg-bg-card-solid">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Luna anything..."
            className="flex-1 px-4 py-3 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-accent-rose to-accent-purple text-white disabled:opacity-50 transition-opacity"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
