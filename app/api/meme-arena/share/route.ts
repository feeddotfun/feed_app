import {
  ActionPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS
} from '@solana/actions';
import {
  PublicKey,
} from '@solana/web3.js';
import { createMemeVote, getMemeVoteDetails } from '@/lib/actions/meme-arena.action';
import { getIpAddress, sendUpdate } from "@/lib/utils";

const customHeaders = {
  ...ACTIONS_CORS_HEADERS,
  'X-Action-Version': process.env.X_ACTION_VERSION!,
  'X-Blockchain-Ids': process.env.BLOCKCHAIN_ID!
}
export const GET = async (req: Request) => {
  
  try {
    const requestUrl = new URL(req.url);
    const { memeId, sessionId } = validatedQueryParams(requestUrl);

    const { meme } = await getMemeVoteDetails(memeId, sessionId);

    
    const baseUrl = process.env.API_URL!;

    const baseHref = new URL(
      `/api/meme-arena/share?memeId=${memeId}&sessionId=${sessionId}`,
      baseUrl
    ).toString();

    const payload: ActionGetResponse = {
      type: 'action',
      title: meme.name,
      icon: meme.image,
      description: meme.description,
      label: 'Vote',
      links: {
        actions: [
          {
            type: 'transaction',
            label: `Vote for ${meme.ticker}`,
            href: baseHref,
          }
        ],
      },
    };

    return Response.json(payload, { 
      headers: customHeaders
  });
  } catch (error) {
    return Response.json({ message: 'Failed to process vote request' }, {
      status: 500,
      headers: customHeaders
    });
  }
};

export const OPTIONS = async (req: Request) => {
  return new Response(null, { 
    status: 204, 
    headers: ACTIONS_CORS_HEADERS 
  });
};

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { memeId, sessionId } = validatedQueryParams(requestUrl);
    
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch {
      return Response.json({ message: 'Invalid wallet address provided' }, {
        status: 400,
        headers: customHeaders
      });
    }

    const voteResult = await createMemeVote({
      session: sessionId,
      meme: memeId,
      voter: account.toString(),
      voterIpAddress: await getIpAddress(req)
    });

    // Send SSE update
    sendUpdate('meme-vote-update', {
      meme: voteResult,
      timestamp: Date.now()
    });

    const response: ActionPostResponse = {
      type: 'post',
      message: `Vote submitted for ${voteResult.name}`,
      links: {
        next: {
          type: 'inline',
          action: {
            type: 'completed',
            title: 'Vote Successful',
            icon: voteResult.image,
            description: `Your vote for ${voteResult.name} has been recorded!`,
            label: 'Done'
          }
        }
      }
    };

    return Response.json(response, { 
      status: 200, 
      headers: customHeaders
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    return Response.json({ message }, {
      status: 400,
      headers: customHeaders
    });
  }
};

// Helper functions remain the same
function validatedQueryParams(requestUrl: URL) {
  let memeId = '';
  let sessionId = '';

  try {
    const memeIdParam = requestUrl.searchParams.get('memeId');
    const sessionIdParam = requestUrl.searchParams.get('sessionId');
    
    if (!memeIdParam || !sessionIdParam) {
      throw new Error('memeId and sessionId are required');
    }
    
    memeId = memeIdParam;
    sessionId = sessionIdParam;

  } catch {
    throw new Error('Invalid input parameters');
  }

  return {
    memeId,
    sessionId,
  };
}
