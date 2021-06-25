// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const IoTHubTokenCredentials = require('azure-iothub').IoTHubTokenCredentials
const DigitalTwinServiceClient = require('azure-iothub').DigitalTwinClient
const influxwriter = require('./influxReaderWriter')
const iotHubConfiguration = require('./iotHubConfiguration')
let digitalTwinLocalCopy = {}

const checkVerifiedTelemetrySupport = function (telemetryName, additionalProperties)
{
    const verifiedTelemetryComponentName = 'vT' + telemetryName
    if (digitalTwinLocalCopy.hasOwnProperty(verifiedTelemetryComponentName) &&
        digitalTwinLocalCopy.hasOwnProperty('vTDevice') &&
        digitalTwinLocalCopy.vTDevice.hasOwnProperty('enableVerifiedTelemetry'))
    {
        if (digitalTwinLocalCopy[verifiedTelemetryComponentName].hasOwnProperty('fingerprintTemplate') &&
            digitalTwinLocalCopy.vTDevice.enableVerifiedTelemetry === true)
        {
            console.log('Verified Telemetry: Reference Fingerprint available')
            return (true)
        }
        else
        {
            console.log('Verified Telemetry: Reference Fingerprint not available')
            return (false)
        }
    }
    else
    {
        return (false)
    }
}

const getVerifiedTelemetryStatus = function (telemetryName, additionalProperties)
{
    const verifiedTelemetryComponentName = 'vT' + telemetryName
    if (additionalProperties.hasOwnProperty(verifiedTelemetryComponentName))
    {
        console.log('Verified Telemetry Status fetched from Enriched Telemetry Message')
        return (additionalProperties[verifiedTelemetryComponentName])
    }
    else if (digitalTwinLocalCopy.hasOwnProperty(verifiedTelemetryComponentName))
    {
        console.log('Verified Telemetry Status fetched from Digital Twin')
        return (digitalTwinLocalCopy[verifiedTelemetryComponentName].telemetryStatus)
    }
    else
    {
        return (false)
    }
}

async function processVerifiedTelemetryProperties ()
{
    let dtServiceclient
    try
    {
        const credentials = new IoTHubTokenCredentials(iotHubConfiguration.connectionString)
        dtServiceclient = new DigitalTwinServiceClient(credentials)
        digitalTwinLocalCopy = await dtServiceclient.getDigitalTwin(iotHubConfiguration.deviceId)
    }
    catch (error)
    {
        console.error('Error in fetching Digital Twin:', error)
    }

    if (digitalTwinLocalCopy.hasOwnProperty('vTDevice') &&
        digitalTwinLocalCopy.vTDevice.hasOwnProperty('enableVerifiedTelemetry'))
    {
        if (digitalTwinLocalCopy.hasOwnProperty('vTsoilMoistureExternal1') &&
            digitalTwinLocalCopy.hasOwnProperty('vTsoilMoistureExternal2'))
        {
            if (digitalTwinLocalCopy.vTsoilMoistureExternal1.hasOwnProperty('fingerprintTemplate') &&
                digitalTwinLocalCopy.vTsoilMoistureExternal2.hasOwnProperty('fingerprintTemplate') &&
                digitalTwinLocalCopy.vTDevice.enableVerifiedTelemetry === true)
            {
                influxwriter.writePropertyToInfluxDB(
                    'deviceStatus',
                    digitalTwinLocalCopy.vTDevice.deviceStatus,
                    iotHubConfiguration.deviceId,
                    'vTDevice',
                    digitalTwinLocalCopy.vTDevice.$metadata.deviceStatus.lastUpdateTime)
            }
            else
            {
                influxwriter.writePropertyToInfluxDB(
                    'deviceStatus',
                    'unknown',
                    iotHubConfiguration.deviceId,
                    'vTDevice',
                    digitalTwinLocalCopy.vTDevice.$metadata.deviceStatus.lastUpdateTime)
            }
        }
    }

    if (digitalTwinLocalCopy.hasOwnProperty('vTDevice'))
    {
        influxwriter.writePropertyToInfluxDB(
            'enableVerifiedTelemetry',
            digitalTwinLocalCopy.vTDevice.enableVerifiedTelemetry,
            iotHubConfiguration.deviceId,
            'vTDevice',
            digitalTwinLocalCopy.vTDevice.$metadata.enableVerifiedTelemetry.lastUpdateTime)
    }
    setTimeout(processVerifiedTelemetryProperties, 10000)
};

module.exports =
{
    checkVerifiedTelemetrySupport: checkVerifiedTelemetrySupport,
    getVerifiedTelemetryStatus: getVerifiedTelemetryStatus,
    processVerifiedTelemetryProperties: processVerifiedTelemetryProperties
}
