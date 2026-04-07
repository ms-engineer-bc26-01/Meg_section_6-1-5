import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { profileRouter } from "./routes/profile";
import { achievementsRouter } from "./routes/achievements";
import { skillsRouter } from "./routes/skills";
import { contactRouter } from "./routes/contact";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ミドルウェア
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ルート
app.use("/api/profile", profileRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// ヘルスチェック
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

export default app;
