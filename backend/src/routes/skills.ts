import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const skillsRouter = Router();

const DEFAULT_SKILLS = [
  {
    category: "業務スキル",
    items: ["接客・電話応対", "小型旋盤操作", "図面読解（μ単位）", "検査機器操作", "3D CAD / PowerBI", "Word / Excel / Access / PowerPoint", "経理・契約業務", "情報セキュリティ知識", "医療・リハビリ知識"],
    order: 1,
  },
  {
    category: "その他スキル",
    items: ["栄養知識", "楽器演奏（ピアノ・打楽器・サックス）", "アカペラ編曲・譜面作成", "英語対応（通訳・翻訳）"],
    order: 2,
  },
  {
    category: "資格",
    items: ["普通自動車免許（AT限定）", "書道初段", "実用英語技能検定2級"],
    order: 3,
  },
];

/**
 * GET /api/skills
 * スキル一覧を取得する（公開API）
 */
skillsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    let skills = await prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
    });

    if (skills.length === 0) {
      await prisma.skillCategory.createMany({ data: DEFAULT_SKILLS });
      skills = await prisma.skillCategory.findMany({ orderBy: { order: "asc" } });
    }

    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
