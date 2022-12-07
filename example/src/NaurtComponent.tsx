import React, { useEffect, useState } from 'react';
import { Text, useColorScheme, View, Switch, Platform } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NaurtRN } from 'react-native-naurt-sdk';
import type { NaurtPoint, NaurtPointEvent, NaurtInitialisedEvent, NaurtRunningEvent, NaurtValidatedEvent  } from 'react-native-naurt-sdk';

function RadioButton(props: any) {
  return (
    <View style={[{
      height: 24,
      width: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: props.selected ? '#2A2' : '#A22',
      alignItems: 'center',
      justifyContent: 'center',
    }, props.style]}>
      {
        props.selected ?
          <View style={{
            height: 12,
            width: 12,
            borderRadius: 6,
            backgroundColor: '#2A2',
          }} />
          : null
      }
    </View>
  );
}


const NaurtComponent = () => {
  let naurt = new NaurtRN("637475b9-e92e-4650-bece-822ca077af92-111be559-2294-4cdc-a305-586326170cdb");

  if (Platform.OS == "android") {
    naurt.AndroidInitialise("service");
  } else if (Platform.OS == "ios") {
    naurt.IosInitialise();
  } else {
    // TODO: Better error handling
    throw "This app is only intended for Android or iOS";
  }
  let naurtEventEmitter = naurt.getEventEmitter();

    

  const [naurtDisplay, setNaurtDisplay] = useState(<></>);

  const [naurtIsInitialised, setNaurtIsInitialised] = useState(false);
  const [naurtIsValidated, setNaurtIsValidated] = useState(false);
  const [naurtIsRunning, setNaurtIsRunning] = useState(false);

  const [naurtPoint, setNaurtPoint] = useState({
    latitude: 0.0,
    longitude: 0.0,
    timestamp: 0.0,
    locationProviderTimestamp: undefined,
    horizontalAccuracy: 0.0,
    speed: 0.0,
    heading: 0.0,
    speedAccuracy: 0.0,
    headingAccuracy: 0.0,
    horizontalCovariance: 0.0,
    altitude: 0.0,
    verticalAccuracy: 0.0,
    cumulativeDistance: undefined,
    motionFlag: undefined,
    locationOrigin: undefined,
    environmentFlag: undefined,
    backgroundStatus: undefined
  } as NaurtPoint);

  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    

    naurtEventEmitter.addListener(
      'naurtDidUpdateInitialise',
      (event: NaurtInitialisedEvent) => {
        console.log('naurtDidUpdateInitialise: ' + event.isInitialised);
        setNaurtIsInitialised(event.isInitialised);
      }
    );

    naurtEventEmitter.addListener(
      'naurtDidUpdateValidation',
      (event: NaurtValidatedEvent) => {
        console.log('naurtDidUpdateValidation: ' + event.isValidated);
        setNaurtIsValidated(event.isValidated);
      }
    );

    naurtEventEmitter.addListener(
      'naurtDidUpdateRunning',
      (event: NaurtRunningEvent) => {
        console.log('naurtDidUpdateRunning: ' + event.isRunning);
        setNaurtIsRunning(event.isRunning);
      }
    );
    
    naurtEventEmitter.addListener(
      'naurtDidUpdateLocation',
      (event: NaurtPointEvent) => {
        console.log(
          `NAURT_NEW_POINT: [${event.latitude}, ${event.longitude}], ${event.timestamp}`
        );
        setNaurtPoint({
          latitude: event.latitude,
          longitude: event.longitude,
          timestamp: event.timestamp,
          altitude: event.latitude,
          heading: event.heading,
          headingAccuracy: event.headingAccuracy,
          horizontalAccuracy: event.horizontalAccuracy,
          horizontalCovariance: event.horizontalCovariance,
          speed: event.speed,
          speedAccuracy: event.speedAccuracy,
          verticalAccuracy: event.verticalAccuracy,
          platformOrigin: event.platformOrigin,
          locationProviderTimestamp: event.locationProviderTimestamp,
          motionFlag: event.motionFlag,
          cumulativeDistance: event.cumulativeDistance,
          locationOrigin: event.locationOrigin,
          environmentFlag: event.environmentFlag,
          backgroundStatus: event.backgroundStatus
        });
      }
    );

    return () => {
      naurt.stop();
    };
  }, []);

  useEffect(() => {
    setNaurtDisplay(
      <View
        style={{
          flex: 1,
          flexGrow: 1,
          flexDirection: "column"
        }}
      >
        <View style={{
          flex: 1,
          flexGrow: 1,
          flexDirection: 'row',
          margin: 8
        }}>
          <RadioButton selected={naurtIsInitialised} />
          <Text style={{
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            // margin: 8
            marginLeft: 8
          }}>isInitialised</Text>
        </View>
        <View style={{
          flex: 1,
          flexGrow: 1,
          flexDirection: 'row',
          margin: 8
        }}>
          <RadioButton selected={naurtIsValidated} />
          <Text style={{
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            // margin: 8
            marginLeft: 8
          }}>isValidated</Text>
        </View>
        <View style={{
          flex: 1,
          flexGrow: 1,
          flexDirection: 'row',
          margin: 8
        }}>
          <RadioButton selected={naurtIsRunning} />
          <Text style={{
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            // margin: 8
            marginLeft: 8
          }}>isRunning</Text>
        </View>

        <Text>{`${naurtPoint.timestamp}: Lat: ${naurtPoint.latitude}, Lon: ${naurtPoint.longitude}`}</Text>
      </View>
    );

    return () => { };
  }, [naurtPoint, naurtIsInitialised, naurtIsRunning, naurtIsValidated]);


  const toggleSwitch = () => {

    if (!naurtIsRunning) {
      naurt.start();
      setNaurtIsRunning(true);
    } else {
      naurt.stop();
      setNaurtIsRunning(false);
    }
  }

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? Colors.black : Colors.white,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          width: "100%",
          flexGrow: 1,
          backgroundColor: "#999999"
        }}
      >
        <Text
          style={{
            left: 8,
            fontSize: 32
          }}
        >Naurt</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={naurtIsRunning ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={naurtIsRunning}
          style={{
            flex: 1,
            flexShrink: 0,
            alignSelf: "flex-end",
            margin: 8,
            left: -24,
            height: 32,
            transform: [{ scale: 1.2 }]
          }}
        />
      </View>

      {naurtDisplay}
    </View>
  );
};

export default NaurtComponent;
