"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ChatInterface, type ChatInterfaceHandle } from "@/components/ai/chat-interface";
import { SymptomChecker } from "@/components/ai/symptom-checker";

function LunaAIContent() {
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const chatRef = useRef<ChatInterfaceHandle>(null);
  const searchParams = useSearchParams();
  const autoPrompt = searchParams.get("prompt");
  const sentRef = useRef(false);

  useEffect(() => {
    if (autoPrompt && !sentRef.current) {
      sentRef.current = true;
      const timer = setTimeout(() => {
        chatRef.current?.sendMessage(autoPrompt);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrompt]);

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

export default function LunaAIPage() {
  return (
    <Suspense fallback={null}>
      <LunaAIContent />
    </Suspense>
  );
}
