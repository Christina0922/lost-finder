import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

// 개발용 테스트 이메일 기능
function saveEmailToFile(toEmail, resetLink) {
  const emailContent = `
=== LostFinder 비밀번호 재설정 이메일 ===
받는 사람: ${toEmail}
발송 시간: ${new Date().toLocaleString('ko-KR')}

제목: LostFinder 비밀번호 재설정

내용:
아래 링크를 눌러 비밀번호를 재설정하세요. (유효시간 1시간)

${resetLink}

또는 브라우저에 직접 복사해서 붙여넣기:
${resetLink}

========================================
`;
  
  const emailDir = path.join(process.cwd(), 'test-emails');
  if (!fs.existsSync(emailDir)) {
    fs.mkdirSync(emailDir);
  }
  
  const filename = `reset-email-${Date.now()}.txt`;
  const filepath = path.join(emailDir, filename);
  fs.writeFileSync(filepath, emailContent);
  
  console.log(`\n📧 테스트 이메일이 저장되었습니다:`);
  console.log(`📁 파일 경로: ${filepath}`);
  console.log(`📧 받는 사람: ${toEmail}`);
  console.log(`🔗 재설정 링크: ${resetLink}\n`);
}

// 실제 SMTP 설정이 있으면 사용, 없으면 테스트 모드
const transporter = process.env.SMTP_USER && process.env.SMTP_PASS ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}) : null;

export async function sendResetEmail(toEmail, resetLink) {
  // SMTP 설정이 없으면 테스트 모드로 파일에 저장
  if (!transporter) {
    saveEmailToFile(toEmail, resetLink);
    return "test-email-saved";
  }

  try {
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
  } catch (error) {
    console.error("이메일 발송 실패:", error);
    // 실패해도 테스트 모드로 저장
    saveEmailToFile(toEmail, resetLink);
    return "test-email-saved-after-error";
  }
}