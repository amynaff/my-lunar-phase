"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, Loader2, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StoryCard } from "@/components/community/story-card";
import { ChannelList } from "@/components/community/channel-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  _count?: { messages: number };
}

const categories = ["All", "Journey", "Tips", "Question", "Celebration", "Support"];
const lifeStages = ["All", "Regular Cycles", "Perimenopause", "Menopause", "Post Menopause"];

export default function CommunityPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLifeStage, setSelectedLifeStage] = useState("All");
  const [showNewStory, setShowNewStory] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Journey");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedLifeStage !== "All") params.set("lifeStage", selectedLifeStage);

      const res = await fetch(`/api/community/stories?${params}`);
      const data = await res.json();
      setStories(data.stories || []);
    } catch {
      // Silently handle fetch errors
    }
  }, [selectedCategory, selectedLifeStage]);

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/community/channels");
      const data = await res.json();
      setChannels(data.channels || []);
    } catch {
      // Silently handle fetch errors
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await Promise.all([fetchStories(), fetchChannels()]);
      setIsLoading(false);
    }
    loadData();
  }, [fetchStories, fetchChannels]);

  async function handleSubmitStory(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });

      if (res.ok) {
        setShowNewStory(false);
        setNewTitle("");
        setNewContent("");
        setNewCategory("Journey");
        await fetchStories();
      }
    } catch {
      // Silently handle submit errors
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
            <Users className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Community
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Share, connect, and support each other
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewStory(true)} size="sm">
          <Plus className="h-4 w-4" />
          New Story
        </Button>
      </motion.div>

      <Tabs defaultValue="stories">
        <TabsList>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="stories">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mb-6"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted font-quicksand">Category:</span>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-quicksand font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-accent-purple/15 text-accent-purple"
                        : "bg-bg-secondary text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted font-quicksand">Life Stage:</span>
              <div className="flex gap-1.5 flex-wrap">
                {lifeStages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setSelectedLifeStage(stage)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-quicksand font-medium transition-colors ${
                      selectedLifeStage === stage
                        ? "bg-accent-rose/15 text-accent-pink"
                        : "bg-bg-secondary text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stories List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted font-quicksand">
                No stories yet. Be the first to share!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {stories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <StoryCard story={story} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted font-quicksand">
                No channels available yet.
              </p>
            </div>
          ) : (
            <ChannelList channels={channels} />
          )}
        </TabsContent>
      </Tabs>

      {/* New Story Dialog */}
      <Dialog open={showNewStory} onOpenChange={setShowNewStory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Story</DialogTitle>
            <DialogDescription>
              Your story can inspire and support others on their journey.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitStory} className="space-y-4 mt-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
                Category
              </label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {categories.filter((c) => c !== "All").map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-quicksand font-medium transition-colors ${
                      newCategory === cat
                        ? "bg-accent-purple/15 text-accent-purple"
                        : "bg-bg-secondary text-text-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
                Title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Give your story a title"
                className="mt-2"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
                Your Story
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your experience..."
                rows={5}
                className="w-full mt-2 px-4 py-3 rounded-2xl border border-border-light bg-bg-input text-text-primary font-quicksand text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-purple resize-none"
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share Story"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
