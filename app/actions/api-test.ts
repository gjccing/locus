"use server"

import { generateText } from "ai"

import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"

export async function testApiKey(providerName: string, configToken: string) {
  try {
    let aiModel;
    switch (providerName) {
      case "OpenAI":
        aiModel = createOpenAI({ apiKey: configToken })("gpt-5-mini");
        break;
      case "Anthropic":
        aiModel = createAnthropic({ apiKey: configToken })("claude-3-haiku-20240307");
        break;
      case "Gemini":
        aiModel = createGoogleGenerativeAI({ apiKey: configToken })("gemini-flash-lite-latest");
        break;
      case "Groq":
        aiModel = createGroq({ apiKey: configToken })("llama-3.1-8b-instant");
        break;
      default:
        return { success: false, error: `Unsupported provider for testing: ${providerName}` };
    }

    if (!aiModel) {
      return { success: false, error: `Could not create model for ${providerName}` }
    }

    const { text } = await generateText({
      model: aiModel,
      prompt: "Hello, world!",
      maxRetries: 0,
    });

    return { success: true, text };
  } catch (err: unknown) {
    console.error("Error testing API key:", err);
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: "An unknown error occurred" }
  }
}
