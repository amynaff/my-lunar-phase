"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChatInterface, type ChatInterfaceHandle } from "@/components/ai/chat-interface";
import { SymptomChecker } from "@/components/ai/symptom-checker";

export default function LunaAIPage() {
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const chatRef = useRef<ChatInterfaceHandle>(null);

  function handleSymptomAnalyze(summary: string) {
    chatRef.current?.sendMessage(summary);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <ChatInterface
        ref={chatRef}
        onSymptomCheckerOpen={() => setShowSymptomChecker(true)}
      />
      <SymptomChecker
        open={showSymptomChecker}
        onClose={() => setShowSymptomChecker(false)}
        onAnalyze={handleSymptomAnalyze}
      />
    </motion.div>
  );
}
