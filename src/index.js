import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, } from "react-native";
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
                break;
            }
            default: {
                throw `Unsupported OS! ${Platform.OS}`;
            }
        }
    }
    IosInitialise() {
        switch (Platform.OS) {
            case "ios": {
                break;
            }
            default: {
                // TODO: better error handling
                throw "This method must only be called on iOS platforms";
            }
        }
        let naurtSDK = this.naurt;
        naurtSDK.iOSInit(this.apiKey);
        console.log("I initialised");
    }
    // Android only function for initialising Naurt
    AndroidInitialise(naurtEngine) {
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
    start() {
        this.naurt.start();
    }
    stop() {
        this.naurt.stop();
    }
    isInitialised() {
        return this.naurt.getIsInitialised();
    }
    isValidated() {
        return this.naurt.getIsValidated();
    }
    isRunning() {
        var thinng = this.naurt.getIsRunning();
        console.log("Thinng: ", thinng);
        return thinng;
    }
    getDeviceUUID() {
        return this.naurt.deviceUUID();
    }
    getJourneyUUID() {
        // undefined indicates that there is no journey yet
        return this.naurt.getJourneyUUID();
    }
    getLatestNaurtPoint() {
        // undefined indicates that there is not yet a naurt point
        return this.naurt.naurtPoint();
    }
    getEventEmitter() {
        return new NativeEventEmitter(this.naurt);
    }
}
