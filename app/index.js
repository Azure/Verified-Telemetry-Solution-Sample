// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { EventHubClient, EventPosition } = require('@azure/event-hubs')
const IoTHubTokenCredentials = require('azure-iothub').IoTHubTokenCredentials
const DigitalTwinServiceClient = require('azure-iothub').DigitalTwinClient
const iothubreader = require('./eventProcessor')
const { propertiesCommandsAPI } = require('./HTTPServer')
const { processVerifiedTelemetryProperties } = require('./verifiedTelemetryProcessor')
const constants = require('./constants')

const credentials = new IoTHubTokenCredentials(constants.connectionString)
const dtServiceclient = new DigitalTwinServiceClient(credentials)

let ehClient

EventHubClient.createFromIotHubConnectionString(constants.connectionString).then(function (client)
{
    console.log('Successfully created the EventHub Client from iothub connection string.')
    ehClient = client
    return ehClient.getPartitionIds()
}).then(function (ids)
{
    console.log('The partition ids are: ', ids)
    return ids.map(function (id)
    {
        return ehClient.receive(id, iothubreader.processMessage, iothubreader.printError,
            { eventPosition: EventPosition.fromEnqueuedTime(Date.now()) }
        )
    })
}).catch(iothubreader.printError)

setInterval(processVerifiedTelemetryProperties, 10000, dtServiceclient)

propertiesCommandsAPI(dtServiceclient)