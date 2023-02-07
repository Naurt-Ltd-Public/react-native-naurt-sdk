import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, } from "react-native";
// import type { NaurtPoint } from "./naurt-point";
export {} from "./naurt-point";
export {} from "./events";
export class NaurtRN {
    naurt;
    apiKey;
    constructor(apiKey) {
        console.log("I am creating Naurt");
        this.apiKey = apiKey;
        switch (Platform.OS) {
            case "android": {
                let naurtTemp = NativeModules.NaurtAndroid;
                this.naurt = naurtTemp;
                break;
            }
            case "ios": {
                let naurtTemp = NativeModules.RNaurt;
                this.naurt = naurtTemp;
                this.IosInitialise();
                break;
            }
            default: {
                throw `Unsupported OS! ${Platform.OS}`;
            }
        }
    }
    IosInitialise() {
        // You do not need to manually call this function! It is done implicitly as part of making NaurtRN   
        let naurtSDK = this.naurt;
        return new Promise((resolve, reject) => {
            naurtSDK.iOSInit(this.apiKey)
                .then(() => {
                resolve();
            })
                .catch(error => {
                reject(new Error(error));
            });
        });
    }
    // Android only function for initialising Naurt
    AndroidInitialise() {
        console.log("I am initialising Naurt");
        switch (Platform.OS) {
            case "android": {
                break;
            }
            default: {
                // TODO: better error handling
                throw "This method must only be called on Android platforms";
            }
        }
        let naurtSDK = this.naurt;
        PermissionsAndroid.requestMultiple([
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.ACCESS_COARSE_LOCATION',
        ])
            .then((result) => {
            let granted = result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
                result['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
            if (granted) {
                naurtSDK.initialiseNaurtService(this.apiKey);
                return true;
            }
            else {
                // TODO: Better error handling
                throw "initialiseNaurt | Missing Permissions!";
            }
        })
            .catch((err) => {
            throw `initialiseNaurt | error: ${err}`;
        });
        return false;
    }
    beginAnalyticsSession(metadata) {
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
            });
        });
    }
    endAnalyticsSession() {
        return new Promise((resolve, reject) => {
            this.naurt.stopAnalyticsSession("")
                .then(() => {
                resolve();
            })
                .catch(error => {
                reject(new Error(error));
            });
        });
    }
    isValidated() {
        return this.naurt.getIsValidated();
    }
    getIsInAnalyticsSession() {
        return this.naurt.getIsInAnalyticsSession();
    }
    getDeviceUUID() {
        return this.naurt.getDeviceUUID();
    }
    getJourneyUUID() {
        // undefined indicates that there is no journey yet
        return this.naurt.getJourneyUUID();
    }
    getEventEmitter() {
        return new NativeEventEmitter(this.naurt);
    }
}
