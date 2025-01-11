import { BaseEntity } from "./base.types";

export interface AirdropActivities {
  votes: {
    count: number;
    points: number;
  };
  communityVotes: {
    count: number;
    points: number;
  };
  contributions: {
    count: number;
    totalSol: number;
    points: number;
  };
  claims: {
    count: number;
    points: number;
  };
}

export interface AirdropStats extends BaseEntity {
  activities: AirdropActivities;
  totalPoints: number;
  maxPoints: number;
  progress: number;
}