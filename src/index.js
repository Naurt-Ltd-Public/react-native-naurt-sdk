import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, } from 'react-native';
const LINKING_ERROR = `The package 'react-native-naurt-sdk' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo managed workflow\n';
const NaurtSdk = NativeModules.NaurtSdk
    ? NativeModules.NaurtSdk
    : new Proxy({}, {
        get() {
            throw new Error(LINKING_ERROR);
        },
    });
/** Get the NativeEventEmitter for Naurt - to register NAURT_EVENT listeners to */
export function getEventEmitter() {
    switch (Platform.OS) {
        case 'android': {
            return new NativeEventEmitter(NaurtSdk);
        }
        case 'ios': {
            return new NativeEventEmitter(NaurtSdk);
        }
        default: {
            throw `getNaurtEventEmitter | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function getEventIds() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.getIds().then(ids => {
                return ids;
            });
        }
        // case 'ios': {
        //   let sdk = NaurtSdk as NaurtIosInterface;
        //   return sdk.supportedEvents();
        // }
        default: {
            throw `startNaurt | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function initialise(apiKey) {
    switch (Platform.OS) {
        case 'android': {
            PermissionsAndroid.requestMultiple([
                'android.permission.ACCESS_FINE_LOCATION',
                'android.permission.ACCESS_COARSE_LOCATION',
            ])
                .then((result) => {
                let granted = result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
                    result['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
                if (granted) {
                    let sdk = NaurtSdk;
                    sdk.initialiseNaurt(apiKey);
                    return true;
                }
                else {
                    throw `initialiseNaurt | Missing Permissions! [
            ACCESS_COARSE_LOCATION: ${result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted'
                        ? 'Granted'
                        : 'Denied'},
            ACCESS_FINE_LOCATION: ${result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
                        ? 'Granted'
                        : 'Denied'},
          ]`;
                }
            })
                .catch((err) => {
                throw `initialiseNaurt | error: ${err}`;
            });
            return false;
        }
        case 'ios': {
            let sdk = NaurtSdk;
            sdk.initialiseNaurt(apiKey, 8);
            return true;
        }
        default: {
            throw `initialiseNaurt | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function start() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                if (result) {
                    sdk.startNaurt();
                }
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                if (result) {
                    sdk.startNaurt();
                }
                return result;
            });
        }
        default: {
            throw `startNaurt | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function stop() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                if (result) {
                    sdk.stopNaurt();
                }
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                if (result) {
                    sdk.stopNaurt();
                }
                return result;
            });
        }
        default: {
            throw `stopNaurt | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function pause() {
    switch (Platform.OS) {
        case 'android': {
            // let sdk = NaurtSdk as NaurtAndroidInterface;
            // return sdk.isInitialised().then((result) => {
            //   if (result) {
            //     sdk.pauseNaurt()
            //   }
            //   return result;
            // });
            return Promise.resolve(true);
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                if (result) {
                    sdk.pauseNaurt();
                }
                return result;
            });
        }
        default: {
            throw `pauseNaurt | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function resume() {
    switch (Platform.OS) {
        case 'android': {
            // let sdk = NaurtSdk as NaurtAndroidInterface;
            // return sdk.isInitialised().then((result) => {
            //   if (result) {
            //     sdk.resumeNaurt()
            //   }
            //   return result;
            // });
            return Promise.resolve(true);
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                if (result) {
                    sdk.resumeNaurt();
                }
                return result;
            });
        }
        default: {
            throw `resumeNaurt | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function isInitialised() {
    console.log(NativeModules);
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.isInitialised().then((result) => {
                return result;
            });
        }
        default: {
            throw `isInitialised | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function isValidated() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.isValidated().then((result) => {
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.isValidated().then((result) => {
                return result;
            });
        }
        default: {
            throw `isValidated | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function isRunning() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.isRunning().then((result) => {
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.isRunning().then((result) => {
                return result;
            });
        }
        default: {
            throw `isRunning | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function hasLocationProvider() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.hasLocationProvider().then((result) => {
                return result;
            });
        }
        default: {
            throw `hasLocationProvider | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function deviceReport() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.deviceReport().then((result) => {
                return result;
            });
        }
        default: {
            throw `deviceReport | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function deviceUUID() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.deviceUUID().then((result) => {
                return result;
            });
        }
        default: {
            throw `deviceUUID | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function journeyUuid() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.journeyUuid().then((result) => {
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.journeyUuid().then((result) => {
                return result;
            });
        }
        default: {
            throw `journeyUuid | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function naurtPoint() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.naurtPoint().then((result) => {
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.naurtPoint().then((result) => {
                return result;
            });
        }
        default: {
            throw `naurtPoint | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function naurtPoints() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.naurtPoints().then((result) => {
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.naurtPoints().then((result) => {
                return result;
            });
        }
        default: {
            throw `naurtPoints | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export function trackingStatus() {
    switch (Platform.OS) {
        case 'android': {
            let sdk = NaurtSdk;
            return sdk.trackingStatus().then((result) => {
                return result;
            });
        }
        case 'ios': {
            let sdk = NaurtSdk;
            return sdk.trackingStatus().then((result) => {
                return result;
            });
        }
        default: {
            throw `trackingStatus | Unsupported OS!: ${Platform.OS}`;
        }
    }
}
export {} from './interfaces/naurt-point';
export {} from './interfaces/androrid-device-report';
export * from './interfaces/events';
