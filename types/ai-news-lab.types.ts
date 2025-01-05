import { BaseEntity } from "./base.types";

export interface AINewsLabItem extends BaseEntity {
    id: string;
    news: string;
    meme: string;
    ticker: string;
    name: string;
    image: string;
    timestamp: string;
}
export interface CreateMemeFromNewsParams {
    newsId: string;
}
  
export interface NewsLabData {
    items: AINewsLabItem[];
    lastUpdate: string;
    nextUpdate: string;
}
