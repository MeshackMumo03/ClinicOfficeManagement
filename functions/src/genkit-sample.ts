
import {genkit, z} from "genkit";
import {googleAI} from "@genkit-ai/google-genai";
import { onCallGenkit } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";
import {enableFirebaseTelemetry} from "@genkit-ai/firebase";

enableFirebaseTelemetry();

const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-1.5-flash-latest'
});

const exampleFlow = ai.defineFlow({
    name: "exampleFlow",
    inputSchema: z.string().describe("A subject for a joke"),
    outputSchema: z.string(),
  }, async (subject) => {
    const prompt =
      `Tell me a joke about ${subject}.`;
    const llmResponse = await ai.generate({
        prompt: prompt,
    });
    return llmResponse.text;
  }
);

export const example = onCallGenkit({
  secrets: [apiKey],
}, exampleFlow);
