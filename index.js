// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var { EventHubClient, EventPosition } = require('@azure/event-hubs');
let IoTHubTokenCredentials = require('azure-iot-digitaltwins-service').IoTHubTokenCredentials;
let DigitalTwinServiceClient = require('azure-iot-digitaltwins-service').DigitalTwinServiceClient;
let iothubreader = require('./eventProcessor');
const { propertiesCommandsAPI } = require('./HTTPServer');
const { verifiedTelemetryInit, processVerifiedTelemetryProperties } = require('./verifiedTelemetryProcessor');
var constants = require('./constants');

const credentials = new IoTHubTokenCredentials(constants.connectionString);
const dtServiceclient = new DigitalTwinServiceClient(credentials);

verifiedTelemetryInit();

EventHubClient.createFromIotHubConnectionString(constants.connectionString).then(function (client) {
    console.log("Successully created the EventHub Client from iothub connection string.");
    ehClient = client;
    return ehClient.getPartitionIds();
  }).then(function (ids) {
    console.log("The partition ids are: ", ids);
    return ids.map(function (id) {
      return ehClient.receive(id, iothubreader.processMessage, iothubreader.printError, { eventPosition: EventPosition.fromEnqueuedTime(Date.now()) });
    });
  }).catch(iothubreader.printError);

async function ProcessDigitalTwin() {
  const digitalTwin = await dtServiceclient.getDigitalTwin(constants.deviceId);
  processVerifiedTelemetryProperties(digitalTwin);
};

setInterval(ProcessDigitalTwin,10000);

propertiesCommandsAPI(dtServiceclient);