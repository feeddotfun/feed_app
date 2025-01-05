export interface DashboardMemeData {
  id: string;
  name: string;
  image: string;
  ticker: string;
  votes: number;
  marketCap?: number;
  date?: string;
  mintAddress?: string;
}

export interface TrendingMemes {
  winners: DashboardMemeData[];
  topVoted: DashboardMemeData[];
}

export interface DashboardStats {
  id: string;
  totalMemes: number;
  totalVotes: number;
  totalWinners: number;
  activeSessions: number;
  activity: Array<{
    time: string;
    activity: number;
    baseline: number;
  }>;
  trendingMeme: DashboardMemeData | null;
  trendingMemes: TrendingMemes;
  lastUpdated: string;
  createdAt: string;
}