// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const Influx = require("influx");

//So this is some generic influxDB schema for IoT Data.
const influx = new Influx.InfluxDB({
  host: "influxdb",
  database: "vt",
  schema: [
    {
      measurement: "telemetry_messages",
      fields: {
        jsonvalue: Influx.FieldType.STRING,
        jsonasnumber: Influx.FieldType.FLOAT,
      },
      tags: [
        "telemetry",
        "deviceId",
        "componentName",
        "verifiedTelemetrySupport",
        "verifiedTelemetryStatus",
      ],
    },
    {
      measurement: "property_messages",
      fields: {
        jsonvalue: Influx.FieldType.STRING,
        jsonasnumber: Influx.FieldType.FLOAT,
      },
      tags: ["property", "deviceId", "componentName"],
    },
  ],
});

/**
 * Writes a generic json key/value pair to InfluxDB...
 * @param {string} key key of the json pair
 * @param {string} value  value of the json pair
 * @param {string} deviceId iothub deviceId
 * @param {string} componentName component name
 * @param {string} verifiedTelemetrySupport verifiedTelemetrySupport
 * @param {string} verifiedTelemetryStatus verifiedTelemetryStatus
 */
let writeTelemetryToInfluxDB = function (
  key,
  value,
  deviceId,
  componentName,
  verifiedTelemetrySupport,
  verifiedTelemetryStatus
) {
  let parsedNumber = 0;
  try {
    parsedNumber = parseFloat(value);
    influx.writePoints([
      {
        measurement: "telemetry_messages",
        fields: { jsonvalue: value, jsonasnumber: parsedNumber },
        tags: {
          telemetry: key,
          deviceId: deviceId,
          componentName: componentName,
          verifiedTelemetrySupport: verifiedTelemetrySupport,
          verifiedTelemetryStatus: verifiedTelemetryStatus,
        },
      },
    ]);

    // console.log('Telemetry with key: ', key, ', value: ', parsedNumber, 'and vTStatus: ', verifiedTelemetryStatus, 'stored in DB');
  } catch (e) {
    //couldnt parse, so send string only
    influx.writePoints([
      {
        measurement: "telemetry_messages",
        fields: { jsonvalue: value },
        tags: {
          telemetry: key,
          deviceId: deviceId,
          componentName: componentName,
          verifiedTelemetrySupport: verifiedTelemetrySupport,
          verifiedTelemetryStatus: verifiedTelemetryStatus,
        },
      },
    ]);
    // console.log('PARSING ERROR!, ','Telemetry with key: ', key, ', string Value: ', value, 'and vTStatus: ', verifiedTelemetryStatus, 'stored in DB');
  }
};

let writePropertyToInfluxDB = function (
  key,
  value,
  deviceId,
  componentName,
  timestampString
) {
  let parsedNumber = 0;
  try {
    let parsedDatetime = Date.parse(timestampString);
    var adjustedstartTime = parsedDatetime;

    influx.writePoints(
      [
        {
          measurement: "property_messages",
          fields: { jsonvalue: value },
          tags: {
            property: key,
            deviceId: deviceId,
            componentName: componentName,
          },
          timestamp: adjustedstartTime,
        },
      ],
      {
        precision: "ms",
      }
    );
    console.log(
      "Property with key: ",
      key,
      "and value: ",
      value,
      "stored in DB"
    );
  } catch (e) {
    //couldnt parse, so send string only
    influx.writePoints([
      {
        measurement: "property_messages",
        fields: { jsonvalue: value },
        tags: {
          property: key,
          deviceId: deviceId,
          componentName: componentName,
        },
      },
    ]);
    console.log(
      "PARSING ERROR!, ",
      "Property with key: ",
      key,
      "and string Value: ",
      value,
      "stored in DB"
    );
  }
};

module.exports = {
  writeTelemetryToInfluxDB: writeTelemetryToInfluxDB,
  writePropertyToInfluxDB: writePropertyToInfluxDB,
};
