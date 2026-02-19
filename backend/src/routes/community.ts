import { Hono } from 'hono';
import { prisma } from '../prisma';

const communityRouter = new Hono();

// ==================== STORIES ====================

// Get all approved stories (with optional filters)
communityRouter.get('/stories', async (c) => {
  try {
    const category = c.req.query('category');
    const lifeStage = c.req.query('lifeStage');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const where: any = {
      isApproved: true,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (lifeStage && lifeStage !== 'all') {
      where.lifeStage = lifeStage;
    }

    const stories = await prisma.communityStory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        category: true,
        lifeStage: true,
        title: true,
        content: true,
        hearts: true,
        createdAt: true,
        _count: {
          select: { comments: true }
        }
      },
    });

    const total = await prisma.communityStory.count({ where });

    return c.json({
      stories: stories.map(s => ({
        ...s,
        commentCount: s._count.comments,
        _count: undefined
      })),
      total,
      hasMore: offset + stories.length < total
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return c.json({ error: 'Failed to fetch stories' }, 500);
  }
});

// Create a new anonymous story
communityRouter.post('/stories', async (c) => {
  try {
    const body = await c.req.json();
    const { category, lifeStage, title, content } = body;

    // Validate required fields
    if (!category || !lifeStage || !title || !content) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate category
    const validCategories = ['symptoms', 'nutrition', 'movement', 'lifestyle', 'success'];
    if (!validCategories.includes(category)) {
      return c.json({ error: 'Invalid category' }, 400);
    }

    // Validate life stage
    const validLifeStages = ['regular', 'perimenopause', 'menopause', 'postmenopause'];
    if (!validLifeStages.includes(lifeStage)) {
      return c.json({ error: 'Invalid life stage' }, 400);
    }

    // Validate content length
    if (title.length > 100) {
      return c.json({ error: 'Title too long (max 100 characters)' }, 400);
    }

    if (content.length > 2000) {
      return c.json({ error: 'Content too long (max 2000 characters)' }, 400);
    }

    // Create the story - NO user association, completely anonymous
    const story = await prisma.communityStory.create({
      data: {
        category,
        lifeStage,
        title: title.trim(),
        content: content.trim(),
      },
      select: {
        id: true,
        category: true,
        lifeStage: true,
        title: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    return c.json({ story: { ...story, commentCount: 0 } });
  } catch (error) {
    console.error('Error creating story:', error);
    return c.json({ error: 'Failed to create story' }, 500);
  }
});

// Add a heart to a story (anonymous, no tracking)
communityRouter.post('/stories/:id/heart', async (c) => {
  try {
    const { id } = c.req.param();

    const story = await prisma.communityStory.update({
      where: { id },
      data: {
        hearts: { increment: 1 },
      },
      select: {
        id: true,
        hearts: true,
      },
    });

    return c.json({ story });
  } catch (error) {
    console.error('Error adding heart:', error);
    return c.json({ error: 'Failed to add heart' }, 500);
  }
});

// ==================== COMMENTS ====================

// Get comments for a story
communityRouter.get('/stories/:id/comments', async (c) => {
  try {
    const { id } = c.req.param();
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const comments = await prisma.storyComment.findMany({
      where: { storyId: id },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    const total = await prisma.storyComment.count({ where: { storyId: id } });

    return c.json({ comments, total, hasMore: offset + comments.length < total });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// Add a comment to a story
communityRouter.post('/stories/:id/comments', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Comment content is required' }, 400);
    }

    if (content.length > 1000) {
      return c.json({ error: 'Comment too long (max 1000 characters)' }, 400);
    }

    // Verify story exists
    const story = await prisma.communityStory.findUnique({ where: { id } });
    if (!story) {
      return c.json({ error: 'Story not found' }, 404);
    }

    const comment = await prisma.storyComment.create({
      data: {
        storyId: id,
        content: content.trim(),
      },
      select: {
        id: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    return c.json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// Heart a comment
communityRouter.post('/comments/:id/heart', async (c) => {
  try {
    const { id } = c.req.param();

    const comment = await prisma.storyComment.update({
      where: { id },
      data: {
        hearts: { increment: 1 },
      },
      select: {
        id: true,
        hearts: true,
      },
    });

    return c.json({ comment });
  } catch (error) {
    console.error('Error adding heart to comment:', error);
    return c.json({ error: 'Failed to add heart' }, 500);
  }
});

// ==================== CHAT CHANNELS ====================

// Get all chat channels
communityRouter.get('/channels', async (c) => {
  try {
    const channels = await prisma.chatChannel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        emoji: true,
        color: true,
        _count: {
          select: { messages: true }
        }
      },
    });

    return c.json({
      channels: channels.map(ch => ({
        ...ch,
        messageCount: ch._count.messages,
        _count: undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return c.json({ error: 'Failed to fetch channels' }, 500);
  }
});

// Get messages for a channel
communityRouter.get('/channels/:id/messages', async (c) => {
  try {
    const { id } = c.req.param();
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const messages = await prisma.chatMessage.findMany({
      where: { channelId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        lifeStage: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    const total = await prisma.chatMessage.count({ where: { channelId: id } });

    return c.json({
      messages: messages.reverse(), // Return oldest first for chat display
      total,
      hasMore: offset + messages.length < total
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Send a message to a channel
communityRouter.post('/channels/:id/messages', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { content, lifeStage } = body;

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Message content is required' }, 400);
    }

    if (content.length > 1000) {
      return c.json({ error: 'Message too long (max 1000 characters)' }, 400);
    }

    // Validate life stage if provided
    if (lifeStage) {
      const validLifeStages = ['regular', 'perimenopause', 'menopause', 'postmenopause'];
      if (!validLifeStages.includes(lifeStage)) {
        return c.json({ error: 'Invalid life stage' }, 400);
      }
    }

    // Verify channel exists
    const channel = await prisma.chatChannel.findUnique({ where: { id } });
    if (!channel || !channel.isActive) {
      return c.json({ error: 'Channel not found' }, 404);
    }

    const message = await prisma.chatMessage.create({
      data: {
        channelId: id,
        content: content.trim(),
        lifeStage: lifeStage || null,
      },
      select: {
        id: true,
        lifeStage: true,
        content: true,
        hearts: true,
        createdAt: true,
      },
    });

    return c.json({ message });
  } catch (error) {
    console.error('Error creating message:', error);
    return c.json({ error: 'Failed to create message' }, 500);
  }
});

// Heart a message
communityRouter.post('/messages/:id/heart', async (c) => {
  try {
    const { id } = c.req.param();

    const message = await prisma.chatMessage.update({
      where: { id },
      data: {
        hearts: { increment: 1 },
      },
      select: {
        id: true,
        hearts: true,
      },
    });

    return c.json({ message });
  } catch (error) {
    console.error('Error adding heart to message:', error);
    return c.json({ error: 'Failed to add heart' }, 500);
  }
});

// Get story categories with counts
communityRouter.get('/categories', async (c) => {
  try {
    const lifeStage = c.req.query('lifeStage');

    const where: any = { isApproved: true };
    if (lifeStage && lifeStage !== 'all') {
      where.lifeStage = lifeStage;
    }

    const categories = await prisma.communityStory.groupBy({
      by: ['category'],
      where,
      _count: { category: true },
    });

    const total = await prisma.communityStory.count({ where });

    return c.json({
      categories: categories.map((cat: { category: string; _count: { category: number } }) => ({
        category: cat.category,
        count: cat._count.category,
      })),
      total,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Seed default chat channels (call once to initialize)
communityRouter.post('/channels/seed', async (c) => {
  try {
    const defaultChannels = [
      { name: 'Symptoms & Support', description: 'Share experiences and get support for symptoms', emoji: '💜', color: '#8b5cf6', sortOrder: 1 },
      { name: 'Fertility & TTC', description: 'Trying to conceive? Connect with others on the same journey', emoji: '🌸', color: '#ec4899', sortOrder: 2 },
      { name: 'Relationships', description: 'Talk about relationships, intimacy, and communication', emoji: '💕', color: '#f43f5e', sortOrder: 3 },
      { name: 'Wellness & Self-Care', description: 'Share self-care tips and wellness routines', emoji: '🧘', color: '#22c55e', sortOrder: 4 },
      { name: 'Perimenopause Journey', description: 'Navigate perimenopause together', emoji: '🌗', color: '#f59e0b', sortOrder: 5 },
      { name: 'Menopause & Beyond', description: 'Embrace this powerful chapter of life', emoji: '✨', color: '#a855f7', sortOrder: 6 },
    ];

    for (const channel of defaultChannels) {
      await prisma.chatChannel.upsert({
        where: { id: channel.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
        update: channel,
        create: {
          id: channel.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          ...channel,
        },
      });
    }

    return c.json({ success: true, message: 'Channels seeded' });
  } catch (error) {
    console.error('Error seeding channels:', error);
    return c.json({ error: 'Failed to seed channels' }, 500);
  }
});

export { communityRouter };
