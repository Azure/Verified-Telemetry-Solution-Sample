// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { eventHubReader } = require('./eventProcessor')
const { expressAppConfig } = require('./HTTPServer')
const { processVerifiedTelemetryProperties } = require('./verifiedTelemetryProcessor')
const { readIoTHubConfigurationFromInfluxDB } = require('./influxReaderWriter')

setTimeout(readIoTHubConfigurationFromInfluxDB, 20000)

expressAppConfig()

eventHubReader()

processVerifiedTelemetryProperties()
