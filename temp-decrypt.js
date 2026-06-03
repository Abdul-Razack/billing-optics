const { app, safeStorage } = require('electron');
const fs = require('fs');
app.whenReady().then(() => {
  try {
    const config = JSON.parse(fs.readFileSync(require('os').homedir() + '/.config/Billing Optics ERP/config.json', 'utf8'));
    if (safeStorage.isEncryptionAvailable()) {
      const pwd = safeStorage.decryptString(Buffer.from(config.password, 'base64'));
      console.log("DB_NAME=" + config.database);
      console.log("PASSCODE=" + pwd);
    } else {
      console.log("Encryption not available.");
    }
  } catch (err) {
    console.error(err);
  }
  app.quit();
});
