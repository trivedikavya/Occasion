/**
 * Sentinel the assistant stream route appends after the human-readable reply,
 * followed by a JSON-encoded AssistantPayload. Uses a NUL byte so it can
 * never collide with real model output. Shared between the API route and
 * the client-side stream reader.
 */
export const PROPOSALS_SENTINEL = "\u0000OCCASION_PROPOSALS\u0000";
