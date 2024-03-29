import React, { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { NaurtRN } from "react-native-naurt-sdk";


const styles = StyleSheet.create(
  {
    button: {
      alignItems: "center",
      backgroundColor: "#DDDDDD",
      padding: 10
    }
  }
);

let naurt = new NaurtRN("YOUR API KEY HERE");
let naurtEventEmitter = naurt.getEventEmitter();



const ToggleButton = () => {

  const [isEnabled, setIsEnabled] = useState(false);
  
  const toggle = (naurt: NaurtRN) => {
    if (isEnabled) {
      naurt.endAnalyticsSession()
        .then(() => {
          console.log("Analytics session over")
        })
        .catch(error => {
          console.error(error);
          process.exit(1)
        });
      setIsEnabled(!isEnabled);
    } else {
      naurt.beginAnalyticsSession("{\"driver_id\":465752}").then(() => {
        console.log("Began analytics session");
      })
        .catch(error => {
          console.error(error);
          process.exit(1);
        })
      setIsEnabled(!isEnabled);
    }
  }

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => {
        toggle(naurt);
      }}>
        <Text>{isEnabled ? "Stop Naurt" : "Start Naurt"}</Text>
      </TouchableOpacity>
    </View>
  )
}



const NaurtComponent = () => {

  const [isInSession, setInSession] = useState(false);
  const [isValidated, setValidated] = useState(false);

  const [latitude, setLatitude] = useState("No latitudes yet");
  const [longitude, setLongitude] = useState("No longitudes yet");

  naurtEventEmitter.addListener("naurtDidUpdateLocation", (event) => {
    if (event === false) {
      console.log("Got a null update (maybe indoors, not converged &c)");
    } else {
      // You can parse with JSON
      let naurtData = JSON.parse(event);
      
      // Or you can use the interface
      // let naurtInterface = event as NaurtPoint;
      // console.log(naurtInterface);
      
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

  naurtEventEmitter.addListener("naurtUserLocationEnabledEvent", (event) => {
    console.log("User setting location services:", event);
  });
  
  return (

    <View>
      <Text>{isValidated ? "Naurt is validated" : "Naurt is not validated"}</Text>
      <Text>{isInSession ? "Naurt is in an analytics session" : "Naurt is not in an analytics session"}</Text>
      <Text>Lat: {latitude}, Lon: {longitude}</Text>
      <ToggleButton />
    </View>
  );


};

export default NaurtComponent;
