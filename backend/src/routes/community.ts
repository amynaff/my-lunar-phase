import { Hono } from 'hono';
import { prisma } from '../prisma';

const communityRouter = new Hono();

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
        // Note: No userId field exists - completely anonymous
      },
    });

    const total = await prisma.communityStory.count({ where });

    return c.json({ stories, total, hasMore: offset + stories.length < total });
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
    const validLifeStages = ['regular', 'perimenopause', 'menopause'];
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
        // isApproved defaults to true
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

    return c.json({ story });
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

export { communityRouter };
