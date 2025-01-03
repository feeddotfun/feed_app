import { Client } from '@upstash/qstash';
import MemeNews from '../database/models/meme-news.model';
import { connectToDatabase } from '../database/mongoose';

interface NewsItem {
  title: string;
  source: string;
}

interface MemeResponse {
  news: string;
  meme: string;
  ticker: string;
  name: string;
  image: string;
  timestamp: string;
}

export class NewsLabService {
  private static instance: NewsLabService;
  private qstash: Client;
  private readonly API_BASE_URL: string;
  
  private constructor() {
    this.qstash = new Client({
      token: process.env.QSTASH_TOKEN!
    });
    this.API_BASE_URL = process.env.NEWS_LAB_API_URL!;
  }

  static getInstance(): NewsLabService {
    if (!NewsLabService.instance) {
      NewsLabService.instance = new NewsLabService();
    }
    return NewsLabService.instance;
  }

  // Fetch latest news from API
  private async fetchLatestNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/news`);
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      const news: NewsItem[] = await response.json();
      return news;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news from API');
    }
  }

  // Fetch memes for all news items at once
  private async fetchMemesForNews(): Promise<MemeResponse[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v1/memes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }
      const memes: MemeResponse[] = await response.json();
      return memes;
    } catch (error) {
      console.log(error)
      console.error('Error fetching memes:', error);
      throw new Error('Failed to fetch memes from API');
    }
  }

  // Find new content by comparing with database
  private async findNewContent(
    apiMemes: MemeResponse[]
  ): Promise<MemeResponse[]> {
    await connectToDatabase();
    
    // Extract news content from API responses
    const newsContents = apiMemes.map(meme => meme.news);
    
    // Check which news already exist in database
    const existingNews = await MemeNews.find({
      news: { $in: newsContents }
    }).select('news');
    
    const existingNewsSet = new Set(existingNews.map(n => n.news));
    
    // Filter out memes whose news already exist in database
    return apiMemes.filter(meme => !existingNewsSet.has(meme.news));
  }

  // Process and save new memes to database
  private async processNewContent(newMemes: MemeResponse[]) {
    if (newMemes.length === 0) {
      console.log('No new content to process');
      return 0;
    }

    await connectToDatabase();
    
    const savedMemes = await Promise.allSettled(
      newMemes.map(async (meme) => {
        try {
          await MemeNews.create({
            news: meme.news,
            meme: meme.meme,
            name: meme.name,
            ticker: meme.ticker,
            image: meme.image
          });
          return true;
        } catch (error) {
          console.error(`Error saving meme for news: ${meme.news}`, error);
          return false;
        }
      })
    );

    // Count successfully saved memes
    return savedMemes.filter(
      result => result.status === 'fulfilled' && result.value
    ).length;
  }

  async checkAndProcessNewContent() {
    try {
      // 1. Fetch all memes (which includes news content)
      const apiMemes = await this.fetchMemesForNews();
      
      // 2. Find which memes are new
      const newMemes = await this.findNewContent(apiMemes);
      
      // 3. Process and save new memes
      const processedCount = await this.processNewContent(newMemes);
      
      return {
        success: true,
        processedCount,
        totalFetched: apiMemes.length,
        newContent: newMemes.length
      };
    } catch (error) {
      console.error('Error in checkAndProcessNewContent:', error);
      throw error;
    }
  }

  async schedulePeriodicCheck(intervalMinutes: number = 30) {
    try {
      // Validate interval
      if (intervalMinutes < 1 || intervalMinutes > 60) {
        throw new Error('Interval must be between 1 and 60 minutes');
      }

      await this.qstash.publishJSON({
        url: `${process.env.API_URL}/api/timer/check-news`,
        body: { 
          timestamp: Date.now(),
          intervalMinutes 
        },
        cron: `*/${intervalMinutes} * * * *`,
        retries: 3
      });

      return {
        success: true,
        message: `News check scheduled successfully for every ${intervalMinutes} minutes`
      };
    } catch (error) {
      console.error('Failed to schedule news check:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}