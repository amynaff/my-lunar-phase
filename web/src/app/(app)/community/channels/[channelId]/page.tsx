"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Heart } from "lucide-react";
import Link from "next/link";
import { useCycleData } from "@/hooks/use-cycle-data";

interface Message {
  id: string;
  content: string;
  lifeStage?: string;
  hearts: number;
  createdAt: string;
}

export default function ChannelMessagesPage() {
  const { channelId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lifeStage } = useCycleData();

  useEffect(() => {
    fetch(`/api/community/channels/${channelId}/messages?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      });
  }, [channelId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const res = await fetch(`/api/community/channels/${channelId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, lifeStage }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
      setInput("");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      <div className="px-4 py-3 border-b border-border-light">
        <Link href="/community/channels" className="flex items-center gap-2 text-text-secondary font-quicksand text-sm hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Channels
        </Link>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-bg-secondary animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-text-muted font-quicksand text-sm py-12">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl border border-border-light bg-bg-card"
            >
              {msg.lifeStage && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple font-quicksand font-semibold mb-1 inline-block">
                  {msg.lifeStage}
                </span>
              )}
              <p className="text-sm text-text-secondary font-quicksand">{msg.content}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={() => fetch(`/api/community/messages/${msg.id}/heart`, { method: "POST" })}
                  className="flex items-center gap-1 text-text-muted hover:text-accent-pink"
                >
                  <Heart className="h-3 w-3" />
                  <span className="text-[10px] font-quicksand">{msg.hearts}</span>
                </button>
                <span className="ml-auto text-[10px] text-text-muted font-quicksand">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="border-t border-border-light px-4 py-3">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-1 px-4 py-3 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
          />
          <button type="submit" disabled={!input.trim()} className="p-3 rounded-full bg-gradient-to-r from-accent-rose to-accent-purple text-white disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
