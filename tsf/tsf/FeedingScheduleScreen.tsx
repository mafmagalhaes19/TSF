import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Button } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const FeedingScheduleScreen = () => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const bleManager = new BleManager();

  useEffect(() => {
    // Start scanning for nearby BLE devices when the component mounts
    startScan();

    // Stop scanning and clean up when the component unmounts
    return () => stopScan();
  }, []);

  const startScan = () => {
    setIsScanning(true);
    setAvailableDevices([]);

    // Scan for BLE devices
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error while scanning:', error);
        setIsScanning(false);
        return;
      }

      // Filter for Arduino devices based on device name or other criteria
      // Replace 'Arduino' with a substring that identifies your Arduino devices
      if (device.name && device.name.includes('Arduino')) {
        setAvailableDevices((prevDevices) => {
          // Add the device to the list if it's not already present
          if (!prevDevices.some((prevDevice) => prevDevice.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
  };

  const stopScan = () => {
    setIsScanning(false);
    bleManager.stopDeviceScan();
  };

  const handleConnectToDevice = (device) => {
    // Connect to the selected Arduino device
    bleManager.connectToDevice(device.id)
      .then((connectedDevice) => {
        console.log('Connected to the Arduino:', connectedDevice.name);

        // Perform any necessary operations with the connected device here

        // Show a success message to the user
        Alert.alert('Success', 'Connected to the Arduino successfully!');
      })
      .catch((error) => {
        console.error('Error while connecting to Arduino:', error);
        // Show an error message to the user
        Alert.alert('Error', 'Failed to connect to Arduino. Please make sure it is in range and try again.');
      });
  };

  const handleRetryScan = () => {
    // Retry scanning for nearby BLE devices
    startScan();
  };

  return (
    <View>
      {isScanning ? (
        <>
          <Text>Scanning for Arduinos...</Text>
          <Button title="Stop Scan" onPress={stopScan} />
        </>
      ) : (
        <>
          {availableDevices.length === 0 ? (
            <Text>No Arduinos found nearby</Text>
          ) : (
            <FlatList
              data={availableDevices}
              keyExtractor={(device) => device.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleConnectToDevice(item)}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <Button title="Retry Scan" onPress={handleRetryScan} />
        </>
      )}
    </View>
  );
};

export default FeedingScheduleScreen;
