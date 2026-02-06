import { Router } from "express";
import FeedingController from "../controllers/FeedingController.js";

const router = Router();

router.post("/feedings", FeedingController.manualFeed);
router.get("/feedings", FeedingController.list);
router.delete("/feedings/:id", FeedingController.delete);
router.get("/feedings/:commandId", FeedingController.getByCommandId);

export default router;
