import { NextRequest, NextResponse } from "next/server";

/**
 * お問い合わせフォームのプロキシルート
 * フロントエンドのサーバー機能を経由してバックエンドにリクエストを転送する
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

  try {
    const response = await fetch(`${backendUrl}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "バックエンドへの接続に失敗しました" },
      { status: 500 }
    );
  }
}
