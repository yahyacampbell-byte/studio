
'use server';

// This service handles interactions with the CogniFit API.

const COGNIFIT_API_BASE_URL = process.env.COGNIFIT_API_BASE_URL || "https://api.cognifit.com";
const COGNIFIT_CLIENT_ID = process.env.COGNIFIT_CLIENT_ID;
const COGNIFIT_CLIENT_SECRET = process.env.COGNIFIT_CLIENT_SECRET;

// As per documentation, use a specific suffix for internal user emails.
const XILLO_EMAIL_SUFFIX = "@xillo.us";
// For prototyping, using a fixed strong password. In production, consider generation or other strategies.
const FIXED_USER_PASSWORD = "BrainBloomUserP@ssw0rd!2024"; 

export interface RegisterCognifitUserInput {
  appUserId: string; // A unique ID from your application (e.g., Firebase UID or a UUID)
  firstName: string;
  lastName: string;
  birthDate: string; // Format: "YYYY-MM-DD"
  sex: 1 | 2; // 1 for Male, 2 for Female
  locale: string; // e.g., "en", "es"
}

interface CognifitUserRegistrationResponse {
  user_token?: string;
  error?: string;
  errorMessage?: string;
  // The API might return other fields, consult docs for full response structure
}

/**
 * Registers a new user with CogniFit and returns their user_token.
 * This function generates an internal email address for CogniFit based on appUserId.
 */
export async function registerCognifitUser(
  input: RegisterCognifitUserInput
): Promise<string> {
  if (!COGNIFIT_CLIENT_ID || !COGNIFIT_CLIENT_SECRET) {
    throw new Error(
      "CogniFit API client ID or secret is not configured in environment variables."
    );
  }

  const internalUserEmail = `${input.appUserId}${XILLO_EMAIL_SUFFIX}`;

  const requestBody = {
    client_id: COGNIFIT_CLIENT_ID,
    client_secret: COGNIFIT_CLIENT_SECRET,
    user_name: input.firstName,
    user_lastname: input.lastName,
    user_email: internalUserEmail,
    user_password: FIXED_USER_PASSWORD,
    user_birthday: input.birthDate,
    user_sex: input.sex,
    user_locale: input.locale,
    // callback_url: "YOUR_OPTIONAL_CALLBACK_URL" // If needed
  };

  try {
    const response = await fetch(`${COGNIFIT_API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: CognifitUserRegistrationResponse = await response.json();

    if (!response.ok) {
      console.error("CogniFit API Error Response:", data);
      throw new Error(
        `CogniFit API error: ${data.errorMessage || data.error || response.statusText}`
      );
    }

    if (data.user_token) {
      console.log(`Successfully registered user ${internalUserEmail} with CogniFit. User token obtained.`);
      return data.user_token;
    } else {
      console.error("CogniFit API did not return a user_token:", data);
      throw new Error(
        `CogniFit registration failed: ${data.errorMessage || data.error || "No user_token received."}`
      );
    }
  } catch (error) {
    console.error("Error during CogniFit user registration:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to register user with CogniFit: ${error.message}`);
    }
    throw new Error("An unknown error occurred during CogniFit user registration.");
  }
}

/**
 * Fetches the current version of the CogniFit HTML5 SDK.
 * This should be called from the client-side or a server route accessible by the client,
 * as the SDK version is needed to construct the script URL for the html5Loader.js.
 * @returns The SDK version string.
 */
export async function getCognifitSDKVersion(): Promise<string> {
    try {
        const response = await fetch(`${COGNIFIT_API_BASE_URL}/description/versions/sdkjs?v=2.0`);
        if (!response.ok) {
            const errorData = await response.text();
            console.error("CogniFit SDK Version API Error Response Text:", errorData);
            throw new Error(`Failed to fetch SDK version: ${response.statusText} - ${errorData}`);
        }
        
        // The CogniFit documentation is slightly ambiguous here.
        // It might return JSON like {"version": "X.Y.Z"} or just the version string.
        // Let's try to parse as JSON first.
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data && typeof data.version === 'string') {
                return data.version;
            } else if (data && typeof data === 'string') { // sometimes it's just a string in a json response
                 return data.trim();
            }
        }
        
        // If not JSON or JSON parsing failed/didn't find 'version', try as plain text.
        // This requires re-cloning the response if already read as JSON, or careful handling.
        // For simplicity, if the above fails, we assume it's plain text.
        // A more robust solution might involve checking content-type more strictly or trying text() first.
        // However, the initial call to response.json() consumes the body. 
        // So, if it's plain text and json() fails, we need to fetch again or handle differently.
        // Let's assume for now it's primarily JSON. If issues arise, this part may need refinement.
        // Re-fetching as text if primary parsing fails:
        const textData = await (await fetch(`${COGNIFIT_API_BASE_URL}/description/versions/sdkjs?v=2.0`)).text();
        if (typeof textData === 'string' && /^\d+\.\d+\.\d+.*$/.test(textData.trim())) {
             return textData.trim();
        }

        console.error("Unexpected SDK version response format. Tried JSON and Text. TextData:", textData);
        throw new Error("Could not parse SDK version from CogniFit API.");

    } catch (error) {
        console.error("Error fetching CogniFit SDK version:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get CogniFit SDK version: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching CogniFit SDK version.");
    }
}
