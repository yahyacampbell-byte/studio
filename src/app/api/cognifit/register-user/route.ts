
// src/app/api/cognifit/register-user/route.ts
import { NextResponse } from 'next/server';
import { registerCognifitUser as registerCognifitUserLogic, type RegisterCognifitUserInput } from '@/services/cognifitService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appUserId, firstName, lastName, birthDate, sex, locale } = body;

    // Validate required fields, especially sex which is now '0' or '1' string from client
    if (!appUserId || !firstName || !lastName || !birthDate || (sex !== '0' && sex !== '1') || !locale) {
      return NextResponse.json({ error: 'Missing or invalid required user details for Cognitive Gym registration.' }, { status: 400 });
    }

    const parsedSex = parseInt(sex, 10);
    if (parsedSex !== 0 && parsedSex !== 1) { // Double check after parsing
        return NextResponse.json({ error: 'Invalid gender value for Cognitive Gym registration.' }, { status: 400 });
    }

    const input: RegisterCognifitUserInput = {
      appUserId,
      firstName,
      lastName,
      birthDate,
      sex: parsedSex as 0 | 1, // Cast to number type 0 or 1
      locale,
    };

    const userToken = await registerCognifitUserLogic(input);
    return NextResponse.json({ userToken }, { status: 200 });

  } catch (error) {
    console.error('API Route - Cognitive Gym Registration Error:', error); // Server-side log
    const originalErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Cognitive Gym registration.';
    
    let clientErrorMessage = 'Failed to register with Cognitive Gym.'; // Default fallback

    if (originalErrorMessage.includes("Cognitive Gym API client ID or secret is not configured")) {
        clientErrorMessage = "Cognitive Gym service configuration error.";
    } else if (originalErrorMessage.includes("no user_token received")) { 
        clientErrorMessage = "Registration with Cognitive Gym was incomplete. No user token was provided by the service.";
    } else if (originalErrorMessage.includes("Cognitive Gym API error")) { 
        clientErrorMessage = "Could not connect to Cognitive Gym services. Please try again later.";
    } else if (originalErrorMessage.includes("Failed to process Cognitive Gym user registration")) { 
        clientErrorMessage = "An internal error occurred while trying to register with Cognitive Gym.";
    }
    // If it's truly unknown and doesn't match any, it uses the default "Failed to register with Cognitive Gym."

    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}
