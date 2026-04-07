import { Router, Request, Response } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { verifyFirebaseToken } from "../middleware/firebaseAuth";

export const adminRouter = Router();

// 全管理APIにFirebase認証ミドルウェアを適用
adminRouter.use(verifyFirebaseToken);

// 画像はメモリに一時保存（DBに格納するため）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB制限
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("画像ファイルのみアップロード可能です"));
    }
  },
});

/**
 * PUT /api/admin/profile
 * プロフィール情報を更新する（管理者のみ）
 */
adminRouter.put("/profile", async (req: Request, res: Response) => {
  const { name, nameEn, birthDate, birthPlace, bio } = req.body as {
    name: string;
    nameEn: string;
    birthDate: string;
    birthPlace: string;
    bio: string;
  };

  try {
    const profile = await prisma.profile.upsert({
      where: { id: 1 },
      update: { name, nameEn, birthDate, birthPlace, bio },
      create: { id: 1, name, nameEn, birthDate, birthPlace, bio },
    });

    res.json({ message: "プロフィールを更新しました。", id: profile.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/admin/profile/image
 * プロフィール画像をアップロードしてDBに保存する（管理者のみ）
 */
adminRouter.post(
  "/profile/image",
  upload.single("image"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "画像ファイルが必要です" });
      return;
    }

    try {
      await prisma.profile.upsert({
        where: { id: 1 },
        update: {
          imageData: req.file.buffer,
          imageMime: req.file.mimetype,
        },
        create: {
          id: 1,
          imageData: req.file.buffer,
          imageMime: req.file.mimetype,
        },
      });

      res.json({ message: "画像をアップロードしました。" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/admin/contacts
 * お問い合わせ一覧を取得する（管理者のみ）
 */
adminRouter.get("/contacts", async (_req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/admin/contacts/:id/read
 * お問い合わせを既読にする（管理者のみ）
 */
adminRouter.patch("/contacts/:id/read", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.contact.update({
      where: { id },
      data: { read: true },
    });
    res.json({ message: "既読にしました。" });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// ─── 実績 CRUD ───────────────────────────────────────────────

/**
 * POST /api/admin/achievements
 * 実績を新規作成する（管理者のみ）
 */
adminRouter.post("/achievements", async (req: Request, res: Response) => {
  const { company, roles, note, order } = req.body as {
    company: string;
    roles: string[];
    note?: string;
    order?: number;
  };
  try {
    const achievement = await prisma.achievement.create({
      data: { company, roles, note, order: order ?? 0 },
    });
    res.status(201).json(achievement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/admin/achievements/:id
 * 実績を更新する（管理者のみ）
 */
adminRouter.put("/achievements/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { company, roles, note, order } = req.body as {
    company?: string;
    roles?: string[];
    note?: string;
    order?: number;
  };
  try {
    const achievement = await prisma.achievement.update({
      where: { id },
      data: { company, roles, note, order },
    });
    res.json(achievement);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

/**
 * DELETE /api/admin/achievements/:id
 * 実績を削除する（管理者のみ）
 */
adminRouter.delete("/achievements/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.achievement.delete({ where: { id } });
    res.json({ message: "削除しました。" });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// ─── スキル CRUD ──────────────────────────────────────────────

/**
 * POST /api/admin/skills
 * スキルカテゴリを新規作成する（管理者のみ）
 */
adminRouter.post("/skills", async (req: Request, res: Response) => {
  const { category, items, order } = req.body as {
    category: string;
    items: string[];
    order?: number;
  };
  try {
    const skill = await prisma.skillCategory.create({
      data: { category, items, order: order ?? 0 },
    });
    res.status(201).json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/admin/skills/:id
 * スキルカテゴリを更新する（管理者のみ）
 */
adminRouter.put("/skills/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category, items, order } = req.body as {
    category?: string;
    items?: string[];
    order?: number;
  };
  try {
    const skill = await prisma.skillCategory.update({
      where: { id },
      data: { category, items, order },
    });
    res.json(skill);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

/**
 * DELETE /api/admin/skills/:id
 * スキルカテゴリを削除する（管理者のみ）
 */
adminRouter.delete("/skills/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.skillCategory.delete({ where: { id } });
    res.json({ message: "削除しました。" });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});
