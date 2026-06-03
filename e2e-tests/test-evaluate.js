const { _electron: electron } = require('@playwright/test');
(async () => {
  const electronApp = await electron.launch({ args: ['../desktop'] });
  try {
    await electronApp.evaluate(({ ipcMain }) => {
      return typeof ipcMain;
    });
    console.log("SUCCESS");
  } catch(e) {
    console.error(e);
  }
  await electronApp.close();
})();
