import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const profileRouter = Router();

/**
 * GET /api/profile
 * プロフィール情報を取得する（公開API）
 */
profileRouter.get("/", async (_req: Request, res: Response) => {
  try {
    let profile = await prisma.profile.findFirst({ where: { id: 1 } });

    // 初回アクセス時はデフォルトデータを作成
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: 1,
          name: "名取めぐみ",
          nameEn: "Megumi Natori",
          birthDate: "1976年2月16日",
          birthPlace: "山梨県北杜市",
          bio: `年子の姉・6学年差の双子の弟の4人姉弟の中で唯一、血液型/生まれた場所/高校/身長が全く異なる。
病弱で反抗期も激しく、母親から問題児扱いされる10代を過ごす。
学費を自力で賄うため無理な生活を送り倒れる → 危篤 → 休学。
復学直前に家業の工場が全焼し、東京から帰郷。就職氷河期の中で社会人デビュー。`,
        },
      });
    }

    // 画像URLのみ返す（バイナリは除外）
    const imageUrl = profile.imageData
      ? `/api/profile/image`
      : null;

    res.json({
      name: profile.name,
      nameEn: profile.nameEn,
      birthDate: profile.birthDate,
      birthPlace: profile.birthPlace,
      bio: profile.bio,
      imageUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/profile/image
 * プロフィール画像を返す
 */
profileRouter.get("/image", async (_req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findFirst({
      where: { id: 1 },
      select: { imageData: true, imageMime: true },
    });

    if (!profile?.imageData) {
      res.status(404).end();
      return;
    }

    res.set("Content-Type", profile.imageMime ?? "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(profile.imageData);
  } catch {
    res.status(500).end();
  }
});
