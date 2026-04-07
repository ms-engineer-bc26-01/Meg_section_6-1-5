import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const achievementsRouter = Router();

const DEFAULT_ACHIEVEMENTS = [
  {
    company: "リゾートホテル（現 星野リゾート リゾナーレ八ヶ岳）",
    roles: ["電話交換手", "フロントバック（団体予約担当）", "会議・イベント対応", "レストラン・社員食堂（調理・接客補助）"],
    note: "部門を横断してマルチに対応。",
    order: 1,
  },
  {
    company: "精密部品製造・加工業",
    roles: ["部品加工・仕上げ", "図面読解・検品", "小型旋盤操作"],
    note: "家業で後継候補として勤務経験あり。",
    order: 2,
  },
  {
    company: "療養型医療施設",
    roles: ["看護助手（食事・入浴補助）", "リハビリ助手（送迎・訓練補助・機器対応）", "受付当直対応"],
    note: "患者の半数を単独対応するなど高い責任を担う。",
    order: 3,
  },
  {
    company: "半導体関連企業（IT部門）",
    roles: ["庶務代表（山梨エリア）", "基幹システム運用サポート", "経理・契約事務", "Accessによるデータ処理", "3D CAD教育システム開発サポート", "情報セキュリティ（ISO内部監査）"],
    note: "現在は4部署の庶務統括＋交通安全委員を兼務。",
    order: 4,
  },
];

/**
 * GET /api/achievements
 * 実績一覧を取得する（公開API）
 */
achievementsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    let achievements = await prisma.achievement.findMany({
      orderBy: { order: "asc" },
    });

    // 初回はデフォルトデータを投入
    if (achievements.length === 0) {
      await prisma.achievement.createMany({ data: DEFAULT_ACHIEVEMENTS });
      achievements = await prisma.achievement.findMany({ orderBy: { order: "asc" } });
    }

    res.json(achievements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
