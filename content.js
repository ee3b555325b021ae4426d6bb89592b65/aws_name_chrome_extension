function updateAccountDisplay() {
  console.log('Running updateAccountDisplay');
  try {
    chrome.storage.sync.get('awsAccounts', (data) => {
      const accounts = data.awsAccounts || [];
      console.log('Loaded accounts:', accounts);
      const accountButton = document.querySelector('[data-testid="awsc-nav-account-menu-button"]');
      if (!accountButton) {
        console.log('Account button not found');
        return false;
      }

      // Try to extract Account ID from the button's title attribute
      let accountId = null;
      const title = accountButton.closest('button')?.getAttribute('title') || '';
      console.log('Button title:', title);
      const accountIdMatch = title.match(/\d{4}-\d{4}-\d{4}/);
      if (accountIdMatch) {
        accountId = accountIdMatch[0].replace(/-/g, '');
        console.log('Extracted Account ID from title:', accountId);
      } else {
        console.log('Account ID not found in title, checking account detail menu');
        // Fallback: Extract Account ID from account detail menu
        const accountDetailContainer = document.querySelector('[data-testid="account-detail-menu"]');
        if (accountDetailContainer) {
          const spans = accountDetailContainer.querySelectorAll('span');
          const detailIdSpan = Array.from(spans).find(span => span.textContent.match(/\d{4}-\d{4}-\d{4}/));
          if (detailIdSpan) {
            const detailIdMatch = detailIdSpan.textContent.match(/\d{4}-\d{4}-\d{4}/);
            if (detailIdMatch) {
              accountId = detailIdMatch[0].replace(/-/g, '');
              console.log('Extracted Account ID from account detail:', accountId);
            } else {
              console.log('Account ID not found in any span within account detail menu');
              // Fallback: Try non-numeric ID from title
              const titleIdMatch = title.match(/@ ([^ ]+)$/);
              if (titleIdMatch) {
                accountId = titleIdMatch[1]; // e.g., aws-sweed-dev
                console.log('Extracted non-numeric ID from title:', accountId);
              } else {
                console.log('No ID found in title or account detail menu');
                return false;
              }
            }
          } else {
            console.log('No span with Account ID found in account detail menu');
            return false;
          }
        } else {
          console.log('Account detail menu not found');
          return false;
        }
      }

      const account = accounts.find(acc => acc.id === accountId);
      if (!account) {
        console.log('No matching account found for ID:', accountId);
        return false;
      }
      console.log('Found account:', account);

      const labelSpan = accountButton.querySelector('span[class*="button-content--label"]');
      if (labelSpan) {
        console.log('Updating label to:', account.name);
        labelSpan.textContent = account.name;
        labelSpan.style.backgroundColor = account.color;
        labelSpan.style.padding = '2px 5px';
        labelSpan.style.borderRadius = '3px';
        return true; // Indicate successful update
      } else {
        console.log('Label span not found');
        return false;
      }
    });
  } catch (error) {
    console.error('Error in updateAccountDisplay:', error);
    return false;
  }
}

// Run initially and retry with delay to handle async DOM loading
function tryUpdateAccountDisplay(attempts = 15, interval = 1000) {
  console.log('Attempting update, remaining attempts:', attempts);
  try {
    const success = updateAccountDisplay();
    if (success && attempts > 1) {
      console.log('Update successful, stopping retries');
      return;
    }
    if (attempts > 1) {
      setTimeout(() => tryUpdateAccountDisplay(attempts - 1, interval), interval);
    } else {
      console.log('All retry attempts exhausted');
    }
  } catch (error) {
    console.error('Error in tryUpdateAccountDisplay:', error);
  }
}

console.log('Content script loaded');
try {
  tryUpdateAccountDisplay();
} catch (error) {
  console.error('Error initializing content script:', error);
}