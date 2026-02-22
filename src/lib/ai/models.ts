import { google } from "@ai-sdk/google";

export function getModel() {
  return google("gemini-2.0-flash");
}
