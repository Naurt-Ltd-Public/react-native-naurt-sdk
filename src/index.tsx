import {
  NativeModules,
  PermissionsAndroid,
  Platform,
} from "react-native";
import type { NaurtAndroidInterface, NaurtIosInterface } from "./interfaces";
import type { NaurtPoint } from "./naurt-point";


export { NaurtPoint } from "./naurt-point";


export type NaurtAndroidEngineType = "standalone" | "service";

export class NaurtRN {

  naurt: NaurtAndroidInterface | NaurtIosInterface;
  apiKey: String;

  constructor(apiKey: String) {
    this.apiKey = apiKey;

    switch (Platform.OS) {
      case "android": {
        let naurtTemp = NativeModules.NaurtAndroid;
        this.naurt = naurtTemp as NaurtAndroidInterface;
        break;
      }
      case "ios": {
        // TODO: Permissions requests in here
        let naurtTemp = NativeModules.NaurtIos;
        this.naurt = naurtTemp as NaurtIosInterface;
        break;
      }
      default: {
        throw `Unsupported OS! ${Platform.OS}`;
      }
    }
  }

  // Android only function for initialising Naurt
  // There is no equivalent for iOS as it initialises during object creation
  AndroidInitialise(naurtEngine: NaurtAndroidEngineType): Boolean {

    switch (Platform.OS) {
      case "android": {
        break;
      }
      default: {
        // TODO: better error handling
        throw "This method must only be called on Android platforms"
      }
    }
    let naurtSDK = this.naurt as NaurtAndroidInterface;
    PermissionsAndroid.requestMultiple([
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ])
      .then((result) => {
        let granted =
          result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
          result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'

        if (granted) {

          switch (naurtEngine) {
            case "standalone": {
              naurtSDK.initialiseNaurtStandalone(this.apiKey);
              return true;
            }
            case "service": {
              naurtSDK.initialiseNaurtService(this.apiKey);
              return true;
            }
          }
          
        } else {
          // TODO: Better error handling
          throw "initialiseNaurt | Missing Permissions!";
        }
      })
      .catch((err: any) => {
        throw `initialiseNaurt | error: ${err}`;
      });

    return false;
  }

  start() {
    this.naurt.start();
  }

  stop() {
    this.naurt.stop();
  }

  isInitialised(): boolean {
    return this.naurt.isInitialised();
  }

  isValidated(): boolean {
    return this.naurt.isValidated();
  }

  isRunning(): boolean {
    return this.naurt.isRunning();
  }

  getDeviceUUID(): String {
    return this.naurt.deviceUUID();
  }

  getJourneyUUID(): String | undefined {
    // undefined indicates that there is no journey yet
    return this.naurt.journeyUUID();
  }

  getLatestNaurtPoint() : NaurtPoint | undefined {
    // undefined indicates that there is not yet a naurt point
    return this.naurt.naurtPoint();
  }
}