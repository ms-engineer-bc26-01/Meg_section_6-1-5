import { NextRequest, NextResponse } from "next/server";

/**
 * 管理画面へのアクセス制御
 * 仕様: 未認証ユーザが /admin 配下にアクセスした場合、404を返す
 * （GitHub / Notion の挙動に準拠）
 *
 * ※ ログインページ (/admin/login) はアクセス可能
 * ※ 認証状態の確認はクライアント側で行う（Firebaseトークンはブラウザのみ）
 *    → サーバー側でのCookieチェックは任意で追加可能
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login は除外（ログインページへのアクセスは許可）
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // /admin 配下へのアクセスの場合、Cookieでセッションをチェック
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session");

    // セッションCookieがなければ404を返す
    if (!sessionCookie?.value) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
