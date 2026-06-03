import { Router } from 'express';
import { LicenseService } from '../services/license.service';

export function createLicenseRoutes() {
  const router = Router();
  
  router.get('/status', async (req, res) => {
    const status = await LicenseService.validateCurrentLicense();
    res.json(status);
  });
  
  router.get('/hardware-id', (req, res) => {
    const hwid = LicenseService.getHardwareId();
    res.json({ hardwareId: hwid });
  });
  
  router.post('/activate', (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'License key token is required.' });
    }
  
    const result = LicenseService.activateLicense(token);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ error: result.message });
    }
  });
  return router;
}
