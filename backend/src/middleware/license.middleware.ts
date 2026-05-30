import { Request, Response, NextFunction } from 'express';
import { LicenseService } from '../services/license.service';

export const requireLicense = async (req: Request, res: Response, next: NextFunction) => {
  // Allow read-only paths if desired, or block entirely.
  // We'll block all protected routes (mutations and sensitive reads)
  // But allow /api/auth and /api/license
  
  if (req.path.startsWith('/auth/') || req.path.startsWith('/license/')) {
    return next();
  }

  const status = await LicenseService.validateCurrentLicense();
  
  if (!status.isValid) {
    return res.status(402).json({
      error: 'Payment Required',
      code: 'LICENSE_REQUIRED',
      message: status.message,
      licenseStatus: status
    });
  }

  // Attach license status to request if needed by downstream controllers
  (req as any).licenseStatus = status;

  next();
};
