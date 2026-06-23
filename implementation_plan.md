# AI Financial Analysis Feature - Supabase Edge Function

## Goal
Convert the existing Gemini-based financial analysis in `AISettings.tsx` to use a Supabase Edge Function with OpenAI, as specified by the user. This moves the API key and model logic to the server side for better security and control.

## User Review Required

The user's code snippet uses **OpenAI** (`gpt-4.1-mini`), but the current frontend uses **Gemini** (`gemini-2.5-flash`). The plan assumes switching to OpenAI via the Edge Function as requested.

The user's `.env` file contains `VITE_GEMINI_API_KEY` but NOT an `OPENAI_API_KEY`. We will need to add `OPENAI_API_KEY` to the Supabase Edge Function secrets.

## Open Questions

1. **Edge Function Name**: The user's code doesn't specify a name. I'll use `financial-analysis` (standard convention).
2. **Deployment**: Does the user want me to write the code locally, or also deploy it using `supabase functions deploy`? (I will write the code locally in `supabase/functions/financial-analysis/index.ts`).

## Proposed Changes

### 1. Supabase Edge Function

Create a new Edge Function `financial-analysis` that:
- Fetches transactions from Supabase using the service role key
- Calculates monthly totals (income, expense)
- Sends the data to OpenAI (`gpt-4.1-mini`) for analysis
- Returns the AI response to the frontend

#### [NEW] `supabase/functions/financial-analysis/index.ts`
- Contains the Deno/Express logic provided by the user (adapted for standard Edge Function structure without `express` dependency since Edge Functions are request/response based).

### 2. Frontend Update

Modify `AISettings.tsx` to:
- Call the new Supabase Edge Function using `supabase.functions.invoke('financial-analysis')`
- Remove the direct Gemini API call logic
- Update the UI to reflect the new analysis source

#### [MODIFY] `src/pages/AISettings.tsx`
- Replace `fetch(...)` to Gemini with `supabase.functions.invoke('financial-analysis')`
- Update error handling and loading states

## Verification Plan

1.  **Code Review**: Ensure the Edge Function structure is correct for Deno.
2.  **Frontend Test**: Verify the UI button triggers the function and displays results.

### Manual Verification
- User deploys the function: `supabase functions deploy financial-analysis --no-verify-jwt`
- User sets the secret: `supabase secrets set OPENAI_API_KEY=sk-...`
- User tests the "Analyze" button in the app.
