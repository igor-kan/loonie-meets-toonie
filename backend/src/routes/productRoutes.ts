// backend/src/routes/productRoutes.ts
import { Router } from "express";
import { getProductByAsin, createProduct } from "../controllers/productController";

const router = Router();

router.get("/:asin", getProductByAsin);
router.post("/", createProduct);

export default router;
