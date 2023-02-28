export interface NaurtPoint {
  platformOrigin: String,
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
  motionFlag: String | undefined, // undefined for iOS - support coming soon to iOS
  locationOrigin: String | undefined, // undefined for iOS - support not possible
  environmentFlag: String | undefined, // undefined for iOS - support not possible 
  backgroundStatus: String | undefined, // undefined for iOS - support coming soon to iOS
  isMocked: Boolean | undefined, // Undefined for iOS
  isMockedPrevented: Boolean | undefined // Undefined for iOS
}

