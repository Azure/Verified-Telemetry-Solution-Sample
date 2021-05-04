// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const {EventHubClient, EventPosition} = require("@azure/event-hubs");
const IoTHubTokenCredentials = require("azure-iothub").IoTHubTokenCredentials;
const DigitalTwinServiceClient = require("azure-iothub").DigitalTwinClient;
const iothubreader = require("./eventProcessor");
const {propertiesCommandsAPI} = require("./HTTPServer");
const {processVerifiedTelemetryProperties} = require("./verifiedTelemetryProcessor");
const constants = require("./constants");

async function main() {
  const credentials = new IoTHubTokenCredentials(constants.connectionString);
  const dtServiceclient = new DigitalTwinServiceClient(credentials);

  try {
    const client = await EventHubClient.createFromIotHubConnectionString(constants.connectionString);
    console.log("Successfully created the EventHub Client from iothub connection string.");

    const ids = await client.getPartitionIds();
    console.log("The partition ids are: ", ids);

    ids.map(function (id) {
      client.receive(id, iothubreader.processMessage, iothubreader.printError, {
        eventPosition: EventPosition.fromEnqueuedTime(Date.now()),
      });
    });
  } catch (err) {
    iothubreader.printError;
  }

  setInterval(processVerifiedTelemetryProperties, 10000, dtServiceclient);

  propertiesCommandsAPI(dtServiceclient);
}

main();
