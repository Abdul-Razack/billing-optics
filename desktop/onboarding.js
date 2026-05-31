const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const step4 = document.getElementById('step-4');

  // Step 1 -> 2
  document.getElementById('nextToStep2').addEventListener('click', () => {
    step1.classList.remove('active');
    step2.classList.add('active');
  });

  document.getElementById('quitBtn').addEventListener('click', () => {
    ipcRenderer.send('quit-app');
  });

  // Step 2 -> 1
  document.getElementById('backToStep1').addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
  });

  // Step 2 -> 3
  document.getElementById('companyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect data
    const companyData = {
      companyName: document.getElementById('companyName').value,
      ownerName: document.getElementById('ownerName').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value
    };

    step2.classList.remove('active');
    step3.classList.add('active');

    // Start setup process
    runSetupTasks(companyData);
  });

  // Step 4 -> Launch
  document.getElementById('launchBtn').addEventListener('click', () => {
    ipcRenderer.send('launch-app');
  });

  async function runSetupTasks(companyData) {
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

    // Task 1: Preparing Application (Immediate)
    setTaskActive(1);
    await new Promise(r => setTimeout(r, 800));
    setTaskComplete(1);

    // Task 2: Configuring Database (Trigger IPC to save default .env and start servers)
    setTaskActive(2);
    ipcRenderer.send('start-setup', companyData);

    // Listen for progress from main process
    ipcRenderer.on('setup-progress', (event, stage) => {
      if (stage === 'database-ready') {
        setTaskComplete(2);
        setTaskActive(3);
      } else if (stage === 'workspace-ready') {
        setTaskComplete(3);
        setTaskActive(4);
      } else if (stage === 'all-ready') {
        setTaskComplete(4);
        setTimeout(() => {
          step3.classList.remove('active');
          step4.classList.add('active');
        }, 600);
      }
    });

    ipcRenderer.on('setup-error', (event, msg) => {
      document.getElementById('setup-tasks').classList.add('hidden');
      document.getElementById('setup-title').innerText = 'Setup Interrupted';
      document.getElementById('setup-subtitle').innerText = 'We encountered a problem while provisioning your environment.';
      document.getElementById('setup-error-container').classList.remove('hidden');
    });

    document.getElementById('retrySetupBtn').addEventListener('click', () => {
      // Reset UI and retry
      document.getElementById('setup-tasks').classList.remove('hidden');
      document.getElementById('setup-title').innerText = 'Setting up your workspace';
      document.getElementById('setup-subtitle').innerText = 'This will only take a moment.';
      document.getElementById('setup-error-container').classList.add('hidden');
      
      // Reset tasks
      for(let i=2; i<=4; i++) {
        document.getElementById(`task-${i}`).classList.add('opacity-50');
        document.getElementById(`icon-${i}`).className = 'w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0';
        document.getElementById(`icon-${i}`).innerHTML = '';
        document.getElementById(`text-${i}`).classList.replace('text-green-700', 'text-gray-500');
        document.getElementById(`text-${i}`).classList.replace('text-gray-700', 'text-gray-500');
      }

      setTaskActive(2);
      ipcRenderer.send('start-setup', companyData);
    });
  }
});
