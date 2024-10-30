///////////////////////////////////////////////////////////////
///                                                         ///
///  CANLOG SERVER SCRIPT FOR FM-DX-WEBSERVER (V1.0)        ///
///                                                         ///
///  by Highpoint               last update: 30.10.24       ///
///                                                         ///
///  https://github.com/Highpoint2000/canlog-server         ///
///                                                         ///
///////////////////////////////////////////////////////////////

///  This plugin only works from scanner plugin version 2.8a !!!

const PORT = 2000; 		// Port on which the server should run
let LogInterval = 60; 	// Specify here in minutes when a log entry can be sent again (default: 60, minimum 60)

///////////////////////////////////////////////////////////////

const path = require('path');
const fs = require('fs');
const { logInfo, logError, logDebug } = require('./../../server/console');

// Function to check and install missing NewModules
const { execSync } = require('child_process');
const NewModules = [
    'jsdom',
    'express', // Add express to the list of required modules
];

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
        } else {
            // console.log(`Module ${module} is already installed.`);
        }
    });
}

// Check and install missing NewModules before starting the server
checkAndInstallNewModules();

const express = require('express');
const app = express();
app.use(express.json()); // Middleware for parsing JSON requests

if (LogInterval < 60 || LogInterval === '' || LogInterval === undefined) {
    LogInterval = 60;
}

// Object to store logs
let logHistory = {};

// Function to check logging permission
function canLog(stationid) {
    const now = Date.now();
    const logMinutes = 60 * LogInterval * 1000; 

    if (logHistory[stationid] && (now - logHistory[stationid]) < logMinutes) {
        return false; // Deny logging if less than x minutes have passed
    }

    logHistory[stationid] = now; // Update with the current timestamp
    return true; // Logging allowed
}

// Endpoint for logging
app.post('/log/:stationid', (req, res) => {
    const stationid = req.params.stationid;
    const loggingAllowed = canLog(stationid);

    if (loggingAllowed) {
        // logInfo(`Logging allowed for ${stationid}`);
        res.status(200).send(`Logging allowed for ${stationid}`);
    } else {
        // logInfo(`ID ${stationid} was already logged recently.`);
        res.status(429).send(`ID ${stationid} was already logged recently.`);
    }
});

// Start the server
app.listen(PORT, () => {
logInfo(`CanLogServer is running on http://localhost:${PORT} with ${LogInterval} min. logging interval`);
});
