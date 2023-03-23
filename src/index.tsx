import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from "react-native";
import type { NaurtAndroidInterface, NaurtIosInterface } from "./interfaces";
// import type { NaurtPoint } from "./naurt-point";


export { NaurtPoint } from "./naurt-point";

export type NaurtAndroidEngineType = "standalone" | "service";

export class NaurtRN {

  naurt: NaurtAndroidInterface | NaurtIosInterface;
  apiKey: String;
  engineType: String | undefined;
  keepAlive: boolean;

  constructor(apiKey: String, engineType: String | undefined = undefined, keepAlive: boolean = false) {
    this.apiKey = apiKey;
    this.engineType = engineType;
    this.keepAlive = keepAlive;

    switch (Platform.OS) {
      case "android": {
        let naurtTemp = NativeModules.NaurtAndroid;
        this.naurt = naurtTemp as NaurtAndroidInterface;
        this.AndroidInitialise();
        break;
      }
      case "ios": {
        let naurtTemp = NativeModules.RNaurt;

        this.naurt = naurtTemp as NaurtIosInterface;
        this.IosInitialise();
        break;
      }
      default: {
        throw `Unsupported OS! ${Platform.OS}`;
      }
    }
  }

  IosInitialise(): Promise<void> {
    // You do not need to manually call this function! It is done implicitly as part of making NaurtRN   
    let naurtSDK = this.naurt as NaurtIosInterface;


    return new Promise((resolve, reject) => {
      naurtSDK.iOSInit(this.apiKey)
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(new Error(error));
        })
    });
  }

  // Android only function for initialising Naurt
  AndroidInitialise(): Boolean {
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
          var engine: String;
          if (this.engineType == undefined) {
            engine = "service";
          } else {
            engine = this.engineType;
          }
          naurtSDK.initialiseNaurt(this.apiKey, engine, this.keepAlive);
          return true;

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

  beginAnalyticsSession(metadata: String): Promise<void> {
    // You do not need to call this function to start getting locations from Naurt
    // This is only necessary if you wish to associate some kind of metadata to a particular journey
    // The metadata String MUST be a valid JSON or this will fail
    return new Promise((resolve, reject) => {
      this.naurt.beginAnalyticsSession(metadata)
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(new Error(error));
        })
    });
  }

  endAnalyticsSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.naurt.stopAnalyticsSession("")
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(new Error(error));
        })
    });
  }

  isValidated(): boolean {
    return this.naurt.getIsValidated();
  }

  getIsInAnalyticsSession(): boolean {
    return this.naurt.getIsInAnalyticsSession();
  }

  getDeviceUUID(): String | undefined {
    return this.naurt.getDeviceUUID();
  }

  getJourneyUUID(): String | undefined {
    // undefined indicates that there is no journey yet
    return this.naurt.getJourneyUUID();
  }

  getEventEmitter(): NativeEventEmitter {
    return new NativeEventEmitter(this.naurt);

  }

  setEmissionFrequency(frequency: number | undefined) {
    if (frequency == undefined) {
      this.naurt.setEmissionFrequency(0.0, true);
    } else {
      this.naurt.setEmissionFrequency(frequency, false);
    }
  }

  activateBatteryOptimisation(activate: Boolean) {
    if (Platform.OS == "android") {
      let naurt = this.naurt as NaurtAndroidInterface;
      naurt.activateBatteryOptimisation(activate);
    }
  }

  destroy() {
    this.naurt.destroy();
  }
}