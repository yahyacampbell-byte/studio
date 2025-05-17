
// src/app/api/cognifit-webhook/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Handles incoming webhooks from CogniFit.
 *
 * CogniFit will send POST requests to this endpoint when certain events occur.
 *
 * Security Note: In a production environment, you MUST verify the webhook signature
 * or use a shared secret to ensure the request genuinely comes from CogniFit.
 * CogniFit's documentation should provide details on how to do this.
 * For now, this example focuses on receiving and logging the payload.
 */
export async function POST(request: NextRequest) {
  console.log('CogniFit Webhook: Received a POST request');

  try {
    // TODO: Implement webhook signature verification here if CogniFit provides one.
    // Example (conceptual - refer to CogniFit docs for actual implementation):
    // const signature = request.headers.get('X-CogniFit-Signature');
    // const bodyText = await request.text(); // Need raw body for signature verification
    // if (!isValidSignature(bodyText, signature, YOUR_COGNIFIT_WEBHOOK_SECRET)) {
    //   console.warn('CogniFit Webhook: Invalid signature');
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    // const payload = JSON.parse(bodyText); // Parse after verification

    // If not verifying signature now, parse JSON directly (less secure for production)
    const payload = await request.json();
    console.log('CogniFit Webhook Payload:', JSON.stringify(payload, null, 2));

    // --- TODO: Implement your logic based on the webhook payload ---
    // For example, you might check `payload.event` to determine the type of event
    // and then update your database, send notifications, etc.
    //
    // Example event types from your previous input:
    // - "SESSION_COMPLETE"
    // - "RISK_ALERT"
    // - "BATTERY_FINISHED"
    // - "LICENSE_EXPIRING"
    // - "CLINICAL_ALERT" (from webhook example in previous prompt)

    // Example processing based on payload:
    // if (payload.event === "SESSION_COMPLETE") {
    //   const userId = payload.userId; // Or however user is identified in payload
    //   const gameId = payload.game?.id || payload.gameId || payload.key;
    //   const sessionId = payload.sessionId;
    //   // ... process session completion, update user activity, etc. ...
    //   console.log(`Webhook: User ${userId} completed session ${sessionId} for game ${gameId}`);
    // } else if (payload.event === "CLINICAL_ALERT") {
    //   const userId = payload.userId;
    //   const message = payload.message;
    //   // ... handle clinical alert ...
    //   console.log(`Webhook: Clinical alert for user ${userId}: ${message}`);
    // }

    // Respond to CogniFit to acknowledge receipt
    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });
  } catch (error) {
    console.error('CogniFit Webhook Error:', error);
    if (error instanceof SyntaxError) {
      // This happens if the request body is not valid JSON
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    // General server error
    return NextResponse.json({ error: 'Internal Server Error processing webhook' }, { status: 500 });
  }
}

// Optional: GET handler for testing or if CogniFit requires endpoint verification via GET
export async function GET() {
  console.log('CogniFit Webhook: Received a GET request');
  return NextResponse.json({ message: 'CogniFit Webhook endpoint is active. Use POST for events.' }, { status: 200 });
}
