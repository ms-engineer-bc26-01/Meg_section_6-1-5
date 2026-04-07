import axios from "axios";
import { auth } from "./firebase";

/**
 * 認証済みリクエスト用のaxiosインスタンスを生成
 * Firebaseのトークンを自動でヘッダーに付与する
 */
export async function getAuthenticatedAxios() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
