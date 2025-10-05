import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendResetEmail(toEmail, resetLink) {
  const info = await transporter.sendMail({
    from: `"LostFinder" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "LostFinder 비밀번호 재설정",
    text: `아래 링크를 눌러 비밀번호를 재설정하세요. (유효시간 1시간)\n\n${resetLink}`,
    html: `
      <p>아래 버튼을 눌러 비밀번호를 재설정하세요. (유효시간 1시간)</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">비밀번호 재설정</a></p>
      <p>또는 링크를 복사해 브라우저에 붙여넣기: <br/>${resetLink}</p>
    `
  });
  return info.messageId;
}
