import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface WritingSuggestion {
  type: "clarity" | "grammar" | "structure" | "seo";
  original: string;
  suggestion: string;
  reason: string;
}

// Sends the current draft to Claude and asks for structured, actionable
// feedback. We ask for JSON so the frontend can render suggestions as
// individual cards instead of one wall of text.
export async function getWritingSuggestions(
  title: string,
  content: string
): Promise<WritingSuggestion[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system:
      "You review technical blog drafts. Return ONLY a JSON array of suggestion " +
      'objects, each shaped like {"type": "clarity"|"grammar"|"structure"|"seo", ' +
      '"original": string, "suggestion": string, "reason": string}. ' +
      "No preamble, no markdown fences, just the JSON array. Max 6 suggestions, " +
      "only flag things genuinely worth changing.",
    messages: [
      {
        role: "user",
        content: `Title: ${title}\n\nDraft:\n${content}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  try {
    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as WritingSuggestion[];
  } catch {
    // If Claude's output isn't valid JSON for some reason, fail soft
    // rather than crashing the editor.
    return [];
  }
}
