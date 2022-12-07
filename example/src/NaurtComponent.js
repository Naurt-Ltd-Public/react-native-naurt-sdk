import React, { useEffect, useState } from 'react';
import { Text, useColorScheme, View, Switch, Platform } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NaurtRN } from 'react-native-naurt-sdk';
function RadioButton(props) {
    return (React.createElement(View, { style: [{
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: props.selected ? '#2A2' : '#A22',
                alignItems: 'center',
                justifyContent: 'center',
            }, props.style] }, props.selected ?
        React.createElement(View, { style: {
                height: 12,
                width: 12,
                borderRadius: 6,
                backgroundColor: '#2A2',
            } })
        : null));
}
const NaurtComponent = () => {
    let naurt = new NaurtRN("637475b9-e92e-4650-bece-822ca077af92-111be559-2294-4cdc-a305-586326170cdb");
    if (Platform.OS == "android") {
        naurt.AndroidInitialise("service");
    }
    else if (Platform.OS == "ios") {
        naurt.IosInitialise();
    }
    else {
        // TODO: Better error handling
        throw "This app is only intended for Android or iOS";
    }
    let naurtEventEmitter = naurt.getEventEmitter();
    const [naurtDisplay, setNaurtDisplay] = useState(React.createElement(React.Fragment, null));
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
    });
    const isDarkMode = useColorScheme() === 'dark';
    useEffect(() => {
        naurtEventEmitter.addListener('naurtDidUpdateInitialise', (event) => {
            console.log('naurtDidUpdateInitialise: ' + event.isInitialised);
            setNaurtIsInitialised(event.isInitialised);
        });
        naurtEventEmitter.addListener('naurtDidUpdateValidation', (event) => {
            console.log('naurtDidUpdateValidation: ' + event.isValidated);
            setNaurtIsValidated(event.isValidated);
        });
        naurtEventEmitter.addListener('naurtDidUpdateRunning', (event) => {
            console.log('naurtDidUpdateRunning: ' + event.isRunning);
            setNaurtIsRunning(event.isRunning);
        });
        naurtEventEmitter.addListener('naurtDidUpdateLocation', (event) => {
            console.log(`NAURT_NEW_POINT: [${event.latitude}, ${event.longitude}], ${event.timestamp}`);
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
        });
        return () => {
            naurt.stop();
        };
    }, []);
    useEffect(() => {
        setNaurtDisplay(React.createElement(View, { style: {
                flex: 1,
                flexGrow: 1,
                flexDirection: "column"
            } },
            React.createElement(View, { style: {
                    flex: 1,
                    flexGrow: 1,
                    flexDirection: 'row',
                    margin: 8
                } },
                React.createElement(RadioButton, { selected: naurtIsInitialised }),
                React.createElement(Text, { style: {
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'row',
                        // margin: 8
                        marginLeft: 8
                    } }, "isInitialised")),
            React.createElement(View, { style: {
                    flex: 1,
                    flexGrow: 1,
                    flexDirection: 'row',
                    margin: 8
                } },
                React.createElement(RadioButton, { selected: naurtIsValidated }),
                React.createElement(Text, { style: {
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'row',
                        // margin: 8
                        marginLeft: 8
                    } }, "isValidated")),
            React.createElement(View, { style: {
                    flex: 1,
                    flexGrow: 1,
                    flexDirection: 'row',
                    margin: 8
                } },
                React.createElement(RadioButton, { selected: naurtIsRunning }),
                React.createElement(Text, { style: {
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'row',
                        // margin: 8
                        marginLeft: 8
                    } }, "isRunning")),
            React.createElement(Text, null, `${naurtPoint.timestamp}: Lat: ${naurtPoint.latitude}, Lon: ${naurtPoint.longitude}`)));
        return () => { };
    }, [naurtPoint, naurtIsInitialised, naurtIsRunning, naurtIsValidated]);
    const toggleSwitch = () => {
        if (!naurtIsRunning) {
            naurt.start();
            setNaurtIsRunning(true);
        }
        else {
            naurt.stop();
            setNaurtIsRunning(false);
        }
    };
    return (React.createElement(View, { style: {
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
        } },
        React.createElement(View, { style: {
                flex: 1,
                flexDirection: "row",
                width: "100%",
                flexGrow: 1,
                backgroundColor: "#999999"
            } },
            React.createElement(Text, { style: {
                    left: 8,
                    fontSize: 32
                } }, "Naurt"),
            React.createElement(Switch, { trackColor: { false: "#767577", true: "#81b0ff" }, thumbColor: naurtIsRunning ? "#f5dd4b" : "#f4f3f4", ios_backgroundColor: "#3e3e3e", onValueChange: toggleSwitch, value: naurtIsRunning, style: {
                    flex: 1,
                    flexShrink: 0,
                    alignSelf: "flex-end",
                    margin: 8,
                    left: -24,
                    height: 32,
                    transform: [{ scale: 1.2 }]
                } })),
        naurtDisplay));
};
export default NaurtComponent;
