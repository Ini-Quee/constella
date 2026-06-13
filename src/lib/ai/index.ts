import { mockProvider } from "./mockProvider";
import { azureProvider, azureConfigured } from "./azureProvider";
import type { AIProvider } from "./adapter";

/** Auto-switches: mock today, Azure tomorrow the moment .env is filled. */
export const provider: AIProvider = azureConfigured() ? azureProvider : mockProvider;
export type { GroundedChunk, AIProvider, TutorContext } from "./adapter";
