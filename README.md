# AWS Account Name Display Chrome Extension

This Chrome extension enhances the AWS Management Console by displaying custom account names and background colors for AWS accounts, making it easier to identify accounts at a glance. It also allows users to collect account information from the AWS Access Portal and manage account mappings through a user-friendly popup interface.

## Features

- **Custom Account Names**: Replaces the default AWS account ID or alias in the AWS Console with a user-defined name.
- **Color Coding**: Applies a customizable background color to the account name for visual distinction.
- **Account Collection**: Scrapes account IDs and names from the AWS Access Portal and saves them to the extension, updating existing entries or adding new ones.
- **Account Management**: Add, edit, delete, import, or export account mappings via the popup.
- **Reset Functionality**: Clears all stored account mappings with a single click.
- **Efficient Execution**: Runs only once per page load with retries to handle asynchronous DOM loading, minimizing resource usage.

## Installation

1. **Clone or Download the Repository**:
   ```bash
   git clone [https://github.com/your-username/aws-account-name-display.git](https://github.com/ee3b555325b021ae4426d6bb89592b65/aws_name_chrome_extension.git)
   ```
   Or download the ZIP file and extract it.

2. **Load the Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top-right corner).
   - Click **Load unpacked** and select the folder containing the extension files.
   - The extension should appear in the extensions list with the name "AWS Account Name Display."

3. **Verify Files**:
   Ensure the following files are present in the extension folder:
   - `manifest.json`: Extension configuration.
   - `popup.html`: Popup UI.
   - `popup.js`: Popup logic for managing accounts.
   - `content.js`: Script for updating the AWS Console display.
   - `config.json`: Optional default account mappings.
   - `icons/`: Folder with icon files (`icon16.png`, `icon48.png`, `icon128.png`).

## Usage

### Configuring Accounts
1. **Open the Popup**:
   - Click the extension icon in the Chrome toolbar to open the popup.
2. **Add an Account**:
   - Click **Add Account** to create a new entry.
   - Enter the **Account ID** (e.g., `123484974321`), **Name** (e.g., `Production`), and select a **Color** (defaults to black, `#000000`).
   - Click **Save** to store the account mappings.
3. **Collect Accounts**:
   - Navigate to the AWS Access Portal (e.g., `https://*.awsapps.com/start`).
   - Open the popup and click **Collect** to scrape account IDs and names from the page.
   - Existing accounts with matching IDs will have their names updated; new accounts will be added with a default black background.
4. **Import/Export Accounts**:
   - **Export**: Click **Export** to download a JSON file (`aws-accounts-config.json`) with your account mappings.
   - **Import**: Click **Import**, select a JSON file, and confirm to load account mappings.
5. **Reset Accounts**:
   - Click **Reset** and confirm to clear all stored account mappings.
6. **Delete an Account**:
   - In the popup, click **Delete** next to an account entry to remove it, then click **Save**.

### Viewing Custom Names in AWS Console
- Open the AWS Management Console (e.g., `https://*.console.aws.amazon.com/*`).
- The account name in the top-right corner (e.g., near the account menu button) will display the custom name (e.g., `Production`) with the specified background color (e.g., black).
- If the name doesn’t update, ensure the Account ID in the popup matches the ID in the AWS Console (visible in the account detail menu).

## File Structure

```
aws-account-name-display/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── config.json
├── content.js
├── manifest.json
├── popup.html
├── popup.js
└── README.md
```

- **`config.json`**: Optional file with default account mappings (e.g., `[{ "id": "123484974321", "name": "Dev", "color": "#000000" }]`). Overridden by `chrome.storage.sync` if accounts are saved.
- **`content.js`**: Updates the AWS Console UI with custom account names and colors, running once per page load.
- **`popup.js`**: Handles popup interactions, including adding, collecting, saving, importing, exporting, and resetting accounts.
- **`popup.html`**: Defines the popup UI with input fields and buttons.
- **`manifest.json`**: Specifies extension permissions (`storage`, `activeTab`, `tabs`, `scripting`) and content script triggers.
