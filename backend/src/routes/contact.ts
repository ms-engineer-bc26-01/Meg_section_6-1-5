import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { sendContactNotification } from "../lib/mailer";

export const contactRouter = Router();

/**
 * POST /api/contact
 * お問い合わせフォームの送信を受け付ける
 */
contactRouter.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("お名前を入力してください"),
    body("email").isEmail().withMessage("正しいメールアドレスを入力してください"),
    body("subject").trim().notEmpty().withMessage("件名を入力してください"),
    body("message").trim().isLength({ min: 10 }).withMessage("メッセージは10文字以上入力してください"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, subject, message } = req.body as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    try {
      const contact = await prisma.contact.create({
        data: { name, email, subject, message },
      });

      // メール通知（失敗してもレスポンスはブロックしない）
      try {
        await sendContactNotification({ name, email, subject, message });
      } catch (mailErr) {
        console.error("[mailer] Failed to send notification email:", mailErr);
      }

      res.status(201).json({ id: contact.id, message: "お問い合わせを受け付けました。" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
