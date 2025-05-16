
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

    const responseText = await response.text(); // Get response as text first

    if (!response.ok) {
      console.error(`CogniFit API Error: ${response.status} ${response.statusText}. Response body: ${responseText}`);
      // Try to parse as JSON to extract a structured error message if available
      try {
        const errorData: CognifitUserRegistrationResponse = JSON.parse(responseText);
        throw new Error(
          `CogniFit API error (${response.status}): ${errorData.errorMessage || errorData.error || responseText}`
        );
      } catch (parseError) {
        // If parsing fails, use the raw text
        throw new Error(
          `CogniFit API error (${response.status}): ${responseText || response.statusText}`
        );
      }
    }

    // If response.ok, try to parse the text as JSON for the expected success response
    const data: CognifitUserRegistrationResponse = JSON.parse(responseText);

    if (data.user_token) {
      console.log(`Successfully registered user ${internalUserEmail} with CogniFit. User token obtained.`);
      return data.user_token;
    } else {
      console.error("CogniFit API did not return a user_token in a successful response:", data);
      throw new Error(
        `CogniFit registration successful but no user_token received: ${data.errorMessage || data.error || "Unknown issue."}`
      );
    }
  } catch (error) {
    console.error("Error during CogniFit user registration:", error);
    if (error instanceof Error) {
        // Avoid re-wrapping if it's already one of our specific errors
        if (error.message.startsWith("CogniFit API error") || error.message.startsWith("CogniFit registration successful but no user_token received")) {
            throw error;
        }
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
        const responseText = await response.text(); // Get text first

        if (!response.ok) {
            console.error(`CogniFit SDK Version API Error: ${response.status} ${response.statusText}. Response body: ${responseText}`);
            throw new Error(`Failed to fetch SDK version (${response.status}): ${responseText || response.statusText}`);
        }
        
        // Try to parse as JSON first, as this seems to be one expected format
        try {
            const jsonData = JSON.parse(responseText);
            if (jsonData && typeof jsonData.version === 'string') {
                return jsonData.version;
            }
            // Some APIs might return just a string within a JSON response body, e.g. "2.3.4"
            if (jsonData && typeof jsonData === 'string' && /^\d+\.\d+\.\d+.*$/.test(jsonData.trim())) { // Regex to check for version-like string
                return jsonData.trim();
            }
        } catch (e) {
            // Not JSON, or JSON but not the expected structure. Proceed to check if plain text is the version.
        }

        // If not valid JSON or not the expected JSON structure, check if the raw text is the version string
        if (typeof responseText === 'string' && /^\d+\.\d+\.\d+.*$/.test(responseText.trim())) { // Regex to check for version-like string
             return responseText.trim();
        }

        console.error("Unexpected SDK version response format. Response text:", responseText);
        throw new Error("Could not parse SDK version from CogniFit API response.");

    } catch (error) {
        console.error("Error fetching CogniFit SDK version:", error);
        if (error instanceof Error && (error.message.startsWith("Failed to fetch SDK version") || error.message.startsWith("Could not parse SDK version"))) {
            throw error;
        }
        throw new Error(`An unknown error occurred while fetching CogniFit SDK version: ${error instanceof Error ? error.message : String(error)}`);
    }
}

