// backend/src/ai/aiAgent.ts
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import dotenv from 'dotenv';

dotenv.config();

/**
 * In-memory cache to avoid re-calling the AI model for the same description.
 * This is a simple example; for production use, consider a more robust caching layer.
 */
const cache: Record<string, number> = {};

/**
 * classifyProduct uses LangChain.js to compute a "Canadian score" for a given product description.
 *
 * The function builds a prompt that instructs the AI to analyze the product description and respond with
 * a single integer between 0 and 100, where:
 *   - 0 indicates the product is not Canadian at all,
 *   - 50 indicates it is moderately Canadian,
 *   - 100 indicates it is fully Canadian-made.
 *
 * @param productDescription - The text description of the product.
 * @returns A promise that resolves to a number (0 to 100) representing the product's "Canadian score."
 */
export async function classifyProduct(productDescription: string): Promise<number> {
  // Check cache first.
  if (cache[productDescription]) {
    console.log("Returning cached score for product description.");
    return cache[productDescription];
  }

  // Ensure the OpenAI API key is provided.
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set in environment");
  }

  // Initialize the OpenAI model via LangChain.
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.0, // Deterministic output
    modelName: "gpt-4"
  });

  // Define a prompt template that instructs the AI how to classify the product.
  const template = `
You are an expert product classifier.
Based on the product description below, determine how strongly this product qualifies as "Made in Canada".
Consider factors such as manufacturing location, brand details, and textual clues.
Respond with a single integer between 0 and 100, where:
  • 0 means "Not Canadian at all"
  • 50 means "Somewhat Canadian"
  • 100 means "Fully Canadian-made"
  
Product Description:
{productDescription}

Output only the integer.
  `;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ["productDescription"]
  });

  // Build the chain using the prompt template.
  const chain = RunnableSequence.from([
    prompt,
    model
  ]);

  try {
    // Call the chain with the product description.
    const response = await chain.invoke({ productDescription });
    console.log("AI Agent response:", response);

    // Trim and parse the response into an integer.
    const scoreText = response.trim();
    const score = parseInt(scoreText, 10);
    const finalScore = isNaN(score) ? 0 : score;
    
    // Cache the result.
    cache[productDescription] = finalScore;
    
    return finalScore;
  } catch (error) {
    console.error("Error during AI classification:", error);
    return 0;
  }
}

export class AIAgent {
  private model: OpenAI;
  private prompt: PromptTemplate;

  constructor() {
    this.model = new OpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.prompt = PromptTemplate.fromTemplate(
      `Analyze if this product is made in Canada:
      {productDescription}
      
      Rate from 0-100 how likely this product is made in Canada.
      Return only the number.`
    );
  }

  async analyzeProduct(description: string): Promise<number> {
    try {
      const chain = RunnableSequence.from([
        this.prompt,
        this.model
      ]);

      const response = await chain.invoke({
        productDescription: description
      });

      const score = parseInt(response.trim());
      return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error analyzing product:', error);
      return 0;
    }
  }
}
