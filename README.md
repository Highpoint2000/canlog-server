# CanLogServer Plugin for [FM-DX-Webserver](https://github.com/NoobishSVK/fm-dx-webserver)
This plugin provides a central server to manage the logs that have been send automatic over the scanner plugin.

## Version 1.0

## Installation notes:

1. [Download](https://github.com/Highpoint2000/canlog-server/releases) the last repository as a zip
2. Unpack the CanLogServerPlugin,js and the CanLogServer folder (with the canlog.js and canlog_server.js) into the web server plugins folder (..fm-dx-webserver-main\plugins)
4. Restart the server
5. Activate the plugin it in the settings

## Notes: 

- Please do not delete canlog.js even if it is empty!

## Configuration options:

The following variables can be changed in the header of the canlog_server.js:

    const PORT = 2000; 		// Port on which the server should run
    let LogInterval = 240;     	// Specify here in minutes when a log entry can be sent again (default: 60, minimum 60)
