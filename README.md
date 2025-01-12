# <div align="center"><img src="public/logo.svg" width="200" height="200" alt="feed.fun"></div>

# Feed.fun App

Feed.fun is a Next.js application that provides a dynamic interface for meme creation, voting, and investment on Solana blockchain.

## Features
- Real-time meme submission and voting
- Solana wallet integration
- Community contribution system
- Dynamic session management
- Automated news-to-meme conversion
- Community governance system

## 📋 Overview
This Next.js application handles the user interface and interaction layer of Feed.fun, including:

- Meme creation and submission
- Real-time voting mechanics
- Investment management
- Community settings governance
- News integration system

## 🏗 Architecture

### Core Components

#### Meme Arena Session
```typescript
interface IMemeArenaSession {
    startTime: Date;
    endTime?: Date;
    status: 'Voting' | 'LastVoting' | 'Contributing' | 'Completed';
    maxMemes: number;
    votingThreshold: number;
    votingTimeLimit: number;
    votingEndTime?: Date;
    winnerMeme?: string;
    nextSessionDelay: number;
    nextSessionStartTime?: Date;
    contributeEndTime?: Date;
    claimAvailableTime?: number;
    totalContributions: number;
    contributorCount: number;
    tokenMintAddress?: string;
    tx?: string;
}
```
## System Configuration
```bash
interface ISystemConfig {
    maxMemesPerSession: number;
    votingThreshold: number;
    votingTimeLimit: number;
    nextSessionDelay: number;
    contributeFundingLimit: number;
    minContributionSol: number;
    maxContributionSol: number;
    tokenClaimDelay: number;
}
```

## Key Components

## 1. Meme Management
   * Meme submission interface
   * Image upload and processing
   * Voting system
   * Real-time updates
## 2. Investment System
   * Wallet connection
   * Contribution management
   * Token claim interface
   * Transaction tracking
## 3. Community Governance
   * System parameter voting
   * Real-time parameter updates
   * Community feedback system


## 🛠 Development Setup
Prerequisites

- Node.js >= 18
- pnpm

## 🛠 Development Setup
Prerequisites

- Node.js >= 18
- pnpm

## Environment Variables
```bash
NEXT_PUBLIC_UPLOAD_API_URL=
NEXT_PUBLIC_UPLOAD_API_KEY=
NEXT_PUBLIC_RPC_URL=
MONGODB_URI=
```

## Installation
Prerequisites

* pnpm i
* pnpm dev

### Project Structure
```bash
├── app/
│   ├── (dashboard)/                
│   │   ├── ai-news-lab/
│   │   ├── airdrop-stats/
│   │   ├── community-setting/
│   │   ├── meme-arena/
│   │   ├── my-investments/
│   │   ├── winning-memes/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── api/                      
│   │   ├── ai-news-lab/
│   │   ├── airdrop-stats/
│   │   ├── community-setting/
│   │   ├── dashboard/
│   │   ├── investments/
│   │   ├── meme-arena/
│   │   ├── sse/
│   │   ├── timer/
│   │   └── winning-memes/
│   │
│   └── favicon.ico
│
├── components/                    
│   ├── ai-news-lab/
│   ├── airdrop-stats/
│   ├── community-setting/
│   ├── dashboard/
│   ├── layout/
│   ├── meme-arena/
│   ├── my-investments/
│   ├── providers/
│   ├── ui/   
│   └── winning-memes/
│
├── lib/    
├── public/  
└── types/                       
```
## Real-time Updates
```bash
// SSE Connection
const eventsource = new EventSource('/api/sse');
eventsource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle updates
};
```

## 📚 Key Libraries
- Next.js 15
- @solana/web3.js
- @solana/wallet-adapter-react
- Framer Motion
- TailwindCSS
- Shadcn/ui

## 🔐 Security
- Rate limiting implementation
- Wallet signature verification
- Input validation and sanitization
- CORS configuration
- TailwindCSS
- API route protection

## 📦 Deployment
The application is deployed on Vercel with the following configuration:
```bash
# Vercel configuration
vercel.json
{
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ]
}
```
## 🤝 Contributing
   * Fork the repository
   * Create your feature branch
   * Commit your changes
   * Push to the branch
   * Real-time updates
   * Create a Pull Request

## 📄 License
This project is licensed under the MIT License.