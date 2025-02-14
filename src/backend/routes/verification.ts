import { Router } from 'express';
import { db } from '../db';
import { verificationLogs } from '../schema';

const router = Router();

router.post('/verify', async (req, res) => {
    try {
        const log = await db.insert(verificationLogs).values({
            product_id: req.body.productId,
            status: req.body.status,
            details: req.body.details
        }).returning();
        
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to log verification' });
    }
});

export default router; 