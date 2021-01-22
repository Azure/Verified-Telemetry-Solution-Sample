// Copyright (c) Microsoft Corporation.
let influxwriter = require('./influxWriter');
const { processVerifiedTelemetry } = require('./verifiedTelemetryProcessor');
const constants = require('./constants');

let printError = function (err) {
    console.log(err.message);
};

let processMessage = function (message) {
    let body = message.body;
    let additionalProperties = message.applicationProperties;
    let deviceId = message.annotations["iothub-connection-device-id"];
    let componentName = ""
    try {
        componentName = message.annotations["dt-subject"];
    } catch (e) {
        componentName = "Default Component";
    }
    console.log("Received Telemetry");
    if(deviceId == constants.deviceId)
    {
        console.log("Received Telemetry for device:",constants.deviceId);
        for (const key of Object.keys(body))
        {
            if(!processVerifiedTelemetry(key, body, componentName))
            {
                influxwriter.writeTelemetryToInfluxDB(key, body[key], deviceId,componentName, 'false');
            }
        }
    }
    
};

module.exports = { printError: printError, processMessage: processMessage}