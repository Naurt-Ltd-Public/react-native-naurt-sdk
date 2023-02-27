import  React, {useState} from "react";
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { NaurtRN } from 'react-native-naurt-sdk';

const styles = StyleSheet.create(
  {
    button: {
      alignItems: "center",
      backgroundColor: "#DDDDDD",
      padding: 10
    }
  }
);

let naurt = new NaurtRN("YOUR APIKEY HERE");

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
      naurt.beginAnalyticsSession("{\"hello\":\"kitty\"}").then(() => {
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
  
  const [latitude, setLatitude] = useState("No latitudes yet");
  const [longitude, setLongitude] = useState("No longitudes yet");
  const [isInSession, setInSession] = useState(naurt.getIsInAnalyticsSession());
  const [isValidated, setValidated] = useState(naurt.isValidated());

  naurtEventEmitter.addListener("naurtDidUpdateLocation", (event) => {
    if (event === false) {
      console.log("Got a null update (maybe indoors, not converged &c)");
    } else {
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


  return (

    <View>
      
      <Text>{isValidated ? "Naurt is validated" : "Naurt is not validated"}</Text>
      <Text>{isInSession ? "Naurt is in an analytics session" : "Naurt is not in an analytics session"}</Text>
      <Text>Lat: {latitude}, Lon: {longitude}</Text>
      <ToggleButton  />
    </View>
  );


};

export default NaurtComponent;
