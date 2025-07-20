document.addEventListener('DOMContentLoaded', () => {
  const accountList = document.getElementById('accountList');
  const addAccountButton = document.getElementById('addAccount');
  const saveAccountsButton = document.getElementById('saveAccounts');
  const collectAccountsButton = document.getElementById('collectAccounts');
  const exportAccountsButton = document.getElementById('exportAccounts');
  const importAccountsButton = document.getElementById('importAccounts');
  const resetAccountsButton = document.getElementById('resetAccounts');
  const importFileInput = document.getElementById('importFile');
  let accounts = [];

  // Load default config and saved accounts
  fetch(chrome.runtime.getURL('config.json'))
    .then(response => response.json())
    .then(defaultConfig => {
      chrome.storage.sync.get('awsAccounts', (data) => {
        accounts = data.awsAccounts || defaultConfig.accounts || [];
        renderAccounts();
      });
    })
    .catch(error => {
      console.error('Error loading config.json:', error);
      chrome.storage.sync.get('awsAccounts', (data) => {
        accounts = data.awsAccounts || [];
        renderAccounts();
      });
    });

  // Add new account
  addAccountButton.addEventListener('click', () => {
    accounts.push({ id: '', name: '', color: '#000000' });
    renderAccounts();
  });

  // Save accounts
  saveAccountsButton.addEventListener('click', () => {
    const updatedAccounts = [];
    document.querySelectorAll('.account-entry').forEach(entry => {
      const id = entry.querySelector('.account-id').value.trim().replace(/-/g, '');
      const name = entry.querySelector('.account-name').value.trim();
      const color = entry.querySelector('.account-color').value;
      if (id && name) {
        updatedAccounts.push({ id, name, color });
      }
    });
    accounts = updatedAccounts;
    chrome.storage.sync.set({ awsAccounts: accounts }, () => {
      alert('Accounts saved!');
      renderAccounts();
    });
  });

  // Collect accounts from AWS Access Portal
  collectAccountsButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        console.error('No active tab found');
        alert('No active tab found. Please ensure a tab is active.');
        return;
      }
      console.log('Injecting script into tab:', tabs[0].id);
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: collectAWSAccounts
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('Script execution error:', chrome.runtime.lastError.message);
          alert('Error executing script: ' + chrome.runtime.lastError.message);
          return;
        }
        if (results && results[0] && results[0].result) {
          const collectedAccounts = results[0].result;
          console.log('Collected accounts:', collectedAccounts);
          if (collectedAccounts.length === 0) {
            alert('No accounts found on the page. Ensure you are on the AWS Access Portal.');
            return;
          }
          chrome.storage.sync.get('awsAccounts', (data) => {
            const existingAccounts = data.awsAccounts || [];
            const updatedAccounts = [...existingAccounts];

            collectedAccounts.forEach(collected => {
              const existingIndex = updatedAccounts.findIndex(acc => acc.id === collected.id);
              if (existingIndex !== -1) {
                // Update existing account name, preserve color
                updatedAccounts[existingIndex].name = collected.name;
              } else {
                // Add new account with default color
                updatedAccounts.push({ id: collected.id, name: collected.name, color: '#000000' });
              }
            });

            accounts = updatedAccounts;
            chrome.storage.sync.set({ awsAccounts: accounts }, () => {
              alert('Accounts collected and saved!');
              renderAccounts();
            });
          });
        } else {
          console.error('No results returned from script execution');
          alert('No accounts found on the page. Ensure you are on the AWS Access Portal.');
        }
      });
    });
  });

  // Export accounts
  exportAccountsButton.addEventListener('click', () => {
    const data = JSON.stringify({ accounts }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aws-accounts-config.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import accounts
  importAccountsButton.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.accounts && Array.isArray(importedData.accounts)) {
            accounts = importedData.accounts.map(account => ({
              id: account.id.replace(/-/g, ''),
              name: account.name,
              color: account.color || '#000000'
            }));
            chrome.storage.sync.set({ awsAccounts: accounts }, () => {
              alert('Accounts imported successfully!');
              renderAccounts();
            });
          } else {
            alert('Invalid JSON format: "accounts" array not found.');
          }
        } catch (error) {
          alert('Error parsing JSON file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  });

  // Reset accounts
  resetAccountsButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all accounts? This will clear all stored account mappings.')) {
      chrome.storage.sync.remove('awsAccounts', () => {
        accounts = [];
        alert('All accounts reset!');
        renderAccounts();
      });
    }
  });

  // Render account list
  function renderAccounts() {
    accountList.innerHTML = '';
    accounts.forEach((account, index) => {
      const entry = document.createElement('div');
      entry.className = 'account-entry';
      entry.innerHTML = `
        <input type="text" class="account-id" placeholder="Account ID (e.g., 123448481234)" value="${formatAccountId(account.id)}">
        <input type="text" class="account-name" placeholder="Account Name" value="${account.name}">
        <input type="color" class="account-color" value="${account.color}">
        <button class="delete-account">Delete</button>
      `;
      accountList.appendChild(entry);

      // Delete account
      entry.querySelector('.delete-account').addEventListener('click', () => {
        accounts.splice(index, 1);
        renderAccounts();
      });
    });
  }

  // Format Account ID for display (add hyphens)
  function formatAccountId(id) {
    if (!id) return '';
    id = id.replace(/-/g, '');
    if (id.length === 12) {
      return `${id.slice(0, 4)}-${id.slice(4, 8)}-${id.slice(8)}`;
    }
    return id;
  }

  // Function injected into the active tab to collect accounts
  function collectAWSAccounts() {
    try {
      const accountBlocks = document.querySelectorAll('div[class*="awsui_root"][class*="awsui_vertical"]');
      const accounts = [];
      accountBlocks.forEach(block => {
        const nameSpan = block.querySelector('strong span');
        const idSpan = block.querySelector('p span');
        if (nameSpan && idSpan) {
          const name = nameSpan.textContent.trim();
          const id = idSpan.textContent.trim().replace(/-/g, '');
          if (name && id.match(/^\d{12}$/)) {
            accounts.push({ id, name });
          }
        }
      });
      console.log('Collected accounts in content script:', accounts);
      return accounts;
    } catch (error) {
      console.error('Error in collectAWSAccounts:', error);
      return [];
    }
  }
});