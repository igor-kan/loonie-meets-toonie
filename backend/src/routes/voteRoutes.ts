// backend/src/routes/voteRoutes.ts
import { Router } from "express";
import { createVote, getVotesForProduct } from "../controllers/voteController";

const router = Router();

router.get("/:productId", getVotesForProduct);
router.post("/", createVote);

export default router;
