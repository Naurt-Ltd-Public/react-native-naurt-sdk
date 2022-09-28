import React, { useEffect, useState } from 'react';
import { Text, useColorScheme, View, Switch } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import * as Naurt from 'react-native-naurt-sdk';
function RadioButton(props) {
    return (React.createElement(View, {
        style: [{
            height: 24,
            width: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: props.selected ? '#2A2' : '#A22',
            alignItems: 'center',
            justifyContent: 'center',
        }, props.style]
    }, props.selected ?
        React.createElement(View, {
            style: {
                height: 12,
                width: 12,
                borderRadius: 6,
                backgroundColor: '#2A2',
            }
        })
        : null));
}
const NaurtComponent = () => {
    let naurtEventEmitter;
    const [naurtDisplay, setNaurtDisplay] = useState(React.createElement(React.Fragment, null));
    const [naurtIsInitialised, setNaurtIsInitialised] = useState(false);
    const [naurtIsValidated, setNaurtIsValidated] = useState(false);
    const [naurtIsRunning, setNaurtIsRunning] = useState(false);
    const [naurtPoint, setNaurtPoint] = useState({
        latitude: 0.0,
        longitude: 0.0,
        timestamp: '',
        altitude: 0.0,
        heading: 0.0,
        headingAccuracy: 0.0,
        horizontalAccuracy: 0.0,
        horizontalCovariance: 0.0,
        speed: 0.0,
        speedAccuracy: 0.0,
        spoofReport: {
            mockAppsInstalled: false,
            mockSettingActive: false,
            mockedLocation: false
        },
        verticalAccuracy: 0.0
    });
    const isDarkMode = useColorScheme() === 'dark';
    useEffect(() => {
        naurtEventEmitter = Naurt.getEventEmitter();
        Naurt.coreInitialise("<API-KEY-HERE>", "service");
        naurtEventEmitter.addListener('NAURT_IS_INITIALISED', (event) => {
            console.log('NAURT_IS_INITIALISED: ' + event.isInitialised);
            setNaurtIsInitialised(event.isInitialised);
        });
        naurtEventEmitter.addListener('NAURT_IS_VALIDATED', (event) => {
            console.log('NAURT_IS_VALIDATED: ' + event.isValidated);
            setNaurtIsValidated(event.isValidated);
            Naurt.isValidated().then((v) => {
                console.log('NAURT_IS_VALIDATED_2: ' + v);
            });
        });
        naurtEventEmitter.addListener('NAURT_IS_RUNNING', (event) => {
            console.log('NAURT_IS_RUNNING: ' + event.isRunning);
            setNaurtIsRunning(event.isRunning);
            Naurt.isValidated().then((v) => {
                console.log('NAURT_IS_VALIDATED_2: ' + v);
            });
        });
        naurtEventEmitter.addListener('NAURT_NEW_POINT', (event) => {
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
                verticalAccuracy: event.verticalAccuracy
            });
        });
        return () => {
            Naurt.stop();
        };
    }, []);
    useEffect(() => {
        setNaurtDisplay(React.createElement(View, {
            style: {
                flex: 1,
                flexGrow: 1,
                flexDirection: "column"
            }
        },
            React.createElement(View, {
                style: {
                    flex: 1,
                    flexGrow: 1,
                    flexDirection: 'row',
                    margin: 8
                }
            },
                React.createElement(RadioButton, { selected: naurtIsInitialised }),
                React.createElement(Text, {
                    style: {
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'row',
                        // margin: 8
                        marginLeft: 8
                    }
                }, "isInitialised")),
            React.createElement(View, {
                style: {
                    flex: 1,
                    flexGrow: 1,
                    flexDirection: 'row',
                    margin: 8
                }
            },
                React.createElement(RadioButton, { selected: naurtIsValidated }),
                React.createElement(Text, {
                    style: {
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'row',
                        // margin: 8
                        marginLeft: 8
                    }
                }, "isValidated")),
            React.createElement(View, {
                style: {
                    flex: 1,
                    flexGrow: 1,
                    flexDirection: 'row',
                    margin: 8
                }
            },
                React.createElement(RadioButton, { selected: naurtIsRunning }),
                React.createElement(Text, {
                    style: {
                        flex: 1,
                        flexGrow: 1,
                        flexDirection: 'row',
                        // margin: 8
                        marginLeft: 8
                    }
                }, "isRunning")),
            React.createElement(Text, null, `${naurtPoint.timestamp}: Lat: ${naurtPoint.latitude}, Lon: ${naurtPoint.longitude}`)));
        return () => { };
    }, [naurtPoint, naurtIsInitialised, naurtIsRunning, naurtIsValidated]);
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState);
        console.log("Previous State: " + isEnabled);
        Naurt.isInitialised().then(isInitialised => {
            console.log("Is Initialised: " + isInitialised);
        });
        // As this toggle is always one state change behind the current, we need to inverse this boolean
        if (!isEnabled) {
            console.log("Starting...");
            Naurt.start().then(couldStart => {
                console.log("Could Start: " + couldStart);
                setNaurtIsRunning(couldStart);
            });
        }
        else {
            console.log("Stopping...");
            Naurt.stop().then(couldStop => {
                console.log("Could Stop: " + couldStop);
                // A good stop means this returns true, so we must invert the response
                setNaurtIsRunning(!couldStop);
            });
        }
    };
    return (React.createElement(View, {
        style: {
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }
    },
        React.createElement(View, {
            style: {
                flex: 1,
                flexDirection: "row",
                width: "100%",
                flexGrow: 1,
                backgroundColor: "#999999"
            }
        },
            React.createElement(Text, {
                style: {
                    left: 8,
                    fontSize: 32
                }
            }, "Naurt"),
            React.createElement(Switch, {
                trackColor: { false: "#767577", true: "#81b0ff" }, thumbColor: isEnabled ? "#f5dd4b" : "#f4f3f4", ios_backgroundColor: "#3e3e3e", onValueChange: toggleSwitch, value: isEnabled, style: {
                    flex: 1,
                    flexShrink: 0,
                    alignSelf: "flex-end",
                    margin: 8,
                    left: -24,
                    height: 32,
                    transform: [{ scale: 1.2 }]
                }
            })),
        naurtDisplay));
};
export default NaurtComponent;
