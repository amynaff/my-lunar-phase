"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChannelList } from "@/components/community/channel-list";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  _count?: { messages: number };
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community/channels")
      .then((r) => r.json())
      .then((data) => {
        setChannels(data.channels || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/community" className="flex items-center gap-2 text-text-secondary font-quicksand text-sm mb-6 hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Community
      </Link>

      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-cormorant text-3xl font-semibold text-text-primary mb-6">
        Chat Channels
      </motion.h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-[20px] bg-bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <ChannelList channels={channels} />
      )}
    </div>
  );
}
