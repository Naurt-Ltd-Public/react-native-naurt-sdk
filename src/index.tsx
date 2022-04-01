import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import type { NaurtAndroidInterface } from './interfaces/android-interface';

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
export function getNaurtEventEmitter(): NativeEventEmitter {
  switch (Platform.OS) {
    case 'android': {
      return new NativeEventEmitter(NaurtSdk);
    }
    // TODO: iOS Wrapper
    // case 'ios': {
    //   break;
    // }
    default: {
      throw `getNaurtEventEmitter | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function getNaurtEvents(): String[] {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      return sdk.getConstants().get('NAURT_EVENT_IDS');
    }
    // TODO: iOS Wrapper
    // case 'ios': {
    //   return false;
    // }
    default: {
      throw `startNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function initialiseNaurt(
  apiKey: String,
  precision: Number = 6
): Boolean {
  switch (Platform.OS) {
    case 'android': {
      PermissionsAndroid.requestMultiple([
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ])
        .then((result) => {
          let granted =
            result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
            result['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
            result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted';

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
            WRITE_EXTERNAL_STORAGE: ${
              result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
                ? 'Granted'
                : 'Denied'
            },
          ]`;
          }
        })
        .catch((err) => {
          throw `initialiseNaurt | error: ${err}`;
        });

      return false;
    }
    // TODO: iOS Wrapper
    // case 'ios': {
    //   return false;
    // }
    default: {
      throw `initialiseNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function startNaurt(): Boolean {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      if (sdk.isNaurtInitialised()) {
        sdk.startNaurt();
        return true;
      } else {
        return false;
      }
    }
    // TODO: iOS Wrapper
    // case 'ios': {
    //   return false;
    // }
    default: {
      throw `startNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function stopNaurt(): Boolean {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      if (sdk.isNaurtInitialised()) {
        sdk.stopNaurt();
        return true;
      } else {
        return false;
      }
    }
    // TODO: iOS Wrapper
    // case 'ios': {
    //   return false;
    // }
    default: {
      throw `stopNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function pauseNaurt(): Boolean {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      if (sdk.isNaurtInitialised()) {
        sdk.pauseNaurt();
        return true;
      } else {
        return false;
      }
    }
    // TODO: iOS Wrapper
    // case 'ios': {
    //   return false;
    // }
    default: {
      throw `pauseNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export function resumeNaurt(): Boolean {
  switch (Platform.OS) {
    case 'android': {
      let sdk = NaurtSdk as NaurtAndroidInterface;

      if (sdk.isNaurtInitialised()) {
        sdk.resumeNaurt();
        return true;
      } else {
        return false;
      }
    }
    // TODO: iOS Wrapper
    // case 'ios': {
    //   return false;
    // }
    default: {
      throw `resumeNaurt | Unsupported OS!: ${Platform.OS}`;
    }
  }
}

export { NaurtPoint } from './interfaces/naurt-point';
export * from './interfaces/events';
