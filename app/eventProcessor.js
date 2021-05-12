// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const influxwriter = require('./influxWriter')
const { checkVerifiedTelemetrySupport, getVerifiedTelemetryStatus } = require('./verifiedTelemetryProcessor')
const constants = require('./constants')

const printError = function (err)
{
    console.log(err.message)
}

const processMessage = function (message)
{
    // console.log(message);
    const body = message.body
    const additionalProperties = message.applicationProperties
    // console.log(additionalProperties);
    const deviceId = message.annotations['iothub-connection-device-id']
    let componentName = ''
    try
    {
        componentName = message.annotations['dt-subject']
    }
    catch (e)
    {
        componentName = 'Default Component'
    }
    console.log('Received Telemetry')
    if (deviceId === constants.deviceId)
    {
        console.log('Received Telemetry for device:', constants.deviceId)
        for (const key of Object.keys(body))
        {
            influxwriter.writeTelemetryToInfluxDB(
                key,
                body[key],
                deviceId,
                componentName,
                checkVerifiedTelemetrySupport(key, additionalProperties),
                getVerifiedTelemetryStatus(key, additionalProperties))
        }
    }
}

module.exports = { printError: printError, processMessage: processMessage }