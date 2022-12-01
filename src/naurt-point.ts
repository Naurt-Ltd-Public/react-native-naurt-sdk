import type { PlatformOrigin, LocationOrigin, EnvironmentFlag, BackgroundStatus } from "./enums";

export interface NaurtPoint {
  platformOrigin: PlatformOrigin,
  latitude: number,
  longitude: number,
  timestamp: number,
  locationProviderTimestamp: number | undefined, // Android only
  horizontalAccuracy: number,
  speed: number,
  heading: number,
  speedAccuracy: number,
  headingAccuracy: number,
  horizontalCovariance: number,
  altitude: number,
  verticalAccuracy: number,
  cumulativeDistance: number | undefined, // undefined for iOS - support coming soon to iOS
  motionFlag: String | undefined, // undefined for iOS - support coming soon to iOS
  locationOrigin: LocationOrigin | undefined, // undefined for iOS - support not possible
  environmentFlag: EnvironmentFlag | undefined, // undefined for iOS - support not possible 
  backgroundStatus: BackgroundStatus | undefined, // undefined for iOS - support coming soon to iOS
}

