
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
    console.error('API Route - Cognitive Gym Registration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Cognitive Gym registration.';
    // Ensure the error message sent to client doesn't expose too much detail
    let clientErrorMessage = 'Failed to register with Cognitive Gym.';
    if (errorMessage.includes("Cognitive Gym API client ID or secret is not configured")) {
        clientErrorMessage = "Cognitive Gym service configuration error.";
    } else if (errorMessage.includes("Cognitive Gym API error")) {
        // Avoid sending detailed API errors to the client unless they are generic
        clientErrorMessage = "Could not connect to Cognitive Gym services. Please try again later.";
    }
    
    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}
