import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/firebaseAdmin";

/**
 * Firebaseのトークンを検証する認証ミドルウェア
 * Authorization: Bearer <idToken> ヘッダーを検証する
 */
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    // 仕様: 未認証アクセスには404を返す
    res.status(404).end();
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    // デコードされたトークン情報をrequestに付与
    (req as Request & { user: typeof decodedToken }).user = decodedToken;
    next();
  } catch {
    // トークンが無効な場合も404を返す（仕様に準拠）
    res.status(404).end();
  }
}

/**
 * セッションCookieを検証する認証ミドルウェア
 * ブラウザからのリクエスト（セッションCookieを使用）に対して使用
 */
export async function verifySessionCookie(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionCookie = req.cookies?.session;

  if (!sessionCookie) {
    res.status(404).end();
    return;
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    (req as Request & { user: typeof decodedToken }).user = decodedToken;
    next();
  } catch {
    res.status(404).end();
  }
}
