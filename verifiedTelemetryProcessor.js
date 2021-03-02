// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
let influxwriter = require('./influxWriter');
var constants = require('./constants');
var digitalTwinLocalCopy;

let checkVerifiedTelemetrySupport = function (telemetryName, additionalProperties) {

    var verifiedTelemetryComponentName = 'vT' + telemetryName; 
    if(additionalProperties.hasOwnProperty(verifiedTelemetryComponentName) || digitalTwinLocalCopy.hasOwnProperty(verifiedTelemetryComponentName))
    {
        return(true);
    }
    else
    {
        return(false);
    }
};

let getVerifiedTelemetryStatus = function (telemetryName, additionalProperties) {

    var verifiedTelemetryComponentName = 'vT' + telemetryName; 
    if(additionalProperties.hasOwnProperty(verifiedTelemetryComponentName))
    {
        console.log("Verified Telemetry Status fetched from Enriched Telemetry Message");
        return(additionalProperties[verifiedTelemetryComponentName])
    }
    else if(digitalTwinLocalCopy.hasOwnProperty(verifiedTelemetryComponentName))
    {
        console.log("Verified Telemetry Status fetched from Digital Twin");
        return(digitalTwinLocalCopy[verifiedTelemetryComponentName].telemetryStatus);
    }
    else
    {
        return(false);
    }
};

async function processVerifiedTelemetryProperties(dtServiceclient) {

    digitalTwinLocalCopy = await dtServiceclient.getDigitalTwin(constants.deviceId);

    if(digitalTwinLocalCopy.hasOwnProperty('deviceStatus'))
    {
        influxwriter.writePropertyToInfluxDB('deviceStatus', digitalTwinLocalCopy.deviceStatus, constants.deviceId, 'root', digitalTwinLocalCopy.$metadata.deviceStatus.lastUpdateTime);
    }

    if(digitalTwinLocalCopy.hasOwnProperty('enableVerifiedTelemetry'))
    {
        influxwriter.writePropertyToInfluxDB('enableVerifiedTelemetry', digitalTwinLocalCopy.enableVerifiedTelemetry, constants.deviceId, 'root', digitalTwinLocalCopy.$metadata.enableVerifiedTelemetry.lastUpdateTime);
    }
};

module.exports = { checkVerifiedTelemetrySupport: checkVerifiedTelemetrySupport, getVerifiedTelemetryStatus: getVerifiedTelemetryStatus, processVerifiedTelemetryProperties: processVerifiedTelemetryProperties}