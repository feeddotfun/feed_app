import { createMeme, getActiveSessionMemes, createMemeVote } from '@/lib/actions/meme-arena.action';
import MemeArenaSession from '@/lib/database/models/meme-arena-session.model';
import Meme from '@/lib/database/models/meme.model';
import MemeVote from '@/lib/database/models/meme-vote.model';
import { sendUpdate } from '@/lib/actions/sse';

describe('Meme Arena Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMeme', () => {
    const mockMemeData = {
      name: 'Test Meme',
      ticker: 'TEST',
      description: 'Test Description',
      image: 'https://test.com/image.jpg',
      session: 'test-session-id',
    };

    it('should create a meme successfully', async () => {
      const mockCreatedMeme = {
        ...mockMemeData,
        _id: 'test-meme-id',
        createdAt: new Date(),
        totalVotes: 0,
        isWinner: false,
        memeProgramId: 'test-program-id',
        session: {
          toString: () => 'test-session-id'
        }
      };

      // Mock session-specific behavior
      const mockSession = {
        _id: 'test-session-id',
        status: 'Voting',
        maxMemes: 10,
        session: { toString: () => 'test-session-id' }
      };

      (MemeArenaSession.findById as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockSession)
      });

      (Meme.countDocuments as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(0)
      });

      (Meme.create as jest.Mock).mockResolvedValueOnce([mockCreatedMeme]);
      
      const result = await createMeme(mockMemeData);

      expect(result).toBeDefined();
      expect(result.name).toBe(mockMemeData.name);
      expect(result.ticker).toBe(mockMemeData.ticker);
      expect(sendUpdate).toHaveBeenCalledWith({
        type: 'new-meme',
        meme: expect.any(Object),
        timestamp: expect.any(Number),
      });
    });

    it('should throw error when session is full', async () => {
      // Mock session-specific behavior
      const mockSession = {
        _id: 'test-session-id',
        status: 'Voting',
        maxMemes: 10,
        session: { toString: () => 'test-session-id' }
      };

      (MemeArenaSession.findById as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockSession)
      });

      (Meme.countDocuments as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(10)
      });
      
      await expect(createMeme(mockMemeData)).rejects.toThrow(
        'Maximum meme limit reached'
      );
    });
  });

  describe('getActiveSessionMemes', () => {
    it('should return voting session with memes', async () => {
      const mockSession = {
        _id: 'test-session-id',
        status: 'Voting',
        startTime: new Date()
      };

      const mockMemes = [{
        _id: 'meme-1',
        name: 'Test Meme 1',
        ticker: 'TEST1',
        totalVotes: 10,
        isWinner: false,
        memeProgramId: 'test-program-id',
        session: 'test-session-id'
      }];

      (MemeArenaSession.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockSession)
      });

      (Meme.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockMemes)
      });

      const result = await getActiveSessionMemes();

      expect(result.session).toBeDefined();
      expect(result.session.status).toBe('Voting');
      expect(result.memes).toHaveLength(1);
    });

    it('should throw error when no session exists', async () => {
      (MemeArenaSession.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null)
      });

      await expect(getActiveSessionMemes()).rejects.toThrow('No active session found');
    });
  });

  describe('createMemeVote', () => {
    const mockVoteData = {
      meme: 'test-meme-id',
      session: 'test-session-id',
      voter: 'test-wallet-address',
      voterIpAddress: '127.0.0.1'
    };

    it('should create vote successfully', async () => {
      // Mock session
      (MemeArenaSession.findById as jest.Mock).mockResolvedValue({
        _id: 'test-session-id',
        id: 'test-session-id',
        status: 'Voting',
        votingThreshold: 100,
        toString: () => 'test-session-id'
      });

      // Mock no existing vote
      (MemeVote.findOne as jest.Mock).mockResolvedValue(null);

      // Mock vote creation
      (MemeVote.create as jest.Mock).mockResolvedValue(mockVoteData);

      // Mock meme update with correct session format
      const mockUpdatedMeme = {
        _id: 'test-meme-id',
        totalVotes: 1,
        name: 'Test Meme',
        ticker: 'TEST',
        description: 'Test Description',
        image: 'test-image.jpg',
        session: {
          _id: 'test-session-id',
          toString: () => 'test-session-id'
        },
        isWinner: false,
        memeProgramId: 'test-program-id'
      };
      (Meme.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedMeme);

      const result = await createMemeVote(mockVoteData);

      expect(result).toBeDefined();
      expect(sendUpdate).toHaveBeenCalledWith({
        type: 'vote-update',
        meme: expect.any(Object)
      });
    });

    it('should throw error for duplicate vote', async () => {
      (MemeArenaSession.findById as jest.Mock).mockResolvedValue({
        _id: 'test-session-id',
        status: 'Voting'
      });

      (MemeVote.findOne as jest.Mock).mockResolvedValue({ 
        _id: 'existing-vote' 
      });

      await expect(createMemeVote(mockVoteData)).rejects.toThrow(
        'You have already voted in this session'
      );
    });

    it('should throw error for invalid session status', async () => {
      (MemeArenaSession.findById as jest.Mock).mockResolvedValue({
        _id: 'test-session-id',
        status: 'Completed'
      });

      await expect(createMemeVote(mockVoteData)).rejects.toThrow(
        'Invalid session or voting not active'
      );
    });

    it('should start last voting when threshold reached', async () => {
      // Mock session with id
      const mockSession = {
        _id: 'test-session-id',
        id: 'test-session-id',
        status: 'Voting',
        votingThreshold: 10,
        votingTimeLimit: 300000,
        toString: () => 'test-session-id'
      };
      
      // Mock session
      (MemeArenaSession.findById as jest.Mock).mockResolvedValue(mockSession);

      // Mock no existing vote
      (MemeArenaSession.findById as jest.Mock).mockImplementationOnce(() => ({
        session: jest.fn().mockResolvedValue(mockSession)
      }));

      (MemeVote.findOne as jest.Mock).mockResolvedValue(null);
      (MemeVote.create as jest.Mock).mockResolvedValue(mockVoteData);

      // Mock meme update with correct session format
      const mockUpdatedMeme = {
        _id: 'test-meme-id',
        totalVotes: 10, // Equal to threshold
        name: 'Test Meme',
        ticker: 'TEST',
        description: 'Test Description',
        image: 'test-image.jpg',
        session: {
          _id: 'test-session-id',
          toString: () => 'test-session-id'
        },
        isWinner: false,
        memeProgramId: 'test-program-id'
      };
      (Meme.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedMeme);

      // Mock session update for last voting
      (MemeArenaSession.findByIdAndUpdate as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue({
          ...mockSession,
          status: 'LastVoting',
          votingEndTime: new Date()
        })
      });

      const result = await createMemeVote(mockVoteData);

      expect(result).toBeDefined();
      expect(sendUpdate).toHaveBeenCalled();
      expect(sendUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vote-update',
          meme: expect.any(Object)
        })
      );
    });
  });
  
});