///////////////////////////////////////////////////////////////
///                                                         ///
///  CANLOG SERVER SCRIPT FOR FM-DX-WEBSERVER (V2.1)        ///
///                                                         ///
///  by Highpoint               last update: 06.11.24       ///
///                                                         ///
///  https://github.com/Highpoint2000/canlog-server         ///
///                                                         /// 
///////////////////////////////////////////////////////////////

const PORT = 2000;            	// Port on which the server should run
let LogInterval_FMLIST = 60;    // Specify here in minutes when a log entry can be sent again (default: 60, minimum 60, off: 0)
let LogInterval_DXALERT = 60;   // Specify here in minutes when an alarm entry can be sent again (default: 60, minimum 2, off: 0)

const path = require('path');
const fs = require('fs');
const { logInfo, logError } = require('./../../server/console');
const { execSync } = require('child_process');

const NewModules = [
    'jsdom',
    'express',
];

const logFilePath = path.join(__dirname, 'logHistory.json');

// Function to check and install missing NewModules
function checkAndInstallNewModules() {
    NewModules.forEach(module => {
        const modulePath = path.join(__dirname, './../../node_modules', module);
        if (!fs.existsSync(modulePath)) {
            logInfo(`Module ${module} is missing. Installing...`);
            try {
                execSync(`npm install ${module}`, { stdio: 'inherit' });
                logInfo(`Module ${module} installed successfully.`);
            } catch (error) {
                logError(`Error installing module ${module}:`, error);
                process.exit(1); // Exit the process with an error code
            }
        }
    });
}

// Load log history from file
function loadLogHistory() {
    if (fs.existsSync(logFilePath)) {
        const data = fs.readFileSync(logFilePath, 'utf8');
        const parsedData = JSON.parse(data);
        logHistoryFMLIST = parsedData.logHistoryFMLIST || {};
        logHistoryDXALERT = parsedData.logHistoryDXALERT || {};
        logInfo("Log history loaded from file.");
    } else {
        logHistoryFMLIST = {};
        logHistoryDXALERT = {};
        logInfo("No log history file found, starting with empty history.");
    }
}

// Save log history to file
function saveLogHistory() {
    const data = {
        logHistoryFMLIST,
        logHistoryDXALERT
    };
    fs.writeFileSync(logFilePath, JSON.stringify(data), 'utf8');
    logInfo("Log history saved to file.");
}

// Check and install missing NewModules before starting the server
checkAndInstallNewModules();

const express = require('express');
const app = express();
app.use(express.json()); // Middleware for parsing JSON requests

if ((LogInterval_FMLIST < 60 && LogInterval_FMLIST !== 0) || LogInterval_FMLIST === '' || LogInterval_FMLIST === undefined) {
    LogInterval_FMLIST = 60;
}
if ((LogInterval_DXALERT < 2 && LogInterval_DXALERT !== 0) || LogInterval_DXALERT === '' || LogInterval_DXALERT === undefined) {
    LogInterval_DXALERT = 2;
}

// Object to store logs
let logHistoryFMLIST = {};
let logHistoryDXALERT = {};

// Load existing log history
loadLogHistory();

// Function to check logging permission for FMLIST
function canLogFMLIST(stationid) {
    const now = Date.now();
    const logMinutes = 60 * LogInterval_FMLIST * 1000; 

    if (logHistoryFMLIST[stationid] && (now - logHistoryFMLIST[stationid]) < logMinutes) {
        return false; // Deny logging if less than x minutes have passed
    }

    logHistoryFMLIST[stationid] = now; // Update with the current timestamp
    saveLogHistory(); // Save updated log history
    return true; // Logging allowed
}

// Function to check logging permission for DXALERT
function canLogDXALERT(stationid) {
    const now = Date.now();
    const logMinutes = 60 * LogInterval_DXALERT * 1000; 

    if (logHistoryDXALERT[stationid] && (now - logHistoryDXALERT[stationid]) < logMinutes) {
        return false; // Deny logging if less than x minutes have passed
    }

    logHistoryDXALERT[stationid] = now; // Update with the current timestamp
    saveLogHistory(); // Save updated log history
    return true; // Logging allowed
}

// Endpoint for logging FMLIST
if (LogInterval_FMLIST !== 0) {
    app.post('/fmlist/:stationid', (req, res) => {
        const stationid = req.params.stationid;
        const loggingAllowed = canLogFMLIST(stationid);

        if (loggingAllowed) {
            res.status(200).send(`Logging allowed for ${stationid} on FMLIST`);
        } else {
            res.status(429).send(`ID ${stationid} was already logged recently on FMLIST.`);
        }
    });
}

// Endpoint for logging DXALERT
if (LogInterval_DXALERT !== 0) {
    app.post('/dxalert/:stationid', (req, res) => {
        const stationid = req.params.stationid;
        const loggingAllowed = canLogDXALERT(stationid);

        if (loggingAllowed) {
            res.status(200).send(`Alert allowed for ${stationid}`);
        } else {
            res.status(429).send(`Alert for ID ${stationid} was already sent recently.`);
        }
    });
}

// Endpoint to get the LogInterval for FMLIST
app.get('/loginterval/fmlist', (req, res) => {
    res.json({ LogInterval_FMLIST });
});

// Endpoint to get the LogInterval for DXALERT
app.get('/loginterval/dxalert', (req, res) => {
    res.json({ LogInterval_DXALERT });
});

// Start the server
app.listen(PORT, () => {
    if (LogInterval_FMLIST !== 0) {
        logInfo(`CanLogServer is running on http://localhost:${PORT}/fmlist with ${LogInterval_FMLIST} min. logging interval`); 
    }
    if (LogInterval_DXALERT !== 0) {
        logInfo(`CanLogServer is running on http://localhost:${PORT}/dxalert with ${LogInterval_DXALERT} min. logging interval`);
    }
});
