import { Router, Request, Response } from "express";
import { auth } from "../lib/firebaseAdmin";

export const authRouter = Router();

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5日間

/**
 * POST /api/auth/session
 * Firebaseのidトークンを受け取り、セッションCookieを発行する
 */
authRouter.post("/session", async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken: string };

  if (!idToken) {
    res.status(400).json({ error: "idToken is required" });
    return;
  }

  try {
    // セッションCookieを生成（有効期限5日）
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    res.cookie("session", sessionCookie, {
      maxAge: SESSION_DURATION_MS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ status: "ok" });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

/**
 * POST /api/auth/logout
 * セッションCookieを削除してログアウト
 */
authRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("session");
  res.json({ status: "ok" });
});
