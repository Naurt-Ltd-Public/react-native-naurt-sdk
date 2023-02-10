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
    naurt.AndroidInitialise();
}
else if (Platform.OS == "ios") {
    // Don't need to do anything here!
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
            naurt.endAnalyticsSession()
                .then(() => {
                console.log("Analytics session over");
            })
                .catch(error => {
                console.error(error);
                process.exit(1);
            });
            setIsEnabled(!isEnabled);
        }
        else {
            naurt.beginAnalyticsSession("{\"hello\":\"kitty\"}").then(() => {
                console.log("Began analytics session");
            })
                .catch(error => {
                console.error(error);
                process.exit(1);
            });
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
    const [isInSession, setInSession] = useState(naurt.getIsInAnalyticsSession());
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
    naurtEventEmitter.addListener("naurtDidUpdateValidation", (event) => {
        setValidated(event);
    });
    naurtEventEmitter.addListener("naurtDidUpdateAnalyticsSession", (event) => {
        setInSession(event);
    });
    return (React.createElement(View, null,
        React.createElement(Text, null, isValidated ? "Naurt is validated" : "Naurt is not validated"),
        React.createElement(Text, null, isInSession ? "Naurt is in an analytics session" : "Naurt is not in an analytics session"),
        React.createElement(Text, null,
            "Lat: ",
            latitude,
            ", Lon: ",
            longitude),
        React.createElement(ToggleButton, null)));
};
export default NaurtComponent;
