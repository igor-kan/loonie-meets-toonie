// backend/src/controllers/productController.ts
import { Request, Response } from "express";
import { db } from "../db";
import { products } from "../db/schema";
import { classifyProduct } from "../ai/aiAgent";
import { triggerN8nWorkflow } from "../workflow/n8nIntegration";
import { eq } from "drizzle-orm";

/**
 * GET /api/products/:asin
 */
export const getProductByAsin = async (req: Request, res: Response) => {
  const { asin } = req.params;
  const [product] = await db.select()
    .from(products)
    .where(eq(products.upc, asin))
    .limit(1);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
};

/**
 * POST /api/products
 * Expects a payload with: asin, name, url, and productDescription.
 * Uses the productDescription to compute the Canadian score via the AI agent.
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate input without canadianScore (it will be generated)
    const parsedProduct = products
      .omit({ canadianScore: true })
      .parse(req.body);

    const { productDescription } = req.body;
    const canadianScore = await classifyProduct(productDescription || "");

    const product = { ...parsedProduct, canadianScore };
    products[parsedProduct.asin] = product;

    // Optionally, trigger an n8n workflow if the score is below a threshold
    if (canadianScore < 50) {
      await triggerN8nWorkflow(product);
    }

    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

// example of how to use the createProduct function
// export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const parsedProduct = products.omit({ canadianScore: true }).parse(req.body);
//     const { productDescription } = req.body;
//     const canadianScore = await classifyProduct(productDescription || "");
//     const product = { ...parsedProduct, canadianScore };
//     products[parsedProduct.asin] = product;

//     if (canadianScore < 50) {
//       await triggerN8nWorkflow(product);
//     }

//     res.status(201).json(product);
//   } catch (error: any) {
//     next(error);
//   }
// };