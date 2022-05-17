import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import type { NaurtAndroidInterface } from './interfaces/android-interface';
import type { AndroidDeviceReport } from './interfaces/androrid-device-report';
import type { NaurtIosInterface } from './interfaces/ios-interface';
import type { NaurtPoint } from './interfaces/naurt-point';

const LINKING_ERROR =
  `The package 'react-native-naurt-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NaurtSdk = NativeModules.NaurtSdk
  ? NativeModules.NaurtSdk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/** Get the NativeEventEmitter for Naurt - to register NAURT_EVENT listeners to */
export function getEventEmitter(): NativeEventEmitter {
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

export function getEventIds(): Promise<String[]> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      return sdk.getIds().then(ids => {
        return ids
      })
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

export function initialise(
  apiKey: String,
  precision: Number = 6
): Boolean {
  switch (Platform.OS) {
    case 'android': {
      PermissionsAndroid.requestMultiple([
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
      ])
        .then((result) => {
          let granted =
            result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
            result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'

          if (granted) {
            let sdk = NaurtSdk as NaurtAndroidInterface;

            sdk.initialiseNaurt(apiKey, precision);
            return true;
          } else {
            throw `initialiseNaurt | Missing Permissions! [
            ACCESS_COARSE_LOCATION: ${
              result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted'
                ? 'Granted'
                : 'Denied'
            },
            ACCESS_FINE_LOCATION: ${
              result['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
                ? 'Granted'
                : 'Denied'
            },
          ]`;
          }
        })
        .catch((err: any) => {
          throw `initialiseNaurt | error: ${err}`;
        });

      return false;
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;

      sdk.initialiseNaurt(apiKey, precision);
      return true
    }
    default: {
      throw `initialiseNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function start(): Promise<boolean> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.startNaurt()
        }
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.startNaurt()
        }
        return result;
      });
    }
    default: {
      throw `startNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function stop(): Promise<boolean> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.stopNaurt()
        }
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.stopNaurt()
        }
        return result;
      });
    }
    default: {
      throw `stopNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function pause(): Promise<boolean> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.pauseNaurt()
        }
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.pauseNaurt()
        }
        return result;
      });
    }
    default: {
      throw `pauseNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function resume(): Promise<boolean> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.resumeNaurt()
        }
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.isInitialised().then((result) => {
        if (result) {
          sdk.resumeNaurt()
        }
        return result;
      });
    }
    default: {
      throw `resumeNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function isInitialised(): Promise<boolean> {
  console.log(NativeModules)

  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.isInitialised().then((result) => {
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.isInitialised().then((result) => {
        return result;
      });
    }
    default: {
      throw `isInitialised | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function isValidated(): Promise<boolean> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.isValidated().then((result) => {
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.isValidated().then((result) => {
        return result;
      });
    }
    default: {
      throw `isValidated | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function isRunning(): Promise<boolean> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.isRunning().then((result) => {
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.isRunning().then((result) => {
        return result;
      });
    }
    default: {
      throw `isRunning | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function hasLocationProvider(): Promise<boolean> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.hasLocationProvider().then((result) => {
        return result;
      });
    }
    default: {
      throw `hasLocationProvider | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function deviceReport(): Promise<AndroidDeviceReport> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return  sdk.deviceReport().then((result) => {
        return result;
      });
    }
    default: {
      throw `deviceReport | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function deviceUUID(): Promise<String> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.deviceUUID().then((result) => {
        return result;
      });
    }
    default: {
      throw `deviceUUID | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function journeyUuid(): Promise<String> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.journeyUuid().then((result) => {
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.journeyUuid().then((result) => {
        return result;
      });
    }
    default: {
      throw `journeyUuid | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function naurtPoint(): Promise<NaurtPoint> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.naurtPoint().then((result) => {
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.naurtPoint().then((result) => {
        return result;
      });
    }
    default: {
      throw `naurtPoint | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function naurtPoints(): Promise<NaurtPoint[]> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.naurtPoints().then((result) => {
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.naurtPoints().then((result) => {
        return result;
      });
    }
    default: {
      throw `naurtPoints | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function trackingStatus(): Promise<String> {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;
      return sdk.trackingStatus().then((result) => {
        return result;
      });
    }
    case 'ios': {
      let sdk = NaurtSdk as NaurtIosInterface;
      return sdk.trackingStatus().then((result) => {
        return result;
      });
    }
    default: {
      throw `trackingStatus | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export { NaurtPoint } from './interfaces/naurt-point';
export { AndroidDeviceReport } from './interfaces/androrid-device-report';
export * from './interfaces/events';
