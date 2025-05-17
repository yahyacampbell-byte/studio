
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    let clientErrorMessage = 'Failed to obtain session token from Cognitive Gym.';
     if (errorMessage.includes("Cognitive Gym API client ID or secret is not configured")) {
        clientErrorMessage = "Cognitive Gym service configuration error.";
    } else if (errorMessage.includes("User token is missing")) {
        clientErrorMessage = "User token was missing in the request to Cognitive Gym.";
    } else if (errorMessage.includes("Cognitive Gym API error")) {
        clientErrorMessage = "Could not connect to Cognitive Gym services to obtain a session token. Please try again later.";
    }

    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}

    