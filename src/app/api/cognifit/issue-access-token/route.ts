
// src/app/api/cognifit/issue-access-token/route.ts
import { NextResponse } from 'next/server';
import { issueCognifitAccessToken as issueCognifitAccessTokenLogic } from '@/services/cognifitService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userToken } = body;

    if (!userToken) {
      return NextResponse.json({ error: 'User token is required.' }, { status: 400 });
    }

    const accessToken = await issueCognifitAccessTokenLogic(userToken);
    return NextResponse.json({ accessToken }, { status: 200 });

  } catch (error) {
    console.error('API Route - Cognitive Gym Issue Access Token Error:', error);
    const originalErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    let clientErrorMessage = 'Failed to obtain session token from Cognitive Gym.'; // Default fallback

    if (originalErrorMessage.includes("Cognitive Gym API client ID or secret is not configured")) {
        clientErrorMessage = "Cognitive Gym service configuration error.";
    } else if (originalErrorMessage.includes("User token is missing")) { // Specific to this route's input validation
        clientErrorMessage = "User token was missing in the request to Cognitive Gym.";
    } else if (originalErrorMessage.includes("no access_token received")) { // Service might throw this if API succeeds but no token
        clientErrorMessage = "Could not obtain a session token from Cognitive Gym: No token was provided by the service.";
    } else if (originalErrorMessage.includes("Cognitive Gym API error")) { // Handles direct API errors from CogniFit
        clientErrorMessage = "Could not connect to Cognitive Gym services to obtain a session token. Please try again later.";
    } else if (originalErrorMessage.includes("Failed to process Cognitive Gym access token issuance")) { // Handles other processing errors within our service
        clientErrorMessage = "An internal error occurred while trying to obtain a session token from Cognitive Gym.";
    }
    // If it's truly unknown and doesn't match any, it uses the default fallback.

    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}
