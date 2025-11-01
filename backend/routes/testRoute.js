import express from "express";
const router = express.Router();
router.get("/test", (req, res) => res.json({ message: "Backend running fine" }));
export default router;
