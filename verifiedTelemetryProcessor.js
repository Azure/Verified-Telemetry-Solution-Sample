// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const influxwriter = require('./influxWriter')
const constants = require('./constants')
let digitalTwinLocalCopy

const checkVerifiedTelemetrySupport = function (telemetryName, additionalProperties)
{
    const verifiedTelemetryComponentName = 'vT' + telemetryName
    if (digitalTwinLocalCopy.hasOwnProperty(verifiedTelemetryComponentName) &&
        digitalTwinLocalCopy.hasOwnProperty('vTDevice') &&
        digitalTwinLocalCopy.vTDevice.hasOwnProperty('enableVerifiedTelemetry'))
    {
        console.log('Verified Telemetry: Entering New loop 2')
        if (digitalTwinLocalCopy[verifiedTelemetryComponentName].hasOwnProperty('fingerprintTemplate') &&
            digitalTwinLocalCopy.vTDevice.enableVerifiedTelemetry === true)
        {
            console.log('Verified Telemetry: Reference Fingerprint not collected')
            return (true)
        }
        else
        {
            console.log('Verified Telemetry: Reference Fingerprint collected')
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

async function processVerifiedTelemetryProperties (dtServiceclient)
{
    digitalTwinLocalCopy = await dtServiceclient.getDigitalTwin(constants.deviceId)

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
                    constants.deviceId,
                    'vTDevice',
                    digitalTwinLocalCopy.vTDevice.$metadata.deviceStatus.lastUpdateTime)
            }
            else
            {
                influxwriter.writePropertyToInfluxDB(
                    'deviceStatus',
                    'unknown',
                    constants.deviceId,
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
            constants.deviceId,
            'vTDevice',
            digitalTwinLocalCopy.vTDevice.$metadata.enableVerifiedTelemetry.lastUpdateTime)
    }
};

module.exports =
{
    checkVerifiedTelemetrySupport: checkVerifiedTelemetrySupport,
    getVerifiedTelemetryStatus: getVerifiedTelemetryStatus,
    processVerifiedTelemetryProperties: processVerifiedTelemetryProperties
}
