const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const step4 = document.getElementById('step-4');

  let companyData = {};
  let dbStatus = null; // 'installed' | 'not_installed'

  document.getElementById('quitBtn').addEventListener('click', () => {
    ipcRenderer.send('quit-app');
  });

  // Step 1 -> 2
  document.getElementById('companyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    companyData = {
      companyName: document.getElementById('companyName').value,
      ownerName: document.getElementById('ownerName').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value
    };

    step1.classList.remove('active');
    step2.classList.add('active');

    // Check Postgres status
    document.getElementById('db-detecting').classList.remove('hidden');
    document.getElementById('db-not-installed').classList.add('hidden');
    document.getElementById('db-config-form').classList.add('hidden');

    try {
      const discovery = await ipcRenderer.invoke('check-postgres');
      document.getElementById('db-detecting').classList.add('hidden');
      
      if (discovery.installed) {
        dbStatus = 'installed';
        document.getElementById('db-config-form').classList.remove('hidden');

        document.getElementById('discovery-version').innerText = discovery.version || 'Unknown';
        document.getElementById('discovery-port').innerText = discovery.port || 'Unknown';
        document.getElementById('discovery-status').innerText = discovery.running ? 'Running' : 'Stopped';

        if (discovery.port) {
          document.getElementById('dbPort').value = discovery.port;
        }

      } else {
        dbStatus = 'not_installed';
        document.getElementById('db-not-installed').classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
      // Fallback to auto-install
      document.getElementById('db-detecting').classList.add('hidden');
      document.getElementById('db-not-installed').classList.remove('hidden');
      dbStatus = 'not_installed';
    }
  });

  // Back from Step 2 Not Installed
  document.getElementById('backToStep1').addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
  });

  // Back from Step 2 Config
  document.getElementById('backToStep1FromConfig').addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
  });

  // Advanced Mode Toggle
  const advancedToggle = document.getElementById('advancedModeToggle');
  advancedToggle.addEventListener('change', (e) => {
    const isAdvanced = e.target.checked;
    if (isAdvanced) {
      document.getElementById('standardFields').classList.add('hidden');
      document.getElementById('advancedFields').classList.remove('hidden');
    } else {
      document.getElementById('standardFields').classList.remove('hidden');
      document.getElementById('advancedFields').classList.add('hidden');
    }
    document.getElementById('continueToStep3').disabled = true;
    document.getElementById('continueToStep3').classList.add('bg-gray-300', 'cursor-not-allowed');
    document.getElementById('continueToStep3').classList.remove('bg-blue-600', 'hover:bg-blue-700');
    document.getElementById('db-success').classList.add('hidden');
    document.getElementById('db-error').classList.add('hidden');
  });

  // Test Connection
  document.getElementById('testConnBtn').addEventListener('click', async () => {
    const isAdvanced = advancedToggle.checked;
    const dbConfig = {
      isAdvanced,
      host: document.getElementById('dbHost').value,
      port: document.getElementById('dbPort').value,
      adminUser: document.getElementById('adminUser').value,
      adminPass: document.getElementById('adminPass').value,
      dbName: document.getElementById('dbName').value,
      appUser: document.getElementById('appUser').value,
      appPass: document.getElementById('appPass').value
    };

    const btnText = document.getElementById('testConnText');
    const btnSpinner = document.getElementById('testConnSpinner');
    btnText.innerText = 'Testing...';
    btnSpinner.classList.remove('hidden');
    document.getElementById('db-error').classList.add('hidden');
    document.getElementById('db-success').classList.add('hidden');
    document.getElementById('continueToStep3').disabled = true;
    document.getElementById('continueToStep3').classList.add('bg-gray-300', 'cursor-not-allowed');
    document.getElementById('continueToStep3').classList.remove('bg-blue-600', 'hover:bg-blue-700');

    try {
      const res = await ipcRenderer.invoke('test-db-connection', dbConfig);
      if (res.success) {
        document.getElementById('db-success').classList.remove('hidden');
        document.getElementById('continueToStep3').disabled = false;
        document.getElementById('continueToStep3').classList.remove('bg-gray-300', 'cursor-not-allowed');
        document.getElementById('continueToStep3').classList.add('bg-blue-600', 'hover:bg-blue-700');
      } else {
        document.getElementById('db-error').classList.remove('hidden');
        document.getElementById('db-error-text').innerText = res.error || 'Connection failed';
      }
    } catch (err) {
      document.getElementById('db-error').classList.remove('hidden');
      document.getElementById('db-error-text').innerText = err.message;
    } finally {
      btnText.innerText = 'Test Connection';
      btnSpinner.classList.add('hidden');
    }
  });

  // Step 2 Form Submit (Scenario 2/3)
  document.getElementById('dbForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('continueToStep3').disabled) return;
    
    const dbConfig = {
      isAutoInstall: false,
      isAdvanced: advancedToggle.checked,
      host: document.getElementById('dbHost').value,
      port: document.getElementById('dbPort').value,
      adminUser: document.getElementById('adminUser').value,
      adminPass: document.getElementById('adminPass').value,
      dbName: document.getElementById('dbName').value,
      appUser: document.getElementById('appUser').value,
      appPass: document.getElementById('appPass').value
    };

    step2.classList.remove('active');
    step3.classList.add('active');
    runSetupTasks(companyData, dbConfig);
  });

  // Step 2 Auto Install (Scenario 1)
  document.getElementById('startAutoInstall').addEventListener('click', () => {
    const randomPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const dbConfig = { 
      isAutoInstall: true,
      adminUser: 'postgres',
      adminPass: randomPass
    };
    step2.classList.remove('active');
    step3.classList.add('active');
    runSetupTasks(companyData, dbConfig);
  });

  // Step 4 -> Launch
  document.getElementById('launchBtn').addEventListener('click', () => {
    ipcRenderer.send('launch-app');
  });

  async function runSetupTasks(companyData, dbConfig) {
    const setTaskActive = (taskNum) => {
      document.getElementById(`task-${taskNum}`).classList.remove('opacity-50');
      document.getElementById(`icon-${taskNum}`).className = 'w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0';
      document.getElementById(`text-${taskNum}`).classList.replace('text-gray-500', 'text-gray-700');
    };

    const setTaskComplete = (taskNum) => {
      document.getElementById(`icon-${taskNum}`).className = 'w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white';
      document.getElementById(`icon-${taskNum}`).innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
      document.getElementById(`text-${taskNum}`).classList.replace('text-gray-700', 'text-green-700');
    };

    if (dbConfig.isAutoInstall) {
      document.getElementById('task-installing').classList.replace('hidden', 'flex');
    } else {
      setTaskActive(2);
    }
    
    ipcRenderer.send('start-setup', companyData, dbConfig);

    // Listen for progress
    ipcRenderer.on('setup-progress', (event, stage) => {
      if (stage === 'installing-database') {
        document.getElementById('task-installing').classList.replace('hidden', 'flex');
      } else if (stage.startsWith('installing-progress:')) {
        const percent = stage.split(':')[1];
        if (percent === '100') {
          document.getElementById('text-installing-sub').innerText = 'Executing silent installation (this may take a few minutes)...';
        } else {
          document.getElementById('text-installing-sub').innerText = `Downloading components (${percent}%)...`;
        }
      } else if (stage === 'database-ready') {
        if (!document.getElementById('task-installing').classList.contains('hidden')) {
          document.getElementById(`icon-installing`).className = 'w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white';
          document.getElementById(`icon-installing`).innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
          document.getElementById(`text-installing`).classList.replace('text-gray-700', 'text-green-700');
          document.getElementById('text-installing-sub').innerText = 'Installation successful';
        }
        setTaskComplete(2);
        setTaskActive(3); // Migrations
      } else if (stage === 'workspace-ready') {
        setTaskComplete(3);
        setTaskActive(4); // Config
      } else if (stage === 'all-ready') {
        setTaskComplete(4);
        setTaskActive(5); // Complete
        
        setTimeout(() => {
          setTaskComplete(5);
        }, 400);

        setTimeout(() => {
          document.getElementById('success-company-name').innerText = companyData.companyName || 'Your Workspace';
          step3.classList.remove('active');
          step4.classList.add('active');
        }, 1000);
      }
    });

    ipcRenderer.on('setup-error', (event, summary, logDetail) => {
      document.getElementById('setup-tasks').classList.add('hidden');
      document.getElementById('setup-title').innerText = 'Setup Failed';
      document.getElementById('setup-subtitle').innerText = 'An error occurred while provisioning.';
      document.getElementById('setup-error-container').classList.remove('hidden');
      document.getElementById('setup-error-summary').innerText = summary;
      if (logDetail) {
        document.getElementById('diagnostics-log').value = logDetail;
      }
    });

    document.getElementById('showDiagnosticsBtn').addEventListener('click', () => {
      document.getElementById('diagnostics-container').classList.remove('hidden');
    });

    document.getElementById('retrySetupBtn').addEventListener('click', () => {
      document.getElementById('setup-tasks').classList.remove('hidden');
      document.getElementById('setup-title').innerText = 'Setting up your workspace';
      document.getElementById('setup-subtitle').innerText = 'This will only take a moment.';
      document.getElementById('setup-error-container').classList.add('hidden');
      document.getElementById('diagnostics-container').classList.add('hidden');
      
      // Go back to step 2 instead of blindly retrying setup tasks
      step3.classList.remove('active');
      step2.classList.add('active');
    });
  }
});
