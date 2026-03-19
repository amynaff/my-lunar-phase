"use client";

import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  lifeStage: string;
  hearts: number;
  _count?: { comments: number };
  createdAt: string;
}

export function StoryCard({ story }: { story: Story }) {
  async function handleHeart() {
    await fetch(`/api/community/stories/${story.id}/heart`, { method: "POST" });
  }

  return (
    <Link href={`/community/${story.id}`}>
      <div className="rounded-[20px] border border-border-light bg-bg-card p-5 hover:bg-bg-secondary/50 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 text-[10px] rounded-lg bg-accent-purple/15 text-accent-purple font-quicksand font-semibold">
            {story.category}
          </span>
          <span className="px-2 py-0.5 text-[10px] rounded-lg bg-accent-rose/15 text-accent-pink font-quicksand font-semibold">
            {story.lifeStage}
          </span>
        </div>

        <h3 className="font-cormorant text-lg font-semibold text-text-primary mb-1">
          {story.title}
        </h3>
        <p className="text-sm text-text-secondary font-quicksand line-clamp-2">
          {story.content}
        </p>

        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleHeart();
            }}
            className="flex items-center gap-1.5 text-text-muted hover:text-accent-pink transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs font-quicksand">{story.hearts}</span>
          </button>
          <div className="flex items-center gap-1.5 text-text-muted">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-quicksand">{story._count?.comments || 0}</span>
          </div>
          <span className="ml-auto text-[10px] text-text-muted font-quicksand">
            {new Date(story.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
