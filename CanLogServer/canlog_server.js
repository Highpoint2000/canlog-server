///////////////////////////////////////////////////////////////
///                                                         ///
///  CANLOG SERVER SCRIPT FOR FM-DX-WEBSERVER (V2.1)        ///
///                                                         ///
///  by Highpoint               last update: 11.11.24       ///
///                                                         ///
///  https://github.com/Highpoint2000/canlog-server         ///
///                                                         /// 
///////////////////////////////////////////////////////////////

const PORT = 2000;            	// Port on which the server should run
let LogInterval_FMLIST = 60;    // Specify here in minutes when a log entry can be sent again (default: 30, minimum 30, off: 0)
let LogInterval_DXALERT = 60;   // Specify here in minutes when an alert entry can be sent again (default: 60, minimum 1, off: 0)

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const express = require('express');
const { logInfo, logError } = require('./../../server/console');

// File path for the log history
const logHistoryFilePath = path.join(__dirname, 'logHistory.json');

// List of required modules
const NewModules = ['jsdom', 'express'];

// Function to check and install missing modules
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
                process.exit(1);
            }
        }
    });
}

// Initialization of log history
let logHistoryFMLIST = {};
let logHistoryDXALERT = {};
let isLogHistoryUpdated = false;

// Function to load log history from the file
function loadLogHistory() {
    if (fs.existsSync(logHistoryFilePath)) {
        try {
            const data = fs.readFileSync(logHistoryFilePath, 'utf8');
            const parsedData = JSON.parse(data);
            logHistoryFMLIST = parsedData.fmlist || {};
            logHistoryDXALERT = parsedData.dxalert || {};
        } catch (error) {
            logError('Error loading log history from file:', error);
        }
    }
}

// Function to save log history to the file
function saveLogHistory() {
    if (isLogHistoryUpdated) {
        const data = {
            fmlist: logHistoryFMLIST,
            dxalert: logHistoryDXALERT
        };
        try {
            fs.writeFileSync(logHistoryFilePath, JSON.stringify(data, null, 4));
            isLogHistoryUpdated = false;
        } catch (error) {
            logError('Error saving log history to file:', error);
        }
    }
}

// Function to check if FMLIST entries can be logged
function canLogFMLIST(stationid) {
    const now = Date.now();
    const logIntervalMs = LogInterval_FMLIST * 60 * 1000;

    if (logHistoryFMLIST[stationid] && (now - logHistoryFMLIST[stationid]) < logIntervalMs) {
        return false;
    }

    logHistoryFMLIST[stationid] = now;
    isLogHistoryUpdated = true;
    return true;
}

// Function to check if DXALERT entries can be logged
function canLogDXALERT(stationid) {
    const now = Date.now();
    const logIntervalMs = LogInterval_DXALERT * 60 * 1000;

    if (logHistoryDXALERT[stationid] && (now - logHistoryDXALERT[stationid]) < logIntervalMs) {
        return false;
    }

    logHistoryDXALERT[stationid] = now;
    isLogHistoryUpdated = true;
    return true;
}

// Function to clean up expired entries in log history
function cleanUpExpiredLogs() {
    const now = Date.now();
    let hasChanges = false;

    for (let stationid in logHistoryFMLIST) {
        const logIntervalMs = LogInterval_FMLIST * 60 * 1000;
        if (now - logHistoryFMLIST[stationid] >= logIntervalMs) {
            delete logHistoryFMLIST[stationid];
            hasChanges = true;
        }
    }

    for (let stationid in logHistoryDXALERT) {
        const logIntervalMs = LogInterval_DXALERT * 60 * 1000;
        if (now - logHistoryDXALERT[stationid] >= logIntervalMs) {
            delete logHistoryDXALERT[stationid];
            hasChanges = true;
        }
    }

    if (hasChanges) {
        isLogHistoryUpdated = true;
        saveLogHistory();
    }
}

// Validation of logging interval settings
if ((LogInterval_FMLIST < 30 && LogInterval_FMLIST !== 0) || LogInterval_FMLIST === '' || LogInterval_FMLIST === undefined) {
    LogInterval_FMLIST = 30;  // Enforce minimum of 30 minutes for LogInterval_FMLIST
}
if ((LogInterval_DXALERT < 1 && LogInterval_DXALERT !== 0) || LogInterval_DXALERT === '' || LogInterval_DXALERT === undefined) {
    LogInterval_DXALERT = 1;
}

// Express setup
const app = express();
app.use(express.json());

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

        saveLogHistory();
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

        saveLogHistory();
    });
}

// Endpoints for querying log intervals
app.get('/loginterval/fmlist', (req, res) => {
    res.json({ LogInterval_FMLIST });
});

app.get('/loginterval/dxalert', (req, res) => {
    res.json({ LogInterval_DXALERT });
});

// Starting the server
app.listen(PORT, () => {
    checkAndInstallNewModules();
    loadLogHistory();
    cleanUpExpiredLogs();

    if (LogInterval_FMLIST !== 0) {
        logInfo(`CanLogServer is running on http://localhost:${PORT}/fmlist with ${LogInterval_FMLIST} min. logging interval`);
    }
    if (LogInterval_DXALERT !== 0) {
        logInfo(`CanLogServer is running on http://localhost:${PORT}/dxalert with ${LogInterval_DXALERT} min. logging interval`);
    }

    // Interval to clean up expired entries every minute
    setInterval(cleanUpExpiredLogs, 60 * 1000);
});
