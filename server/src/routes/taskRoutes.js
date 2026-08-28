import { Router } from "express";
import { getBoard, addTask, editTask, moveTaskHandler, removeTask } from "../controllers/taskController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Every route below requires a valid JWT.
router.use(requireAuth);

router.get("/board", getBoard);
router.post("/tasks", addTask);
router.patch("/tasks/:id", editTask);
router.patch("/tasks/:id/move", moveTaskHandler);
router.delete("/tasks/:id", removeTask);

export default router;