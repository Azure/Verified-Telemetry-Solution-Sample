// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { EventHubClient, EventPosition } = require('@azure/event-hubs')
const influxwriter = require('./influxReaderWriter')
const { checkVerifiedTelemetrySupport, getVerifiedTelemetryStatus } = require('./verifiedTelemetryProcessor')
const iotHubConfiguration = require('./iotHubConfiguration')

const printError = function (err)
{
    console.log(err.message)
}

const printErrorRetry = function (err)
{
    console.log(err.message)
    setTimeout(eventHubReader, 5000)
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
    if (deviceId === iotHubConfiguration.deviceId)
    {
        console.log('Received Telemetry for device:', iotHubConfiguration.deviceId)
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

async function eventHubReader ()
{
    let ehClient

    EventHubClient.createFromIotHubConnectionString(iotHubConfiguration.connectionString).then(function (client)
    {
        console.log('Successfully created the EventHub Client from iothub connection string.')
        ehClient = client
        return ehClient.getPartitionIds()
    }).then(function (ids)
    {
        console.log('The partition ids are: ', ids)
        return ids.map(function (id)
        {
            return ehClient.receive(id, processMessage, printError,
                { eventPosition: EventPosition.fromEnqueuedTime(Date.now()) }
            )
        })
    }).catch(printErrorRetry)
}

module.exports = { eventHubReader: eventHubReader }
