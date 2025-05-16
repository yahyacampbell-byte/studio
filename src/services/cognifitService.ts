
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
 * @returns The SDK version string.
 */
export async function getCognifitSDKVersion(): Promise<string> {
    try {
        const response = await fetch(`${COGNIFIT_API_BASE_URL}/description/versions/sdkjs?v=2.0`);
        if (!response.ok) {
            throw new Error(`Failed to fetch SDK version: ${response.statusText}`);
        }
        const data = await response.json();
        // Assuming the version is directly in a field like 'version' or the first key
        // Adjust based on actual API response structure
        if (data && typeof data.version === 'string') {
             return data.version;
        }
        // Fallback or more specific parsing if needed. Example from docs was just the version string.
        // The CogniFit documentation implies the endpoint returns the version string directly or in a simple structure.
        // If it's just a string: return await response.text();
        // For now, assuming a simple JSON like {"version": "X.Y.Z"}
        // If the API directly returns the string, the .json() will fail.
        // Let's try text() first if json fails or doesn't have .version
        try {
            const textData = await response.text(); // Re-fetch as text if primary parsing fails
            // Basic check if it looks like a version string
            if (typeof textData === 'string' && /^\d+\.\d+\.\d+.*$/.test(textData)) {
                return textData.trim();
            }
        } catch (textError) {
            // ignore, primary parse failed and text parse also failed
        }

        console.error("Unexpected SDK version response format:", data);
        throw new Error("Could not parse SDK version from CogniFit API.");

    } catch (error) {
        console.error("Error fetching CogniFit SDK version:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get CogniFit SDK version: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching CogniFit SDK version.");
    }
}
