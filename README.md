# CanLogServer Plugin for [FM-DX-Webserver](https://github.com/NoobishSVK/fm-dx-webserver)
This plugin provides a central server to manage the logs that have been send automatic over the scanner plugin.

## Version 1.0

When using multiple web servers, it is recommended to use a central server to manage the FMLIST log entries. The CanLogServer prevents multiple web servers from entering the same station into the FMLIST database at the same time interval.

## Installation notes:

1. [Download](https://github.com/Highpoint2000/canlog-server/releases) the last repository as a zip
2. Unpack the CanLogServerPlugin,js and the CanLogServer folder (with the canlog.js and canlog_server.js) into the web server plugins folder (..fm-dx-webserver-main\plugins)
4. Restart the server
5. Activate the plugin it in the settings

## Notes: 

- Please do not delete canlog.js even if it is empty!
- Please enter Server:Port (e.g. 127.0.0.1:2000) in the JSON configuration file of the scanner plugin.
  
## Configuration options:

The following variables can be changed in the header of the canlog_server.js:

    const PORT = 2000; 		// Port on which the server should run
    let LogInterval = 240;     	// Specify here in minutes when a log entry can be sent again (default: 60, minimum 60)
