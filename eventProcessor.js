// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
let influxwriter = require('./influxWriter');
const { checkVerifiedTelemetrySupport, getVerifiedTelemetryStatus } = require('./verifiedTelemetryProcessor');
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
            influxwriter.writeTelemetryToInfluxDB(key, body[key], deviceId,componentName, checkVerifiedTelemetrySupport(key), getVerifiedTelemetryStatus(key));
        }
    }
    
};

module.exports = { printError: printError, processMessage: processMessage}