"use server"

import { generateText } from "ai"

import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createVertex } from "@ai-sdk/google-vertex"
import { createMistral } from "@ai-sdk/mistral"
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock"
import { createCohere } from "@ai-sdk/cohere"
import { createXai } from '@ai-sdk/xai';

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
      case "Google Vertex AI":
        aiModel = createVertex({ apiKey: configToken })("gemini-1.5-flash");
        break;
      case "Mistral":
        aiModel = createMistral({ apiKey: configToken })("ministral-3b-latest");
        break;
      case "Amazon Bedrock":
        aiModel = createAmazonBedrock({ apiKey: configToken })("us.meta.llama3-2-1b-instruct-v1:0");
        break;
      case "Cohere":
        aiModel = createCohere({ apiKey: configToken })("command-r7b-12-2024");
        break;
      case "Groq":
        aiModel = createXai({ apiKey: configToken })('grok-3-mini');
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
