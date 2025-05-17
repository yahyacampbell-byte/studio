
// This service handles interactions with the Cognitive Gym API.
// These are regular server-side functions.

const XILLO_EMAIL_SUFFIX = "@xillo.us";
const FIXED_USER_PASSWORD = "XilloGymP@ssw0rd123!"; // Ensure this meets complexity: min 8, num, UC, special

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

interface CognifitAccessTokenResponse {
  access_token?: string;
  expires?: number; // Timestamp
  expires_in?: number; // Seconds
  error?: string;
  errorMessage?: string;
}

/**
 * Registers a new user with Cognitive Gym and returns their user_token.
 */
export async function registerCognifitUser(
  input: RegisterCognifitUserInput
): Promise<string> {
  const COGNITFIT_CLIENT_ID = process.env.cognifit_id_server;
  const COGNITFIT_CLIENT_SECRET = process.env.cognifit_secret_server;
  const COGNITFIT_API_BASE_URL = process.env.cognifit_api_base_url || "https://api.cognifit.com";

  if (!COGNITFIT_CLIENT_ID || !COGNITFIT_CLIENT_SECRET) {
    console.error("Cognitive Gym API client ID or secret is not configured. Ensure cognifit_id_server and cognifit_secret_server are set in the environment.");
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
    user_sex: input.sex, // Ensure this is number 0 or 1
    user_locale: input.locale,
  };

  try {
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
      console.error(`Cognitive Gym User Registration API Error: ${response.status} ${response.statusText}. URL: ${COGNITFIT_API_BASE_URL}/registration. Request Body: ${JSON.stringify(requestBodyForLog)}. Response body: ${responseText}`);
      try {
        const errorData: CognifitUserRegistrationResponse = JSON.parse(responseText);
        throw new Error(
          `Cognitive Gym API error (${response.status}) during user registration: ${errorData.errorMessage || errorData.error || responseText}`
        );
      } catch (parseError) {
        throw new Error(
          `Cognitive Gym API error (${response.status}) during user registration: ${responseText || response.statusText}`
        );
      }
    }

    const data: CognifitUserRegistrationResponse = JSON.parse(responseText);

    if (data.user_token) {
      console.log(`Successfully registered user ${internalUserEmail} with Cognitive Gym. User token obtained.`);
      return data.user_token;
    } else {
      console.error("Cognitive Gym API did not return a user_token in a successful registration response:", data);
      throw new Error(
        `Cognitive Gym registration successful but no user_token received: ${data.errorMessage || data.error || "Unknown issue."}`
      );
    }
  } catch (error) {
    console.error("Error during Cognitive Gym user registration service call:", error);
    if (error instanceof Error) {
        if (error.message.startsWith("Cognitive Gym API error") || error.message.startsWith("Cognitive Gym registration successful but no user_token received") || error.message.startsWith("Cognitive Gym API client ID or secret is not configured")) {
            throw error;
        }
        throw new Error(`Failed to process Cognitive Gym user registration: ${error.message}`);
    }
    throw new Error("An unknown error occurred during Cognitive Gym user registration processing.");
  }
}


/**
 * Issues an access_token from Cognitive Gym using a user_token.
 */
export async function issueCognifitAccessToken(userToken: string): Promise<string> {
  const COGNITFIT_CLIENT_ID = process.env.cognifit_id_server;
  const COGNITFIT_CLIENT_SECRET = process.env.cognifit_secret_server;
  const COGNITFIT_API_BASE_URL = process.env.cognifit_api_base_url || "https://api.cognifit.com";

  if (!COGNITFIT_CLIENT_ID || !COGNITFIT_CLIENT_SECRET) {
    console.error("Cognitive Gym API client ID or secret is not configured for issuing access token.");
    throw new Error(
      "Cognitive Gym API client ID or secret is not configured in environment variables."
    );
  }
  if (!userToken) {
    console.error("User token is required to issue an access token.");
    throw new Error("User token is missing.");
  }

  const requestBody = {
    client_id: COGNITFIT_CLIENT_ID,
    client_secret: COGNITFIT_CLIENT_SECRET,
    user_token: userToken,
  };

  try {
    const response = await fetch(`${COGNITFIT_API_BASE_URL}/issue-access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const requestBodyForLog = { ...requestBody, client_secret: 'REDACTED' };
      console.error(`Cognitive Gym Issue Access Token API Error: ${response.status} ${response.statusText}. URL: ${COGNITFIT_API_BASE_URL}/issue-access-token. Request Body: ${JSON.stringify(requestBodyForLog)}. Response body: ${responseText}`);
      try {
        const errorData: CognifitAccessTokenResponse = JSON.parse(responseText);
        throw new Error(
          `Cognitive Gym API error (${response.status}) during access token issuance: ${errorData.errorMessage || errorData.error || responseText}`
        );
      } catch (parseError) {
        throw new Error(
          `Cognitive Gym API error (${response.status}) during access token issuance: ${responseText || response.statusText}`
        );
      }
    }

    const data: CognifitAccessTokenResponse = JSON.parse(responseText);

    if (data.access_token) {
      console.log("Successfully obtained access_token from Cognitive Gym.");
      return data.access_token;
    } else {
      console.error("Cognitive Gym API did not return an access_token in a successful response:", data);
      throw new Error(
        `Cognitive Gym access token issuance successful but no access_token received: ${data.errorMessage || data.error || "Unknown issue."}`
      );
    }
  } catch (error) {
    console.error("Error during Cognitive Gym access token service call:", error);
     if (error instanceof Error) {
        if (error.message.startsWith("Cognitive Gym API error") || error.message.startsWith("Cognitive Gym access token issuance successful but no access_token received") || error.message.startsWith("Cognitive Gym API client ID or secret is not configured") || error.message.startsWith("User token is missing")) {
            throw error;
        }
        throw new Error(`Failed to process Cognitive Gym access token issuance: ${error.message}`);
    }
    throw new Error("An unknown error occurred during Cognitive Gym access token processing.");
  }
}

/**
 * Fetches the current version of the Cognitive Gym HTML5 SDK.
 */
export async function getCognifitSDKVersion(): Promise<string> {
    const COGNITFIT_API_BASE_URL = process.env.cognifit_api_base_url || "https://api.cognifit.com";
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
            if (typeof jsonData === 'string' && /^\d+\.\d+\.\d+.*$/.test(jsonData.trim())) {
                return jsonData.trim();
            }
        } catch (e) {
            // Not JSON, or JSON parsing failed.
        }
        
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
