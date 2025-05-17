
// This service handles interactions with the Cognitive Gym API.
// These are regular server-side functions.

const XILLO_EMAIL_SUFFIX = "@xillo.us";
// Password requires minimum 8 characters with a numerical, uppercase and special character.
const FIXED_USER_PASSWORD = "XilloGymP@ssw0rd123!"; // Updated password

export interface RegisterCognifitUserInput {
  appUserId: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  sex: 0 | 1; // 0 for Female, 1 for Male (number)
  locale: string;
}

interface CognifitUserRegistrationResponse {
  user_token?: string;
  error?: string;
  errorMessage?: string;
}

/**
 * Registers a new user with Cognitive Gym and returns their user_token.
 * This function is intended to be called from a server-side context (e.g., an API route).
 */
export async function registerCognifitUser(
  input: RegisterCognifitUserInput
): Promise<string> {
  const COGNITFIT_CLIENT_ID = process.env.COGNITFIT_CLIENT_ID;
  const COGNITFIT_CLIENT_SECRET = process.env.COGNITFIT_CLIENT_SECRET;
  const COGNITFIT_API_BASE_URL = process.env.COGNITFIT_API_BASE_URL || "https://api.cognifit.com";

  if (!COGNITFIT_CLIENT_ID || !COGNITFIT_CLIENT_SECRET) {
    console.error("Cognitive Gym API client ID or secret is not configured. Ensure COGNITFIT_CLIENT_ID and COGNITFIT_CLIENT_SECRET are set in the environment.");
    // This specific error message will be caught by the API route to provide a user-friendly message.
    throw new Error(
      "Cognitive Gym API client ID or secret is not configured in environment variables."
    );
  }

  const internalUserEmail = `${input.appUserId}${XILLO_EMAIL_SUFFIX}`;

  const requestBody = {
    client_id: COGNITFIT_CLIENT_ID,
    client_secret: COGNITFIT_CLIENT_SECRET,
    user_name: input.firstName,
    user_lastname: input.lastName,
    user_email: internalUserEmail,
    user_password: FIXED_USER_PASSWORD,
    user_birthday: input.birthDate,
    user_sex: input.sex, // Now expects 0 or 1 (number)
    user_locale: input.locale,
  };

  try {
    // Using the /registration endpoint as per new documentation
    const response = await fetch(`${COGNITFIT_API_BASE_URL}/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const requestBodyForLog = { ...requestBody, client_secret: 'REDACTED', user_password: 'REDACTED' };
      console.error(`Cognitive Gym API Error: ${response.status} ${response.statusText}. URL: ${COGNITFIT_API_BASE_URL}/registration. Request Body: ${JSON.stringify(requestBodyForLog)}. Response body: ${responseText}`);
      try {
        const errorData: CognifitUserRegistrationResponse = JSON.parse(responseText);
        throw new Error(
          `Cognitive Gym API error (${response.status}): ${errorData.errorMessage || errorData.error || responseText}`
        );
      } catch (parseError) {
        // If parsing fails, use the raw text
        throw new Error(
          `Cognitive Gym API error (${response.status}): ${responseText || response.statusText}`
        );
      }
    }

    const data: CognifitUserRegistrationResponse = JSON.parse(responseText);

    if (data.user_token) {
      console.log(`Successfully registered user ${internalUserEmail} with Cognitive Gym. User token obtained.`);
      return data.user_token;
    } else {
      console.error("Cognitive Gym API did not return a user_token in a successful response:", data);
      throw new Error(
        `Cognitive Gym registration successful but no user_token received: ${data.errorMessage || data.error || "Unknown issue."}`
      );
    }
  } catch (error) {
    console.error("Error during Cognitive Gym user registration:", error);
    if (error instanceof Error) {
        // Re-throw specific known errors, otherwise wrap in a generic message
        if (error.message.startsWith("Cognitive Gym API error") || error.message.startsWith("Cognitive Gym registration successful but no user_token received") || error.message.startsWith("Cognitive Gym API client ID or secret is not configured")) {
            throw error;
        }
        // This generic error message will be caught by the API route
        throw new Error(`Failed to process Cognitive Gym registration: ${error.message}`);
    }
    throw new Error("An unknown error occurred during Cognitive Gym user registration processing.");
  }
}

/**
 * Fetches the current version of the Cognitive Gym HTML5 SDK.
 * This function is intended to be called from a server-side context (e.g., an API route or server component).
 */
export async function getCognifitSDKVersion(): Promise<string> {
    const COGNITFIT_API_BASE_URL = process.env.COGNITFIT_API_BASE_URL || "https://api.cognifit.com";
    try {
        const response = await fetch(`${COGNITFIT_API_BASE_URL}/description/versions/sdkjs?v=2.0`);
        const responseText = await response.text();

        if (!response.ok) {
            console.error(`Cognitive Gym SDK Version API Error: ${response.status} ${response.statusText}. Response body: ${responseText}`);
            throw new Error(`Failed to fetch SDK version (${response.status}): ${responseText || response.statusText}`);
        }
        
        try {
            const jsonData = JSON.parse(responseText);
            if (jsonData && typeof jsonData.version === 'string') {
                return jsonData.version;
            }
            // If response is a plain string (like "2.36.0")
            if (typeof jsonData === 'string' && /^\d+\.\d+\.\d+.*$/.test(jsonData.trim())) {
                return jsonData.trim();
            }
        } catch (e) {
            // Not JSON, or JSON parsing failed.
        }
        
        // Handle if responseText itself is the version string
        if (typeof responseText === 'string' && /^\d+\.\d+\.\d+.*$/.test(responseText.trim())) {
             return responseText.trim();
        }

        console.error("Unexpected SDK version response format. Response text:", responseText);
        throw new Error("Could not parse SDK version from Cognitive Gym API response.");

    } catch (error) {
        console.error("Error fetching Cognitive Gym SDK version:", error);
        if (error instanceof Error && (error.message.startsWith("Failed to fetch SDK version") || error.message.startsWith("Could not parse SDK version"))) {
            throw error;
        }
        throw new Error(`An unknown error occurred while fetching Cognitive Gym SDK version: ${error instanceof Error ? error.message : String(error)}`);
    }
}
