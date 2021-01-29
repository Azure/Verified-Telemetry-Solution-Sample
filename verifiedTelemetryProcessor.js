// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
let influxwriter = require('./influxWriter');
const fs = require('fs');
var vTInfoInterfaceName = 'dtmi:azure:verifiedtelemetry:telemetryinfomation;1'
var constants = require('./constants');
var verifiedTelemetryData = {
    verifiedTelemetries: {},
};

let verifiedTelemetryInit = function () {
    let interfaceFile = fs.readFileSync(constants.interfaceFileName);
    let interface = JSON.parse(interfaceFile);
    interface.contents.forEach((component) => {
        if(component.schema == vTInfoInterfaceName)
        {
            var verifiedTelemetryComponentName = component.name;
            var verifiedTelemetryName = verifiedTelemetryComponentName.replace('vT', '');
            verifiedTelemetryData.verifiedTelemetries[verifiedTelemetryName] = false;
        }
    });
};

let processVerifiedTelemetry = function (key, body, componentName) {

    if (verifiedTelemetryData.verifiedTelemetries.hasOwnProperty(key))
    {
        influxwriter.writeTelemetryToInfluxDB(key, body[key], constants.deviceId, componentName, verifiedTelemetryData.verifiedTelemetries[key].toString());
        return true;
    }
    return false;
    
};

async function processVerifiedTelemetryProperties(digitalTwin) {

    for (var verifiedTelemetryName in verifiedTelemetryData.verifiedTelemetries) 
    {
        var verifiedTelemetryComponentName = 'vT' + verifiedTelemetryName; 
        console.log(verifiedTelemetryComponentName);
        if(digitalTwin.hasOwnProperty(verifiedTelemetryComponentName))
        {
            verifiedTelemetryData.verifiedTelemetries[verifiedTelemetryName] = digitalTwin[verifiedTelemetryComponentName].telemetryStatus;
            console.log(verifiedTelemetryName, 'Status : ',verifiedTelemetryData.verifiedTelemetries[verifiedTelemetryName]);
        }
    }
    if(digitalTwin.hasOwnProperty('deviceStatus'))
    {
        influxwriter.writePropertyToInfluxDB('deviceStatus', digitalTwin.deviceStatus, constants.deviceId, 'root', digitalTwin.$metadata.deviceStatus.lastUpdateTime);
    }
    if(digitalTwin.hasOwnProperty('enableVerifiedTelemetry'))
    {
        influxwriter.writePropertyToInfluxDB('enableVerifiedTelemetry', digitalTwin.enableVerifiedTelemetry, constants.deviceId, 'root', digitalTwin.$metadata.enableVerifiedTelemetry.lastUpdateTime);
    }
};

module.exports = { verifiedTelemetryInit: verifiedTelemetryInit, processVerifiedTelemetry: processVerifiedTelemetry, processVerifiedTelemetryProperties: processVerifiedTelemetryProperties}