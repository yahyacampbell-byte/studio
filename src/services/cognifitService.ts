
// This service handles interactions with the Cognitive Gym API.

const XILLO_EMAIL_SUFFIX = "@xillo.us";
// Password requires minimum 8 characters with a numerical, uppercase and special character.
const FIXED_USER_PASSWORD = "XilloGymP@ssw0rd123!";

export interface RegisterCognifitUserInput {
  appUserId: string;
  firstName: string;
  lastName:string;
  birthDate: string;
  sex: 1 | 2;
  locale: string;
}

interface CognifitUserRegistrationResponse {
  user_token?: string;
  error?: string;
  errorMessage?: string;
}

/**
 * Registers a new user with Cognitive Gym and returns their user_token.
 * This function generates an internal email address for Cognitive Gym based on appUserId.
 */
export async function registerCognifitUser(
  input: RegisterCognifitUserInput
): Promise<string> {
  const COGNITFIT_CLIENT_ID = process.env.COGNITFIT_CLIENT_ID;
  const COGNITFIT_CLIENT_SECRET = process.env.COGNITFIT_CLIENT_SECRET;
  const COGNITFIT_API_BASE_URL = process.env.COGNITFIT_API_BASE_URL || "https://api.cognifit.com";

  if (!COGNITFIT_CLIENT_ID || !COGNITFIT_CLIENT_SECRET) {
    console.error("Cognitive Gym API client ID or secret is not configured. Ensure COGNITFIT_CLIENT_ID and COGNITFIT_CLIENT_SECRET are set in the environment.");
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
    user_sex: input.sex,
    user_locale: input.locale,
  };

  try {
    const response = await fetch(`${COGNITFIT_API_BASE_URL}/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const requestBodyForLog = { ...requestBody, client_secret: 'REDACTED', user_password: 'REDACTED' };
      console.error(`Cognitive Gym API Error: ${response.status} ${response.statusText}. URL: ${COGNITFIT_API_BASE_URL}/v1/users. Request Body: ${JSON.stringify(requestBodyForLog)}. Response body: ${responseText}`);
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
        throw new Error(`Failed to register user with Cognitive Gym: ${error.message}`);
    }
    throw new Error("An unknown error occurred during Cognitive Gym user registration.");
  }
}

/**
 * Fetches the current version of the Cognitive Gym HTML5 SDK.
 * @returns The SDK version string.
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

        // Try to parse as JSON, but fall back to plain text if it's not JSON
        try {
            const jsonData = JSON.parse(responseText);
            if (jsonData && typeof jsonData.version === 'string') {
                return jsonData.version;
            }
            // If jsonData is a string (some APIs might return plain text directly)
            if (typeof jsonData === 'string' && /^\d+\.\d+\.\d+.*$/.test(jsonData.trim())) {
                return jsonData.trim();
            }
        } catch (e) {
            // Not JSON, or JSON parsing failed. Proceed to check if responseText itself is a valid version string.
        }
        
        // Check if the raw responseText is a valid version string
        if (typeof responseText === 'string' && /^\d+\.\d+\.\d+.*$/.test(responseText.trim())) {
             return responseText.trim();
        }

        console.error("Unexpected SDK version response format. Response text:", responseText);
        throw new Error("Could not parse SDK version from Cognitive Gym API response.");

    } catch (error) {
        console.error("Error fetching Cognitive Gym SDK version:", error);
        if (error instanceof Error && (error.message.startsWith("Failed to fetch SDK version") || error.message.startsWith("Could not parse SDK version"))) {
            throw error; // Re-throw specific known errors
        }
        // Wrap other errors
        throw new Error(`An unknown error occurred while fetching Cognitive Gym SDK version: ${error instanceof Error ? error.message : String(error)}`);
    }
}
