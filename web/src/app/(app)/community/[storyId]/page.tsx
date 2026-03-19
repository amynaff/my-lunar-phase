"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  lifeStage: string;
  hearts: number;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  hearts: number;
  createdAt: string;
}

export default function StoryDetailPage() {
  const { storyId } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [storiesRes, commentsRes] = await Promise.all([
        fetch(`/api/community/stories?limit=100`),
        fetch(`/api/community/stories/${storyId}/comments`),
      ]);
      const storiesData = await storiesRes.json();
      const commentsData = await commentsRes.json();
      const found = storiesData.stories?.find((s: Story) => s.id === storyId);
      setStory(found || null);
      setComments(commentsData.comments || []);
      setLoading(false);
    }
    load();
  }, [storyId]);

  async function submitComment() {
    if (!newComment.trim()) return;
    const res = await fetch(`/api/community/stories/${storyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    const data = await res.json();
    if (data.comment) {
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-secondary rounded w-3/4" />
          <div className="h-32 bg-bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-text-muted font-quicksand">Story not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/community" className="flex items-center gap-2 text-text-secondary font-quicksand text-sm mb-6 hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Community
      </Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] border border-border-light bg-bg-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 text-[10px] rounded-lg bg-accent-purple/15 text-accent-purple font-quicksand font-semibold">{story.category}</span>
          <span className="px-2 py-0.5 text-[10px] rounded-lg bg-accent-rose/15 text-accent-pink font-quicksand font-semibold">{story.lifeStage}</span>
        </div>
        <h1 className="font-cormorant text-2xl font-semibold text-text-primary mb-4">{story.title}</h1>
        <p className="text-text-secondary font-quicksand leading-relaxed whitespace-pre-line">{story.content}</p>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-light">
          <Heart className="h-4 w-4 text-accent-pink" />
          <span className="text-sm text-text-muted font-quicksand">{story.hearts}</span>
          <span className="ml-auto text-xs text-text-muted font-quicksand">{new Date(story.createdAt).toLocaleDateString()}</span>
        </div>
      </motion.article>

      {/* Comment form */}
      <div className="flex items-center gap-3 mb-6">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your support..."
          className="flex-1 px-4 py-3 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-purple"
        />
        <button onClick={submitComment} disabled={!newComment.trim()} className="p-3 rounded-full bg-gradient-to-r from-accent-rose to-accent-purple text-white disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 rounded-xl border border-border-light bg-bg-card">
            <p className="text-sm text-text-secondary font-quicksand">{comment.content}</p>
            <div className="flex items-center gap-2 mt-2">
              <Heart className="h-3 w-3 text-text-muted" />
              <span className="text-xs text-text-muted font-quicksand">{comment.hearts}</span>
              <span className="ml-auto text-[10px] text-text-muted font-quicksand">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-text-muted font-quicksand text-sm py-8">No comments yet. Be the first to share your support.</p>
        )}
      </div>
    </div>
  );
}
