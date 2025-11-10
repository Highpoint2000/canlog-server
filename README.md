# CanLogServer Plugin for [FM-DX-Webserver](https://github.com/NoobishSVK/fm-dx-webserver)
This plugin provides a central server to manage the FMLIST logs and DX alerts.

## Version 2.1 (only works from Scanner plugin version 2.8c and DX-Alert plugin 3.4  !!!)

- Local storage of history to restore it on reboot

## Installation notes:

1. [Download](https://github.com/Highpoint2000/canlog-server/releases) the last repository as a zip
2. Unpack the CanLogServerPlugin,js and the CanLogServer folder (with the canlog.js and canlog_server.js) into the web server plugins folder (..fm-dx-webserver-main\plugins)
4. Restart the server
5. Activate the plugin it in the settings

## Notes: 

- Do not delete canlog.js even if it is empty!
- Please enter Server:Port (e.g. 127.0.0.1:2000) in the JSON configuration file of the scanner plugin and/or the dx-alert plugin
- When the server is used, the log interval set in the scanner.json/DX-Alert.json is inactive because the log interval set for the server takes precedence
  
## Configuration options:

The following variables can be changed in the header of the canlog_server.js:

    const PORT = 2000; 				// Port on which the server should run
    let LogInterval_FMLIST = 60; 	// Specify here in minutes when a log entry can be sent again (default: 30, minimum 30, off: 0) ---> for Scanner Plugin!
	let LogInterval_DXALERT = 60; 	// Specify here in minutes when a alarm entry can be sent again (default: 60, minimum 1, off: 0)) ---> für DX-Alert Plugin!

## Contact

If you have any questions, would like to report problems, or have suggestions for improvement, please feel free to contact me! You can reach me by email at highpoint2000@googlemail.com. I look forward to hearing from you!

<a href="https://www.buymeacoffee.com/Highpoint" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

<details>
<summary>History</summary>

### Version 2.0 (only works from Scanner plugin version 2.8c and DX-Alert plugin 3.4  !!!)

- Added management for the alarms of the DX-Alert plugin

### Version 1.0

When using multiple web servers, it is recommended to use a central server to manage the FMLIST log entries. The CanLogServer prevents multiple web servers from entering the same station into the FMLIST database at the same time interval.
