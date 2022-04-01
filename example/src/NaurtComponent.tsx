import React, { useEffect, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as naurt from 'react-native-naurt-sdk';
import Config from 'react-native-config';
import {
  NaurtValidatedEvent,
  NaurtRunningEvent,
  NaurtPointEvent,
  NaurtPoint,
  NaurtInitialisedEvent,
} from 'react-native-naurt-sdk';

const NaurtComponent = () => {
  let naurtEventEmitter;

  const [naurtDisplay, setNaurtDisplay] = useState(<></>);

  const [naurtIsInitialised, setNaurtIsInitialised] = useState(false);
  const [naurtIsValidated, setNaurtIsValidated] = useState(false);
  const [naurtIsRunning, setNaurtIsRunning] = useState(false);
  const [naurtPoint, setNaurtPoint] = useState({
    latitude: 0.0,
    longitude: 0.0,
    timestamp: '',
  } as NaurtPoint);

  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    console.log(naurt.getNaurtEvents());
    naurtEventEmitter = naurt.getNaurtEventEmitter();
    naurt.initialiseNaurt(Config.API_KEY);

    naurtEventEmitter.addListener(
      'NAURT_IS_INITIALISED',
      (event: NaurtInitialisedEvent) => {
        console.log('NAURT_IS_INITIALISED: ' + event.isInitialised);
        setNaurtIsInitialised(event.isInitialised);
      }
    );

    naurtEventEmitter.addListener(
      'NAURT_IS_VALIDATED',
      (event: NaurtValidatedEvent) => {
        console.log('NAURT_IS_VALIDATED: ' + event.isValidated);
        setNaurtIsValidated(event.isValidated);

        if (!naurtIsRunning) {
          // Simple Start here, post initialisation
          naurt.startNaurt();
        }
      }
    );

    naurtEventEmitter.addListener(
      'NAURT_IS_RUNNING',
      (event: NaurtRunningEvent) => {
        console.log('NAURT_IS_RUNNING: ' + event.isRunning);
        setNaurtIsRunning(event.isRunning);
      }
    );

    naurtEventEmitter.addListener(
      'NAURT_NEW_POINT',
      (event: NaurtPointEvent) => {
        console.log(
          `NAURT_NEW_POINT: [${event.latitude}, ${event.longitude}], ${event.timestamp}`
        );
        setNaurtPoint({
          latitude: event.latitude,
          longitude: event.longitude,
          timestamp: event.timestamp,
        });
      }
    );

    return () => {
      naurt.stopNaurt();
    };
  }, []);

  useEffect(() => {
    setNaurtDisplay(
      <Text>{`${naurtPoint.timestamp}: Lat: ${naurtPoint.latitude}, Lon: ${naurtPoint.longitude}`}</Text>
    );

    return () => {};
  }, [naurtPoint]);

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? Colors.black : Colors.white,
      }}
    >
      {naurtDisplay}
    </View>
  );
};

export default NaurtComponent;
