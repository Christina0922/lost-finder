import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { db } from "./db.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true
  })
);

// 헬스체크
app.get("/health", (_req, res) => res.json({ ok: true }));

// 인증 관련 라우트
app.use("/auth", authRoutes);

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`LostFinder server listening on port ${PORT}`);
});
