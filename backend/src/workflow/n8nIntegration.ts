// backend/src/workflow/n8nIntegration.ts
import fetch from "node-fetch";

/**
 * Triggers an n8n workflow for further processing.
 * Useful for uncertain classifications or manual review.
 *
 * @param product - The product object.
 */
export async function triggerN8nWorkflow(product: any): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("N8N_WEBHOOK_URL not set; skipping workflow trigger.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });
    if (!response.ok) {
      console.error("Failed to trigger n8n workflow:", await response.text());
    } else {
      console.log("n8n workflow triggered for product:", product.asin);
    }
  } catch (error) {
    console.error("Error triggering n8n workflow:", error);
  }
}
