import Parser from 'rss-parser';
import { Request, Response } from 'express';
import { cache } from '../middleware/cache';

const parser = new Parser();

// RSS Feeds configuration
const RSS_FEEDS: Record<string, string> = {
  // 科技新闻 (36Kr)
  tech: 'https://36kr.com/feed',
  // 综合新闻 (人民网) - often reliable for domestic news
  general: 'http://www.people.com.cn/rss/politics.xml',
  // 开发者新闻 (V2EX)
  dev: 'https://www.v2ex.com/index.xml',
  // 英文科技 (Hacker News)
  hackernews: 'https://hnrss.org/frontpage'
};

export const getNews = async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || 'tech';
    const feedUrl = RSS_FEEDS[category] || RSS_FEEDS.tech;
    
    // Check cache manually since we might want shorter cache for news than standard middleware
    const cacheKey = `news_${category}`;
    const cachedNews = cache.get(cacheKey);
    if (cachedNews) {
      return res.json(cachedNews);
    }
    
    const feed = await parser.parseURL(feedUrl);
    const newsData = {
      title: feed.title,
      description: feed.description,
      items: feed.items.slice(0, 10).map((item: any) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content,
        creator: item.creator,
        categories: item.categories
      }))
    };
    
    // Cache for 30 minutes
    cache.set(cacheKey, newsData, 1800);
    res.json(newsData);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
