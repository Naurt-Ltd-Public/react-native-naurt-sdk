import React, { useState } from "react";
import { Text, View, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { NaurtRN } from 'react-native-naurt-sdk';
const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    }
});
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
const ToggleButton = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggle = (naurt) => {
        if (isEnabled) {
            naurt.stop();
            setIsEnabled(!isEnabled);
        }
        else {
            naurt.start();
            setIsEnabled(!isEnabled);
        }
    };
    return (React.createElement(View, null,
        React.createElement(TouchableOpacity, { style: styles.button, onPress: () => {
                toggle(naurt);
            } },
            React.createElement(Text, null, isEnabled ? "Stop Naurt" : "Start Naurt"))));
};
const NaurtComponent = () => {
    const [latitude, setLatitude] = useState("No latitudes yet");
    const [longitude, setLongitude] = useState("No longitudes yet");
    const [isRunning, setRunning] = useState(naurt.isRunning());
    const [isInitialised, setInitialised] = useState(true); // There's a bit of a chicken and egg on this one
    const [isValidated, setValidated] = useState(naurt.isValidated());
    naurtEventEmitter.addListener("naurtDidUpdateLocation", (event) => {
        if (event === false) {
            console.log("Got a null update (maybe indoors, not converged &c)");
        }
        else {
            let naurtData = JSON.parse(event);
            setLatitude(naurtData.latitude);
            setLongitude(naurtData.longitude);
        }
    });
    naurtEventEmitter.addListener("naurtDidUpdateInitialise", (event) => {
        console.log("The event I'm getting is initalise", event);
        console.log(event);
        // TODO: Why does it sometimes come as null and others as undefined?
        setInitialised(event);
    });
    naurtEventEmitter.addListener("naurtDidUpdateValidation", (event) => {
        console.log("The event I'm getting is validation", event);
        // TODO: Why does it sometimes come as null and others as undefined?
        setValidated(event);
    });
    naurtEventEmitter.addListener("naurtDidUpdateRunning", (event) => {
        // TODO: Why does it sometimes come as null and others as undefined?
        console.log("The event I'm getting is running", event);
        setRunning(event);
    });
    return (React.createElement(View, null,
        React.createElement(Text, null, isInitialised ? "Naurt is initialised" : "Naurt is not initialised"),
        React.createElement(Text, null, isValidated ? "Naurt is validated" : "Naurt is not validated"),
        React.createElement(Text, null, isRunning ? "Naurt is running" : "Naurt is not running"),
        React.createElement(Text, null,
            "Lat: ",
            latitude,
            ", Lon: ",
            longitude),
        React.createElement(ToggleButton, null)));
};
export default NaurtComponent;
