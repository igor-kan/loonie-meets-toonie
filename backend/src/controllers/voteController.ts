// backend/src/controllers/voteController.ts
import { Request, Response } from "express";
import { voteSchema } from "../../db/schema";

// In-memory store for votes (replace with DB queries)
const votes: any[] = [];
  
/**
 * POST /api/votes
 */
export const createVote = (req: Request, res: Response) => {
  try {
    const parsedVote = voteSchema.parse(req.body);
    votes.push(parsedVote);
    res.status(201).json(parsedVote);
  } catch (error: any) {
    res.status(400).json({ error: error.errors });
  }
};

/**
 * GET /api/votes/:productId
 */
export const getVotesForProduct = (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId, 10);
  const productVotes = votes.filter((vote) => vote.productId === productId);
  res.json(productVotes);
};
