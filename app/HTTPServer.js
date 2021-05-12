// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const constants = require('./constants')
const http = require('http')
const { inspect } = require('util')
const url = require('url')
const PORT = 8080
const TYPE_PROPERTY = 'Property'
const TYPE_COMMAND = 'Command'
const ROOT_COMPONENT = 'Root'

const propertiesCommandsAPI = function (dtServiceclient)
{
    http.createServer(function (req, res)
    {
        res.writeHead(200, {})
        res.end()

        console.log('Received URL: %s', req.url)
        const query = url.parse(req.url, true).query

        console.log(query.type)
        console.log(query.componentName)
        console.log(query.methodName)
        console.log(query.value)

        if (query.type === TYPE_PROPERTY)
        {
            UpdateDigitalTwin(dtServiceclient, query.componentName, query.methodName, query.value)
            console.log('Updating Property..')
        }
        else if (query.type === TYPE_COMMAND)
        {
            SendCommand(dtServiceclient, query.componentName, query.methodName, query.value)
            console.log('Updating Command..')
        }
        res.end()
    }).listen(PORT)
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
    await dtServiceclient.updateDigitalTwin(constants.deviceId, patch)

    console.log('Patch has been successfully applied')
};

async function SendCommand (dtServiceclient, componentName, commandName, commandValue)
{
    const options = {
        connectTimeoutInSeconds: 0,
        responseTimeoutInSeconds: 30 // The responseTimeoutInSeconds must be within [5; 300]
    }
    let commandResponse
    if (componentName === ROOT_COMPONENT)
    {
        commandResponse = await dtServiceclient.invokeCommand(constants.deviceId, commandName, JSON.parse(commandValue), options)
    }
    else
    {
        commandResponse = await dtServiceclient.invokeComponentCommand(
            constants.deviceId, componentName, commandName, JSON.parse(commandValue), options)
    }

    // Print result of the command
    console.log(inspect(commandResponse))
};

module.exports = { propertiesCommandsAPI: propertiesCommandsAPI }