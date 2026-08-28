import { Router } from "express";
import authRoutes from "./authRoutes.js";
import taskRoutes from "./taskRoutes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/", taskRoutes);

export default router;