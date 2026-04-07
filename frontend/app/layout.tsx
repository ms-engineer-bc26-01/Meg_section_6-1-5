import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-jp",
});

export const metadata: Metadata = {
  title: "名取めぐみ | Portfolio",
  description:
    "名取めぐみのポートフォリオサイトです。実績・スキル・お問い合わせ情報をご確認いただけます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${notoSerifJP.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
