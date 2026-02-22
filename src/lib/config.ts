export const APP_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  siteName: "Soulful Connections",
  siteDescription:
    "A safe space for meaningful conversations. Find companionship, comfort, and support through AI-powered interaction.",
  themeColor: "#5F9EA0",
} as const;

export const CRISIS_KEYWORDS = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "self-harm",
  "self harm",
  "cutting myself",
  "hurt myself",
  "no reason to live",
  "better off dead",
  "don't want to be alive",
  "can't go on",
] as const;

export const CRISIS_RESOURCES = [
  {
    name: "National Suicide Prevention Lifeline (US)",
    contact: "988",
    type: "call" as const,
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    type: "text" as const,
  },
  {
    name: "International Association for Suicide Prevention",
    contact: "https://www.iasp.info/resources/Crisis_Centres/",
    type: "link" as const,
  },
] as const;
