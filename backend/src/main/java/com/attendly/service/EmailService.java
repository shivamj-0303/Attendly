package com.attendly.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

  private final GmailApiService gmailApiService;

  public void sendOtpEmail(String to, String name, String otpCode, String purpose) {
    String subject = "Attendly - Your OTP Code";
    String htmlContent = formatOtpEmail(name, otpCode, purpose);
    
    try {
      gmailApiService.sendEmail(to, subject, htmlContent);
      log.info("✅ OTP email sent successfully to: {}", to);
    } catch (Exception e) {
      log.error("❌ Failed to send OTP email to: {}", to, e);
      throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
    }
  }

  private String formatOtpEmail(String name, String otpCode, String purpose) {
    return String.format(
        """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Attendly</h1>
                    <p>College Attendance Management System</p>
                </div>
                <div class="content">
                    <h2>Hello %s,</h2>
                    <p>You requested a One-Time Password (OTP) for <strong>%s</strong>.</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; color: #6b7280;">Your OTP Code:</p>
                        <div class="otp-code">%s</div>
                        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Valid for 10 minutes</p>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul style="margin: 10px 0 0 0;">
                            <li>Never share this OTP with anyone</li>
                            <li>Attendly staff will never ask for your OTP</li>
                            <li>This OTP will expire in 10 minutes</li>
                        </ul>
                    </div>
                    
                    <p>If you didn't request this OTP, please ignore this email or contact support if you have concerns.</p>
                    
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>Team Attendly</strong>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>&copy; 2026 Attendly. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """,
        name, getPurposeText(purpose), otpCode);
  }

  private String getPurposeText(String purpose) {
    return switch (purpose) {
      case "PASSWORD_RESET" -> "Password Reset";
      case "PHONE_VERIFICATION" -> "Phone Verification";
      default -> "Account Verification";
    };
  }
}
