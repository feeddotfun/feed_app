import {
    ActionPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    createActionHeaders,
  } from '@solana/actions';
  import {
    PublicKey,
  } from '@solana/web3.js';
  import { createMemeVote, getMemeVoteDetails } from '@/lib/actions/meme-arena.action';
  import { sendUpdate } from '@/app/api/sse/route';
  import { headers } from 'next/headers';
  
  const actionHeaders = createActionHeaders();
  
  export const GET = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      const { memeId, sessionId } = validatedQueryParams(requestUrl);
  
      const { meme } = await getMemeVoteDetails(memeId, sessionId);
  
      const baseHref = new URL(
        `/api/meme-arena/share?memeId=${memeId}&sessionId=${sessionId}`,
        requestUrl.origin,
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
  
      return Response.json(payload, { headers: actionHeaders });
    } catch (err) {
      console.error('Vote GET Error:', err);
      return Response.json({ message: 'Failed to process vote request' }, {
        status: 500,
        headers: actionHeaders,
      });
    }
  };
  
  export const OPTIONS = async (req: Request) => {
    return new Response(null, { headers: actionHeaders });
  };
  
  export const POST = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      const { memeId, sessionId } = validatedQueryParams(requestUrl);
      
      const body: ActionPostRequest = await req.json();
  
      let account: PublicKey;
      try {
        account = new PublicKey(body.account);
      } catch (err) {
        return Response.json({ message: 'Invalid wallet address provided' }, {
          status: 400,
          headers: actionHeaders,
        });
      }
  
      try {
        // Use existing vote system
        const voteResult = await createMemeVote({
          session: sessionId,
          meme: memeId,
          voter: account.toString(),
          voterIpAddress: await getIpAddress()
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
  
        return Response.json(response, { headers: actionHeaders });
  
      } catch (error) {
        // Handle vote-specific errors
        const errorMessage = error instanceof Error ? error.message : 'Failed to process vote';
        return Response.json({ message: errorMessage }, {
          status: 400,
          headers: actionHeaders,
        });
      }
  
    } catch (err) {
      console.error('Vote POST Error:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      return Response.json({ message }, {
        status: 400,
        headers: actionHeaders,
      });
    }
  };
  
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
  
    } catch (err) {
      throw new Error('Invalid input parameters');
    }
  
    return {
      memeId,
      sessionId,
    };
  }

  export async function getIpAddress(): Promise<string> {
    const headersList = await headers();
    
    // Check all possible headers
    const forwardedFor = headersList.get('x-forwarded-for');
    const vercelForwardedFor = headersList.get('x-vercel-forwarded-for');
    const cfConnectingIp = headersList.get('cf-connecting-ip');
    const realIp = headersList.get('x-real-ip');
  
    // For development, return a mock IP
    if (process.env.NODE_ENV === 'development') {
      return '127.0.0.1';
    }
  
    // In order of preference
    return vercelForwardedFor || 
           (forwardedFor?.split(',')[0].trim()) || 
           cfConnectingIp || 
           realIp || 
           '127.0.0.1';
}