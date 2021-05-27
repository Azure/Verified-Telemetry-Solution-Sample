// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const Influx = require('influx')
const iotHubConfiguration = require('./iotHubConfiguration')

// So this is some generic influxDB schema for IoT Data.
const influx = new Influx.InfluxDB({
    host: 'influxdb',
    database: 'vt',
    schema: [
        {
            measurement: 'telemetry_messages',
            fields: {
                jsonvalue: Influx.FieldType.STRING,
                jsonasnumber: Influx.FieldType.FLOAT
            },
            tags: [
                'telemetry',
                'deviceId',
                'componentName',
                'verifiedTelemetrySupport',
                'verifiedTelemetryStatus'
            ]
        },
        {
            measurement: 'property_messages',
            fields: {
                jsonvalue: Influx.FieldType.STRING,
                jsonasnumber: Influx.FieldType.FLOAT
            },
            tags: [
                'property',
                'deviceId',
                'componentName'
            ]
        },
        {
            measurement: 'configuration',
            fields: {
                iothubconnectionstring: Influx.FieldType.STRING,
                deviceid: Influx.FieldType.STRING
            },
            tags: [
            ]
        }
    ]
})

const writeTelemetryToInfluxDB = function (key, value, deviceId, componentName, verifiedTelemetrySupport, verifiedTelemetryStatus)
{
    let parsedNumber = 0
    try
    {
        parsedNumber = parseFloat(value)
        influx.writePoints([
            {
                measurement: 'telemetry_messages',
                fields: { jsonvalue: value, jsonasnumber: parsedNumber },
                tags: {
                    telemetry: key,
                    deviceId: deviceId,
                    componentName: componentName,
                    verifiedTelemetrySupport: verifiedTelemetrySupport,
                    verifiedTelemetryStatus: verifiedTelemetryStatus
                }
            }]
        )

    // console.log('Telemetry with key: ',
    //     key, ', value: ', parsedNumber, 'and vTStatus: ', verifiedTelemetryStatus, 'stored in DB');
    }
    catch (e)
    {
    // couldn't parse, so send string only
        influx.writePoints([
            {
                measurement: 'telemetry_messages',
                fields: { jsonvalue: value },
                tags: {
                    telemetry: key,
                    deviceId: deviceId,
                    componentName: componentName,
                    verifiedTelemetrySupport: verifiedTelemetrySupport,
                    verifiedTelemetryStatus: verifiedTelemetryStatus
                }
            }
        ])
    // console.log('PARSING ERROR!, ','Telemetry with key: ',
    //     key, ', string Value: ', value, 'and vTStatus: ', verifiedTelemetryStatus, 'stored in DB');
    }
}

const writePropertyToInfluxDB = function (key, value, deviceId, componentName, timestampString)
{
    try
    {
        const parsedDatetime = Date.parse(timestampString)
        const adjustedstartTime = parsedDatetime

        influx.writePoints([
            {
                measurement: 'property_messages',
                fields: { jsonvalue: value },
                tags: { property: key, deviceId: deviceId, componentName: componentName },
                timestamp: adjustedstartTime
            }],
        {
            precision: 'ms'
        }
        )
        console.log('Property with key: ', key, 'and value: ', value, 'stored in DB')
    }
    catch (e)
    {
    // couldnt parse, so send string only
        influx.writePoints([
            {
                measurement: 'property_messages',
                fields: { jsonvalue: value },
                tags: { property: key, deviceId: deviceId, componentName: componentName }
            }
        ])
        console.log('PARSING ERROR!, ', 'Property with key: ', key, 'and string Value: ', value, 'stored in DB')
    }
}

const writeIoTHubConfigurationToInfluxDB = function (connectionString, deviceID)
{
    try
    {

        influx.writePoints([
            {
                measurement: 'configuration',
                fields: { iothubconnectionstring: connectionString, deviceid: deviceID},
                tags: {},
            }],
        {
            precision: 'ms'
        }
        )
        console.log('Configuration with connection string: ', connectionString, 'and device ID: ', deviceID, 'stored in DB')
    }
    catch (e)
    {
    
        console.log('PARSING ERROR:', e)
    }
}

const readIoTHubConfigurationFromInfluxDB = function ()
{
    influx.query(`SELECT * FROM configuration GROUP BY * ORDER BY DESC LIMIT 1`).then(results => {
        console.log(results)
        console.log("Connection String: ", results[0].iothubconnectionstring)
        console.log("Device ID: ", results[0].deviceid)
        iotHubConfiguration.connectionString = results[0].iothubconnectionstring
        iotHubConfiguration.deviceId =  results[0].deviceid
      }).catch(error => {
        console.log(error)
      });
}

module.exports = { writeTelemetryToInfluxDB: writeTelemetryToInfluxDB, writePropertyToInfluxDB: writePropertyToInfluxDB, writeIoTHubConfigurationToInfluxDB: writeIoTHubConfigurationToInfluxDB, readIoTHubConfigurationFromInfluxDB: readIoTHubConfigurationFromInfluxDB }
