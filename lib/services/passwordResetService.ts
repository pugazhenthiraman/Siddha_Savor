import { prisma } from '@/lib/prisma';

export class PasswordResetService {
  /**
   * Clean up expired password reset tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.passwordReset.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isUsed: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Remove used tokens older than 24h
          ],
        },
      });
      
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
      return 0;
    }
  }

  /**
   * Get reset statistics for admin dashboard
   */
  static async getResetStats() {
    try {
      const [total, active, used, expired] = await Promise.all([
        prisma.passwordReset.count(),
        prisma.passwordReset.count({
          where: {
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
        }),
        prisma.passwordReset.count({
          where: { isUsed: true },
        }),
        prisma.passwordReset.count({
          where: {
            isUsed: false,
            expiresAt: { lt: new Date() },
          },
        }),
      ]);

      return { total, active, used, expired };
    } catch (error) {
      console.error('Failed to get reset stats:', error);
      return { total: 0, active: 0, used: 0, expired: 0 };
    }
  }

  /**
   * Validate reset token and code
   */
  static async validateResetRequest(email: string, code: string) {
    try {
      const resetRequest = await prisma.passwordReset.findFirst({
        where: {
          email,
          code,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
      });

      return !!resetRequest;
    } catch (error) {
      console.error('Failed to validate reset request:', error);
      return false;
    }
  }
}
