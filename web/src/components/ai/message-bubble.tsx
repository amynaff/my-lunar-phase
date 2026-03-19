"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
          isUser ? "bg-accent-pink/15" : "bg-accent-purple/15"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-accent-pink" />
        ) : (
          <Sparkles className="h-4 w-4 text-accent-purple" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-quicksand leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-accent-rose/20 to-accent-purple/20 text-text-primary"
            : "bg-bg-card border border-border-light text-text-secondary"
        }`}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
