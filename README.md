# Verified Telemetry Solution Sample
- This guide showcases how the Verified Telemetry features can be utilised in real world scenarios.

# [Verified Telemetry Library](https://github.com/Azure/Verified-Telemetry)
- Verified Telemetry is a state-of-the-art solution to determine the working of the sensor, i.e., working or faulty, consequently used to determine the quality of the sensed data. 
- This is achieved by devising an intelligent fingerprint for a sensor to determine the status of the sensor.  
- The sensor fingerprint captures electrical properties of the sensor such as voltage and current using seamless software code running on the IoT device. 

# [Verified Telemetry Device Samples](https://github.com/Azure/Verified-Telemetry-Device-Sample)
- These Getting Started guides shows device developers how to include Verified Telemetry with Azure IoT on Azure RTOS.

# Instructions to get Solution Template Running with Verified Telemetry Sample
## Setup Docker Desktop
## Edit [constants](./constants.js) file to set user defined values
|Constant name|Value|
|-------------|-----|
|`connectionString` |{*Your IoT Hub Connection String*}|
|`deviceId` |{*Your device ID*}|

## Run the following commands

```shell
docker-compose up -d
```

## Open your browser and navigate to below URL
> http://localhost:3030

![Login Page](./media/login.png)

|Credential|Default Value|
|-------------|-----|
|`username` |admin|
|`password` |admin|

## View the Dashboard
-  Search for "Verified Telemetry" Dashboard

-  Select your device

![Dashboard](./media/dashboard.png)
