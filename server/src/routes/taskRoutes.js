import { Router } from "express";
import { getBoard, addTask, editTask, moveTaskHandler, removeTask, getStats } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/board", getBoard);
router.get("/stats", getStats);
router.post("/tasks", addTask);
router.patch("/tasks/:id", editTask);
router.patch("/tasks/:id/move", moveTaskHandler);
router.delete("/tasks/:id", removeTask);

export default router;