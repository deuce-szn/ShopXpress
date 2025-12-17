import nodemailer from "nodemailer";
// 🧩 ID Generator
function IdGenerator() {
  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${timestamp}${rand}`;
}

// 🧩 Beautiful Email Template Generator
function getWelcomeEmailTemplate(name, userId) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Hydot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -1px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
        }
        
        .content {
            padding: 40px 30px;
            color: #333;
        }
        
        .greeting {
            font-size: 20px;
            margin-bottom: 20px;
            color: #2d3748;
            font-weight: 500;
        }
        
        .message {
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 30px;
            font-size: 16px;
        }
        
        .user-info {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .info-item {
            margin: 10px 0;
            display: flex;
            align-items: center;
        }
        
        .info-label {
            font-weight: 600;
            color: #2d3748;
            min-width: 120px;
        }
        
        .info-value {
            color: #4a5568;
            padding: 6px 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            flex: 1;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .feature {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .feature-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .feature-desc {
            color: #718096;
            font-size: 14px;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-links {
            margin-top: 15px;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .copyright {
            margin-top: 20px;
            font-size: 12px;
            color: #a0aec0;
        }
        
        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">HYDOT</div>
            <h1>Welcome Aboard! 🚀</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Hello ${name},</p>
            
            <p class="message">
                Thank you for joining Hydot! We're excited to have you on board. 
                Your account has been successfully created and you're now ready 
                to explore all the amazing features we have to offer.
            </p>
            
            <div class="user-info">
                <div class="info-item">
                    <span class="info-label">Your Name:</span>
                    <span class="info-value">${name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">User ID:</span>
                    <span class="info-value">${userId}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="color: #38a169; background: #f0fff4;">Active ✅</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.APP_URL || 'https://your-app.com'}" class="cta-button">
                    Get Started with Hydot
                </a>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📝</div>
                    <div class="feature-title">Create Articles</div>
                    <div class="feature-desc">Share your knowledge and insights with our community</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <div class="feature-title">Connect with Others</div>
                    <div class="feature-desc">Build your network and collaborate</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <div class="feature-title">Premium Features</div>
                    <div class="feature-desc">Unlock advanced tools as you grow</div>
                </div>
            </div>
            
            <p class="message">
                If you have any questions or need assistance, feel free to reply to this email 
                or visit our <a href="${process.env.SUPPORT_URL || '#'}" style="color: #667eea; text-decoration: none;">help center</a>.
            </p>
            
            <p class="message" style="font-style: italic;">
                Best regards,<br>
                The Hydot Team
            </p>
        </div>
        
        <div class="footer">
            <p>Hydot Inc. · Making content creation effortless</p>
            <div class="footer-links">
                <a href="${process.env.APP_URL || '#'}/privacy">Privacy Policy</a>
                <a href="${process.env.APP_URL || '#'}/terms">Terms of Service</a>
                <a href="${process.env.APP_URL || '#'}/contact">Contact Us</a>
            </div>
            <div class="copyright">
                © ${new Date().getFullYear()} Hydot. All rights reserved.<br>
                This is an automated message, please do not reply directly.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// 🧩 Email Sender with HTML
async function sendEmail(to, subject, htmlContent, textContent = "") {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Hydot System" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text: textContent || subject,
      html: htmlContent,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
}

export { IdGenerator, getWelcomeEmailTemplate, sendEmail };