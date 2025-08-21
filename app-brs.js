// const { platform } = require('os');
// const { exec } = require('child_process');

// var url = 'https://www.wikipedia.com';
// var browser = 'Firefox';//'Google Chrome';
// var pids={};

// function open_browser(browser_input, url){
//     let status='', browser;
//     if(browser_input == 'chrome') browser= 'Google Chrome';
//     else if(browser_input == 'firefox') browser= 'Firefox';
//     else{
//         status= 'browser param invalid. Taking firefox as a default browser.';
//         console.log(status);
//         browser= 'Firefox';
//     }

//     if (url === undefined) {
//         console.error('Please enter a URL, e.g. "http://www.browserstack.com"');
//         status+= '  invalid url';
//         return {code:0, status};//failed
//         // process.exit(0);
//     }
//     let command;
        
//     if (process.platform === 'win32') {
//         status+= '  I used macbook. So, It may not work in windows as i am not able to test it in window machine.';
//         console.log(status);
//         command = `start ${browser}:${url}`;
//     } else if (process.platform === 'darwin') {
//         command = `open -a "${browser}" ${url}`;
//     } else {
//         status+= '  No platform detected';
//         console.log(status);
//         command = `google-chrome --no-sandbox ${url}`;
//     }
//     console.log(`exec command: ${command}`); 
//     pids[browser_input] = exec(command).pid;
//     console.log(pids, 'process ids');
//     return {code:1, status};//success exec
// }

// function kill_browser(browser_input){
//     let status='browser killed', browser, pid;
//     if(browser_input == 'chrome') browser= 'Google Chrome';
//     else if(browser_input == 'firefox') browser= 'firefox';
//     else{
//         status= 'browser param invalid.';
//         console.log(status);
//         browser= 'Firefox';
//         return {status};
//     }
//     console.log(`:test: ${browser} kill`);
//     exec(`pkill ${browser}`);
//     return {status};
// }

// function cleanUp(){
//     let status='browser killed', browser, pid;
//     if(browser_input == 'chrome') browser= 'Google Chrome';
//     else if(browser_input == 'firefox'){
//         browser= 'firefox';
//         exec(`rm ~/.mozilla/firefox/*.default/*.sqlite ~/.mozilla/firefox/*default/sessionstore.js`);
//         exec(`rm -r ~/.cache/mozilla/firefox/*.default/*`);  
//     }
//     else{
//         status= 'browser param invalid.';
//         console.log(status);
//         browser= 'Firefox';
//         return {status};
//     }
//     console.log(`:test: ${browser} kill`);  
//     return {status};
// }

// module.exports= {
//     open_browser,
//     kill_browser,
//     cleanUp
// }



// Import 'platform' from the 'os' module to determine the operating system (e.g., 'win32', 'darwin', 'linux')
// Search query: "Node.js os module platform"
const { platform } = require('os');

// Import 'exec' from the 'child_process' module to execute system commands (e.g., opening a browser or killing a process)
// Search query: "Node.js child_process exec"
const { exec } = require('child_process');

// Object to store process IDs (PIDs) of opened browser instances, keyed by browser name (e.g., 'chrome', 'firefox')
// This helps track and terminate specific browser instances
// Search query: "Node.js store process ID child_process"
const pids = {};

// Function to open a specified URL in the given browser (Chrome or Firefox)
// Parameters: browser_input (string, e.g., 'chrome' or 'firefox'), url (string, e.g., 'https://www.google.com')
function open_browser(browser_input, url) {
    // Initialize status message to provide feedback on the operation's success or failure
    let status = 'Browser opened successfully';
    // Variable to hold the system-specific browser name (e.g., 'Google Chrome' for macOS/Windows, 'firefox' for Linux)
    let browser;

    // Validate browser input to ensure it’s either 'chrome' or 'firefox'
    // Search query: "JavaScript array includes method"
    if (!['chrome', 'firefox'].includes(browser_input)) {
        // If invalid, log a warning and default to 'firefox'
        status = 'Invalid browser. Use "chrome" or "firefox". Defaulting to firefox.';
        console.log(status);
        browser_input = 'firefox';
    }
    // Map browser_input to system-specific name for use in commands
    // 'chrome' maps to 'Google Chrome' (used in macOS/Windows), 'firefox' remains 'Firefox'
    browser = browser_input === 'chrome' ? 'Google Chrome' : 'Firefox';

    // Validate URL to ensure it’s defined and starts with http:// or https://
    // Search query: "JavaScript regex validate URL"
    if (!url || !url.match(/^https?:\/\/.+/)) {
        // Log error and update status if URL is invalid
        console.error('Invalid URL. Must start with http:// or https://.');
        status = 'Invalid URL';
        // Return failure response with code 0
        return { code: 0, status };
    }

    // Variable to store the platform-specific command to open the browser
    let command;
    // Determine the operating system and construct the appropriate command
    // Search query: "Node.js process.platform values"
    if (platform() === 'win32') {
        // Windows: Use 'start' command to launch the browser with the URL
        // The empty "" ensures the command works even if the URL has spaces
        // Search query: "Windows command line open browser with URL"
        command = `start "" "${browser}" "${url}"`;
    } else if (platform() === 'darwin') {
        // macOS: Use 'open -a' to launch the specified browser with the URL
        // Search query: "macOS open command browser URL"
        command = `open -a "${browser}" "${url}"`;
    } else {
        // Linux: Use browser-specific commands (chrome or firefox)
        // The --no-sandbox flag is used for Chrome to avoid sandboxing issues in some environments
        // Search query: "Linux command line open chrome firefox URL"
        command = browser_input === 'chrome' ? `google-chrome --no-sandbox "${url}"` : `firefox "${url}"`;
    }

    // Log the command for debugging purposes
    console.log(`Executing command: ${command}`);
    try {
        // Execute the command using 'exec' and capture the process object
        // Search query: "Node.js child_process exec error handling"
        const process = exec(command);
        // Store the process ID (PID) in the pids object for later termination
        pids[browser_input] = process.pid;
        // Log the stored PID for debugging
        console.log(`PID stored: ${pids[browser_input]} for ${browser_input}`);
        // Return success response with code 1
        return { code: 1, status };
    } catch (error) {
        // Handle errors during command execution (e.g., browser not installed)
        status = `Failed to open browser: ${error.message}`;
        console.error(status);
        // Return failure response with code 0
        return { code: 0, status };
    }
}

// Function to terminate a specific browser instance using its stored PID
// Parameter: browser_input (string, e.g., 'chrome' or 'firefox')
function kill_browser(browser_input) {
    // Initialize status message
    let status = 'Browser terminated successfully';
    // Validate browser input
    if (!['chrome', 'firefox'].includes(browser_input)) {
        // Log error and return failure if browser is invalid
        status = 'Invalid browser. Use "chrome" or "firefox".';
        console.log(status);
        return { code: 0, status };
    }

    // Check if a PID exists for the specified browser
    if (!pids[browser_input]) {
        // If no PID is found, the browser wasn’t opened by this script
        status = `No running instance found for ${browser_input}`;
        console.log(status);
        return { code: 0, status };
    }

    try {
        // Kill the process using the stored PID
        // Search query: "Linux macOS kill process by PID"
        exec(`kill ${pids[browser_input]}`);
        // Log the termination action for debugging
        console.log(`Terminated ${browser_input} with PID ${pids[browser_input]}`);
        // Remove the PID from the pids object to clean up
        delete pids[browser_input];
        // Return success response
        return { code: 1, status };
    } catch (error) {
        // Handle errors during process termination (e.g., process already closed)
        status = `Failed to terminate browser: ${error.message}`;
        console.error(status);
        // Return failure response
        return { code: 0, status };
    }
}

// Function to clear cache and history for the specified browser
// Parameter: browser_input (string, e.g., 'chrome' or 'firefox')
function clear_cache_and_history(browser_input) {
    // Initialize status message
    let status = 'Cache and history cleared successfully';
    // Variable for system-specific browser name
    let browser;

    // Validate browser input
    if (!['chrome', 'firefox'].includes(browser_input)) {
        status = 'Invalid browser. Use "chrome" or "firefox".';
        console.log(status);
        return { code: 0, status };
    }
    // Map browser_input to system-specific name
    browser = browser_input === 'chrome' ? 'Google Chrome' : 'firefox';

    try {
        if (browser_input === 'firefox') {
            // Clear Firefox cache and history for macOS/Linux
            // Deletes SQLite databases (history, cookies) and session files
            // Search query: "Firefox cache history file location macOS Linux"
            exec(`rm -f ~/.mozilla/firefox/*.default-release/*.sqlite ~/.mozilla/firefox/*.default-release/sessionstore.js`);
            // Deletes cache FILES
            exec(`rm -rf ~/.cache/mozilla/firefox/*.default-release/*`);
        } else if (browser_input === 'chrome') {
            // Clear Chrome cache and history for macOS
            // Deletes cache files and history database
            // Search query: "Google Chrome cache history file location macOS"
            exec(`rm -rf ~/Library/Caches/Google/Chrome/*`);
            exec(`rm -f ~/Library/Application\\ Support/Google/Chrome/Default/History`);
        }
        // Log the action for debugging
        console.log(`Cleared cache and history for ${browser}`);
        // Return success response
        return { code: 1, status };
    } catch (error) {
        // Handle errors during file deletion (e.g., permissions, file not found)
        status = `Failed to clear cache and history: ${error.message}`;
        console.error(status);
        // Return failure response
        return { code: 0, status };
    }
}

// Export the functions to be used by a server (e.g., server.js)
// Search query: "Node.js module exports"
module.exports = {
    open_browser,
    kill_browser,
    clear_cache_and_history
};