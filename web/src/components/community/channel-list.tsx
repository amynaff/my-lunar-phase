"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  _count?: { messages: number };
}

export function ChannelList({ channels }: { channels: Channel[] }) {
  return (
    <div className="space-y-3">
      {channels.map((channel, index) => (
        <motion.div
          key={channel.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={`/community/channels/${channel.id}`}
            className="flex items-center gap-4 p-4 rounded-[20px] border border-border-light bg-bg-card hover:bg-bg-secondary/50 transition-colors"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full text-2xl"
              style={{ backgroundColor: `${channel.color}20` }}
            >
              {channel.emoji}
            </div>
            <div className="flex-1">
              <h3 className="font-quicksand font-semibold text-text-primary">
                {channel.name}
              </h3>
              <p className="text-xs text-text-muted font-quicksand mt-0.5">
                {channel.description}
              </p>
            </div>
            {channel._count?.messages !== undefined && (
              <span className="text-xs text-text-muted font-quicksand">
                {channel._count.messages} messages
              </span>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
