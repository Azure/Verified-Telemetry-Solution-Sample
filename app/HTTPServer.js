// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const express = require('express')
const IoTHubTokenCredentials = require('azure-iothub').IoTHubTokenCredentials
const DigitalTwinServiceClient = require('azure-iothub').DigitalTwinClient
const { parseConnectionString } = require('rhea-promise')

const { inspect } = require('util')
const url = require('url')
const path = require('path')
const iotHubConfiguration = require('./iotHubConfiguration')
const influxwriter = require('./influxReaderWriter')

const TYPE_PROPERTY = 'Property'
const TYPE_COMMAND = 'Command'
const ROOT_COMPONENT = 'Root'

async function expressAppConfig ()
{
    const app = express()
    app.use(express.urlencoded())

    app.get('/', function (req, res)
    {
        res.redirect('http://localhost:8080/configuration-form')
    })

    app.get('/configuration-form', function (req, res)
    {
        res.sendFile(path.join(__dirname, './form.html'))
    })

    app.post('/submit-form', function (req, res)
    {
        let body = ''
        console.log('Form Submitted!')
        console.log('Connection String: ', req.body.connectionstring)
        console.log('Device ID: ', req.body.deviceid)

        const { HostName, SharedAccessKeyName, SharedAccessKey } = parseConnectionString(
            req.body.connectionstring
        )
        // Verify that the required info is in the connection string.
        if (!HostName || !SharedAccessKey || !SharedAccessKeyName)
        {
            body = 'Invalid IoT Hub Connection String! <a href="http://localhost:8080/configuration-form">Reopen Solution Sample Configuration</a>'
            console.log('Connection String Invalid!')
        }
        else
        {
            body = 'Solution Configured! <a href="http://localhost:3030/">Open Solution Sample</a>'
            console.log('Connection String Valid!')
        }

        iotHubConfiguration.connectionString = req.body.connectionstring
        iotHubConfiguration.deviceId = req.body.deviceid
        influxwriter.writeIoTHubConfigurationToInfluxDB(iotHubConfiguration.connectionString, iotHubConfiguration.deviceId)

        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/html'
        })
        res.end(body)
    })

    app.get('/properties-commands', function (req, res)
    {
        propertiesCommandsAPI(req, res)
    })

    app.listen(8080)
}

const propertiesCommandsAPI = function (req, res)
{
    res.writeHead(200, {})
    res.end()

    console.log('Received URL: %s', req.url)
    const query = url.parse(req.url, true).query

    console.log(query.type)
    console.log(query.componentName)
    console.log(query.methodName)
    console.log(query.value)

    let dtServiceclient
    try
    {
        const credentials = new IoTHubTokenCredentials(iotHubConfiguration.connectionString)
        dtServiceclient = new DigitalTwinServiceClient(credentials)
    }
    catch (error)
    {
        console.error('Error in fetching Digital Twin Client:', error)
    }

    if (query.type === TYPE_PROPERTY)
    {
        console.log('Updating Property..')
        UpdateDigitalTwin(dtServiceclient, query.componentName, query.methodName, query.value)
    }
    else if (query.type === TYPE_COMMAND)
    {
        console.log('Updating Command..')
        SendCommand(dtServiceclient, query.componentName, query.methodName, query.value)
    }
    res.end()
}

async function UpdateDigitalTwin (dtServiceclient, componentName, propertyName, propertyValue)
{
    let patch
    if (componentName === ROOT_COMPONENT)
    {
        patch = [{
            op: 'add',
            path: '/' + propertyName,
            value: JSON.parse(propertyValue)
        }]
    }
    else
    {
        patch = [{
            op: 'add',
            path: '/' + componentName + '/' + propertyName,
            value: JSON.parse(propertyValue)
        }]
    }

    console.log(patch)
    try
    {
        await dtServiceclient.updateDigitalTwin(iotHubConfiguration.deviceId, patch).then(function ()
        {
            console.log('Patch has been successfully applied')
        })
    }
    catch
    {
        console.error('Error in updating Digital Twin')
    }
};

async function SendCommand (dtServiceclient, componentName, commandName, commandValue)
{
    const options = {
        connectTimeoutInSeconds: 0,
        responseTimeoutInSeconds: 30 // The responseTimeoutInSeconds must be within [5; 300]
    }
    let commandResponse

    try
    {
        if (componentName === ROOT_COMPONENT)
        {
            commandResponse = await dtServiceclient.invokeCommand(iotHubConfiguration.deviceId, commandName, JSON.parse(commandValue), options).then(function ()
            {
                console.log(inspect(commandResponse))
            })
        }
        else
        {
            commandResponse = await dtServiceclient.invokeComponentCommand(
                iotHubConfiguration.deviceId, componentName, commandName, JSON.parse(commandValue), options).then(function ()
            {
                console.log(inspect(commandResponse))
            })
        }
    }
    catch
    {
        console.error('Error in invoking Command')
    }
};

module.exports = { expressAppConfig: expressAppConfig }
