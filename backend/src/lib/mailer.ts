import nodemailer from "nodemailer";

export type ContactEmailData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * お問い合わせ受信時に管理者へ通知メールを送信する
 * SMTP環境変数が未設定の場合はスキップ（開発環境セーフ）
 */
export async function sendContactNotification(data: ContactEmailData): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    console.warn("[mailer] SMTP env vars not set, skipping email notification");
    return;
  }

  const port = Number(SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `[お問い合わせ] ${data.subject}`,
    text: [
      `お名前: ${data.name}`,
      `メール: ${data.email}`,
      `件名: ${data.subject}`,
      ``,
      data.message,
    ].join("\n"),
  });
}
