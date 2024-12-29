const { TextEncoder, TextDecoder } = require('util');
require('@testing-library/jest-dom');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock mongoose connection
jest.mock('@/lib/database/mongoose', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(true)
}));

// Mock mongoose session
const mockMongooseSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn().mockResolvedValue(null),
  abortTransaction: jest.fn().mockResolvedValue(null),
  endSession: jest.fn()
};

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  startSession: jest.fn().mockResolvedValue(mockMongooseSession),
  connect: jest.fn(),
  connection: {
    once: jest.fn(),
    on: jest.fn(),
  }
}));

// Mock chain methods
const mockChainMethods = {
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  session: jest.fn().mockReturnThis()
};

// Mock MemeArenaSession methods
const mockMemeArenaSession = {
  findById: jest.fn(() => ({
    session: jest.fn().mockResolvedValue({
      _id: 'test-session-id',
      id: 'test-session-id',
      status: 'Voting',
      maxMemes: 10,
      votingThreshold: 100,
      votingTimeLimit: 300000,
      toString: () => 'test-session-id'
    })
  })),
  findOne: jest.fn(() => ({
    ...mockChainMethods,
    lean: jest.fn().mockResolvedValue({
      _id: 'test-session-id',
      status: 'Voting',
      startTime: new Date()
    })
  })),
  findByIdAndUpdate: jest.fn(() => ({
    session: jest.fn().mockResolvedValue({
      _id: 'test-session-id',
      id: 'test-session-id',
      status: 'LastVoting',
      votingEndTime: new Date(),
      toString: () => 'test-session-id'
    })
  })),
  create: jest.fn(),
  countDocuments: jest.fn(() => ({
    session: jest.fn().mockResolvedValue(0)
  }))
};

// Mock Meme methods
const mockMeme = {
  find: jest.fn(() => ({
    ...mockChainMethods,
    lean: jest.fn().mockResolvedValue([{
      _id: 'test-meme-id',
      name: 'Test Meme',
      ticker: 'TEST',
      description: 'Test Description',
      image: 'test-image.jpg',
      totalVotes: 0,
      isWinner: false,
      memeProgramId: 'test-program-id',
      session: {
        _id: 'test-session-id',
        toString: () => 'test-session-id'
      }
    }])
  })),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  countDocuments: jest.fn(() => ({
    session: jest.fn().mockResolvedValue(0)
  }))
};

// Mock MemeVote
const mockMemeVote = {
  findOne: jest.fn(),
  create: jest.fn(),
};

// Global mocks
jest.mock('@/lib/database/models/meme-arena-session.model', () => mockMemeArenaSession);
jest.mock('@/lib/database/models/meme.model', () => mockMeme);
jest.mock('@/lib/database/models/meme-vote.model', () => mockMemeVote);
jest.mock('@/lib/actions/sse', () => ({
  sendUpdate: jest.fn()
}));

// Mock MemeArenaTimerService
jest.mock('@/lib/services/meme-arena-timer.service', () => ({
  MemeArenaTimerService: {
    getInstance: jest.fn(() => ({
      scheduleVotingEnd: jest.fn().mockResolvedValue({
        success: true,
        scheduledTime: new Date()
      })
    }))
  }
}));