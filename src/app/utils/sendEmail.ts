export const sendEmail = async (
  email: string,
  resetPasswordLink?: string,
  verificationLink?: string
): Promise<void> => {
  try {
    // TODO: Implement actual email sending using nodemailer or other service
    console.log(`Email would be sent to: ${email}`);
    if (resetPasswordLink) {
      console.log(`Reset Password Link: ${resetPasswordLink}`);
    }
    if (verificationLink) {
      console.log(`Verification Link: ${verificationLink}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
