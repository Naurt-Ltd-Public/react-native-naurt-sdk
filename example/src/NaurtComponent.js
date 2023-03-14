import { locationUpdateEventEmitter, LOCATION_UPDATE_EVENT } from "example";
import React, { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    }
});
// let naurtEventEmitter = naurt.getEventEmitter();
let luevent = locationUpdateEventEmitter;
const ToggleButton = () => {
    const [isEnabled, _setIsEnabled] = useState(false);
    // const toggle = (luevent: EventEmitter) => {
    //   if (isEnabled) {
    //     naurt.endAnalyticsSession()
    //       .then(() => {
    //         console.log("Analytics session over")
    //       })
    //       .catch(error => {
    //         console.error(error);
    //         process.exit(1)
    //       });
    //     setIsEnabled(!isEnabled);
    //   } else {
    //     naurt.beginAnalyticsSession("{\"driver_id\":465752}").then(() => {
    //       console.log("Began analytics session");
    //     })
    //       .catch(error => {
    //         console.error(error);
    //         process.exit(1);
    //       })
    //     setIsEnabled(!isEnabled);
    //   }
    // }
    return (React.createElement(View, null,
        React.createElement(TouchableOpacity, { style: styles.button, onPress: () => {
                // toggle(naurt);
            } },
            React.createElement(Text, null, isEnabled ? "Stop Naurt" : "Start Naurt"))));
};
const NaurtComponent = () => {
    const [isInSession, setInSession] = useState(false);
    const [isValidated, setValidated] = useState(false);
    const [latitude, setLatitude] = useState("No latitudes yet");
    const [longitude, setLongitude] = useState("No longitudes yet");
    luevent.addListener(LOCATION_UPDATE_EVENT, (event) => {
        if (event === false) {
            console.log("Got a null update (maybe indoors, not converged &c)");
        }
        else {
            // You can parse with JSON
            let naurtData = JSON.parse(event);
            // Or you can use the interface
            // let naurtInterface = event as NaurtPoint;
            // console.log(naurtInterface);
            setLatitude(naurtData.latitude);
            setLongitude(naurtData.longitude);
        }
    });
    luevent.addListener("naurtDidUpdateValidation", (event) => {
        setValidated(event);
    });
    luevent.addListener("naurtDidUpdateAnalyticsSession", (event) => {
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
