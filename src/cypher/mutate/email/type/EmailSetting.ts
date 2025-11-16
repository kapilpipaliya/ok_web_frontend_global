export interface EmailSetting {
  active?: string; // 'smtp', 'sendgrid', 'resend', etc. Empty means not configured
  fromEmail?: string;
  secure?: boolean;
  // SendGrid settings
  sendGridApiKey?: string;
  // Resend settings
  resendApiKey?: string;
  // SMTP settings
  smtpHost?: string;
  smtpPassword?: string;
  smtpPort?: number;
  smtpUsername?: string;

  [key: string]: unknown;
  // Add other provider settings as needed
}
