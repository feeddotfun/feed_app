import { MemeArenaData, SessionStatus } from "@/types";

export const sampleMemeArenaData: MemeArenaData = {
  session: {
    id: "123",
    startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "Voting" as SessionStatus,
    maxMemes: 6,
    votingThreshold: 100, // 100 votes to trigger last voting phase
    votingTimeLimit: 300, // 5 minutes in seconds
    votingEndTime: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
    nextSessionDelay: 3600, // 1 hour in seconds
    nextSessionStartTime: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    contributeEndTime: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    totalContributions: 5000000000, // in lamports
    tokenMintAddress: undefined
  },
  memes: [
    {
      id: "1",
      session: "123",
      name: "Solana Speed Meme",
      ticker: "$FAST",
      description: "When someone says Solana is not the fastest blockchain. Every ETH user Every ETH user",
      image: "https://i.ibb.co/XLG70hn/6af7541403a7.jpg",
      totalVotes: 150,
      isWinner: false,
      memeProgramId: "program1",
      isFromNews: true,
      tokenMintAddress: "",
    },
    {
      id: "2",
      session: "123",
      name: "ETH Gas Fees Be Like",
      ticker: "$GAS",
      description: "Every ETH user when they see the gas fees Every ETH user when they see the gas fees",
      image: "https://i.ibb.co/SV4PLm9/a2240f09c109.jpg",
      totalVotes: 120,
      isWinner: false,
      memeProgramId: "program2",
      tokenMintAddress: "",
    },
    {
      id: "3",
      session: "123",
      name: "Web3 Gaming Future",
      ticker: "$GAME",
      description: "The future of blockchain gaming looks bright The future of blockchain gaming looks bright",
      image: "https://i.ibb.co/XLG70hn/6af7541403a7.jpg",
      totalVotes: 90,
      isWinner: false,
      memeProgramId: "program3",
      tokenMintAddress: "",
    },
    {
      id: "4",
      session: "123",
      name: "DeFi Yield Farming",
      ticker: "$FARM",
      description: "When you find that 1000% APY yield farm When you find that 1000% APY yield farm",
      image: "https://i.ibb.co/SV4PLm9/a2240f09c109.jpg",
      totalVotes: 80,
      isWinner: false,
      memeProgramId: "program4",
      tokenMintAddress: "",
    },
    {
      id: "5",
      session: "123",
      name: "Solana Speed Meme",
      ticker: "$FAST",
      description: "When someone says Solana is not the fastest blockchain. Every ETH user Every ETH user",
      image: "https://i.ibb.co/XLG70hn/6af7541403a7.jpg",
      totalVotes: 150,
      isWinner: false,
      memeProgramId: "program1",
      isFromNews: true,
      tokenMintAddress: "",
    },
  ]
};