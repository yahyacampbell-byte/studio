
// src/app/api/cognifit/register-user/route.ts
import { NextResponse } from 'next/server';
import { registerCognifitUser as registerCognifitUserLogic, type RegisterCognifitUserInput } from '@/services/cognifitService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appUserId, firstName, lastName, birthDate, sex, locale } = body;

    if (!appUserId || !firstName || !lastName || !birthDate || !sex || !locale) {
      return NextResponse.json({ error: 'Missing required user details for Cognitive Gym registration.' }, { status: 400 });
    }

    const input: RegisterCognifitUserInput = {
      appUserId,
      firstName,
      lastName,
      birthDate,
      sex,
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
