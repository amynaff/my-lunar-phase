"use client";

import { motion } from "framer-motion";
import { ChatInterface } from "@/components/ai/chat-interface";

export default function LunaAIPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full"
    >
      <ChatInterface />
    </motion.div>
  );
}
