import Parser from 'rss-parser';
import { Request, Response } from 'express';
import { cache } from '../middleware/cache';
import { asyncHandler } from '../middleware/asyncHandler';

const parser = new Parser();

const RSS_FEEDS: Record<string, string> = {
  tech: 'https://36kr.com/feed',
  general: 'http://www.people.com.cn/rss/politics.xml',
  dev: 'https://www.v2ex.com/index.xml',
  hackernews: 'https://hnrss.org/frontpage',
};

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'tech';
  const feedUrl = RSS_FEEDS[category] || RSS_FEEDS.tech;

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
      categories: item.categories,
    })),
  };

  cache.set(cacheKey, newsData, 1800);
  res.json(newsData);
});
