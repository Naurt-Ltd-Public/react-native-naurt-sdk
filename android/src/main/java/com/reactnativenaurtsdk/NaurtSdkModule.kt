package com.reactnativenaurtsdk

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.bridge.Promise;

import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

import com.naurt.Naurt
import com.naurt.*

class NaurtSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {
  private lateinit var naurtLocationListener: NaurtEventListener<NaurtNewLocationEvent>
  private lateinit var naurtOnlineListener: NaurtEventListener<NaurtIsOnlineEvent>
  private lateinit var naurtIsInitialisedListener: NaurtEventListener<NaurtIsInitialisedEvent>
  private lateinit var naurtIsValidatedListener: NaurtEventListener<NaurtIsValidatedEvent>
  private lateinit var naurtNewJourneyListener: NaurtEventListener<NaurtNewJourneyEvent>
  private lateinit var naurtRunningListener: NaurtEventListener<NaurtIsRunningEvent>
  private lateinit var naurtHasLocationProviderListener: NaurtEventListener<NaurtHasLocationProviderEvent>
  private lateinit var naurtNewTrackingStatusListener: NaurtEventListener<NaurtNewTrackingStatusEvent>
  private lateinit var naurtNewDeviceReportListener: NaurtEventListener<NaurtNewDeviceReportEvent>

  private val permissions = arrayOf(
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_NETWORK_STATE,
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.INTERNET,
    Manifest.permission.READ_PHONE_STATE,
  )

  val eventIds = arrayOf(
    "NAURT_NEW_POINT",          // 0
    "NAURT_NEW_JOURNEY",        // 1
    "NAURT_IS_INITIALISED",     // 2
    "NAURT_IS_VALIDATED",       // 3
    "NAURT_IS_RUNNING",         // 4
    "NAURT_IS_ONLINE",          // 5
    "NAURT_HAS_LOCATION",       // 6
    "NAURT_NEW_DEVICE_REPORT",  // 7
    "NAURT_NEW_TRACKING_STATUS" // 8
  )

  /** Check to see if the given context has been granted all permissions in the input array */
  private fun hasPermissions(context: Context?, permissions: Array<String>): Boolean {
    if (context != null) {
      for (permission in permissions) {
        if (ActivityCompat.checkSelfPermission(
            context,
            permission
          ) != PackageManager.PERMISSION_GRANTED
        ) {
          Log.e("naurt", "Missing permission: $permission")
          return false
        }
      }
    }
    return true
  }

  private fun mapLocation(loc: NaurtLocation): WritableMap {
    val params = Arguments.createMap()

    params.putDouble("latitude", loc.latitude)
    params.putDouble("longitude", loc.longitude)
    params.putDouble("timestamp", loc.timestamp.toDouble())
    params.putDouble("horizontalAccuracy", loc.horizontalAccuracy)
    params.putDouble("speed", loc.speed)
    params.putDouble("heading", loc.heading)
    params.putDouble("speedAccuracy", loc.speedAccuracy)
    params.putDouble("headingAccuracy", loc.headingAccuracy)
    params.putDouble("horizontalCovariance", loc.horizontalCovariance)
    params.putDouble("altitude", loc.altitude)
    params.putDouble("verticalAccuracy", loc.verticalAccuracy)

    return params
  }

  private fun mapDeviceReport(rep: NaurtDeviceReport): WritableMap {
    val params = Arguments.createMap()

    rep.processName?.let {
      params.putString("processName", it)
    }
    rep.hasMockingAppsInstalled?.let {
      params.putBoolean("hasMockingAppsInstalled", it)
    }
    rep.wasLastLocationMocked?.let {
      params.putBoolean("wasLastLocationMocked", it)
    }

    params.putBoolean("isDeveloper", rep.isDeveloper)
    params.putBoolean("isDeviceRooted", rep.isDeviceRooted)
    params.putBoolean("isInWorkProfile", rep.isInWorkProfile)
    params.putInt("lastReportChange", rep.lastReportChange.toInt())

    return params
  }

  private fun stringifyTrackingStatus(status: NaurtTrackingStatus): String {
    when (status) {
      NaurtTrackingStatus.ALREADY_RUNNING -> return "ALREADY_RUNNING"
      NaurtTrackingStatus.COMPROMISED -> return "COMPROMISED"
      NaurtTrackingStatus.DEGRADED -> return "DEGRADED"
      NaurtTrackingStatus.FULL -> return "FULL"
      NaurtTrackingStatus.INOPERABLE -> return "INOPERABLE"
      NaurtTrackingStatus.INVALID -> return "INVALID"
      NaurtTrackingStatus.LOCATION_NOT_ENABLED -> return "LOCATION_NOT_ENABLED"
      NaurtTrackingStatus.MINIMAL -> return "MINIMAL"
      NaurtTrackingStatus.NOT_INITIALISED -> return "NOT_INITIALISED"
      NaurtTrackingStatus.NOT_RUNNING -> return "NOT_RUNNING"
      NaurtTrackingStatus.NO_PERMISSION -> return "NO_PERMISSION"
      NaurtTrackingStatus.PAUSED -> return "PAUSED"
      NaurtTrackingStatus.STOPPED -> return "STOPPED"
      NaurtTrackingStatus.UNKNOWN -> return "UNKNOWN"
    }
  }

  private fun addListeners(reactContext: ReactApplicationContext) {
    naurtLocationListener = NaurtEventListener<NaurtNewLocationEvent> { p0 ->
      val params = mapLocation(p0.newPoint)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[0], params)
    }
    Naurt.on(NaurtEvents.NEW_LOCATION, naurtLocationListener)

    naurtOnlineListener = NaurtEventListener<NaurtIsOnlineEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isSOnline", p0.isOnline)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[5], params)
    }
    Naurt.on(NaurtEvents.IS_ONLINE, naurtOnlineListener)

    naurtIsInitialisedListener = NaurtEventListener<NaurtIsInitialisedEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isInitialised", p0.isInitialised)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[2], params)
    }
    Naurt.on(NaurtEvents.IS_INITIALISED, naurtIsInitialisedListener)

    naurtIsValidatedListener = NaurtEventListener<NaurtIsValidatedEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isValidated", p0.isValidated)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[3], params)
    }
    Naurt.on(NaurtEvents.IS_VALIDATED, naurtIsValidatedListener)

    naurtNewJourneyListener = NaurtEventListener<NaurtNewJourneyEvent> { p0 ->
      val params = Arguments.createMap()
      params.putString("newJourney", p0.newUuid.toString())

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[1], params)
    }
    Naurt.on(NaurtEvents.NEW_JOURNEY, naurtNewJourneyListener)

    naurtRunningListener = NaurtEventListener<NaurtIsRunningEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isRunning", p0.isRunning)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[4], params)
    }
    Naurt.on(NaurtEvents.IS_RUNNING, naurtRunningListener)

    naurtHasLocationProviderListener = NaurtEventListener<NaurtHasLocationProviderEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("hasLocationProvider", p0.hasLocationProvider)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[6], params)
    }
    Naurt.on(NaurtEvents.HAS_LOCATION_PROVIDER, naurtHasLocationProviderListener)

    naurtNewTrackingStatusListener = NaurtEventListener<NaurtNewTrackingStatusEvent> { p0 ->
      val params = Arguments.createMap()
      params.putString("newTrackingStatus", stringifyTrackingStatus(p0.status))

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[8], params)
    }
    Naurt.on(NaurtEvents.NEW_TRACKING_STATUS, naurtNewTrackingStatusListener)

    naurtNewDeviceReportListener = NaurtEventListener<NaurtNewDeviceReportEvent> { p0 ->
      val params = mapDeviceReport(p0.naurtDeviceReport)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[7], params)
    }
    Naurt.on(NaurtEvents.NEW_DEVICE_REPORT, naurtNewDeviceReportListener)
  }

  // =============================== Host Methods ==============================
  override fun getName(): String {
      return "NaurtSdk"
  }

  override fun onHostResume() { }

  override fun onHostPause() { }

//  override fun onHostResume() {
//    try {
//      if (reactApplicationContext != null) {
//        Naurt.resume(reactApplicationContext.applicationContext)
//      }
//    }
//    catch(e: Exception) {
//      e.printStackTrace()
//    }
//  }

//  override fun onHostPause() {
//    Sdk.pause()
//  }

  override fun onHostDestroy() {
    Naurt.stop()
  }

  override fun canOverrideExistingModule(): Boolean {
    return true;
  }
  // =============================== Host Methods ==============================

  // =============================== Core Methods ==============================
  init {
    // Setup lifecycle events handled by android
    reactApplicationContext.addLifecycleEventListener(this)
    addListeners(reactContext)
  }
  // =============================== Core Methods ==============================

  // ============================== React Methods ==============================
  @ReactMethod
  fun addListener(eventName: String) {
      // Set up any upstream listeners or background tasks as necessary
  }

  @ReactMethod
  fun removeListeners(count: Integer) {
      // Remove upstream listeners, stop unnecessary background tasks
  }

  @ReactMethod
  fun getIds(cb: Promise) {
    val wa = WritableNativeArray()
    eventIds.forEach {
      wa.pushString(it)
    }

    cb.resolve(wa)
  }

  /** Initialise Naurt with a given context  */
  @ReactMethod
  fun initialiseStandalone(apiKey: String) {
    if(!hasPermissions(reactApplicationContext.applicationContext, permissions)) {
      Log.e("naurt", "Naurt does not have all required permissions to start")
    }

    Naurt.initialiseStandalone(
      apiKey,
      reactApplicationContext.applicationContext
    )
  }

  @ReactMethod
  fun initialiseService(apiKey: String) {
    if(!hasPermissions(reactApplicationContext.applicationContext, permissions)) {
      Log.e("naurt", "Naurt does not have all required permissions to start")
    }

    Naurt.initialiseService(
      apiKey,
      reactApplicationContext.applicationContext
    )
  }

  /** Resume the Naurt Engine with a given context  */
//  @ReactMethod
//  fun resumeNaurt() {
//    Sdk.resume(reactApplicationContext.applicationContext)
//    addListeners(reactApplicationContext)
//  }

  /** Pause the Naurt Engine  */
//  @ReactMethod
//  fun pauseNaurt() {
//      Sdk.pause()
//      Sdk.removeAllListeners()
//  }

  /** Start the Naurt engine  */
  @ReactMethod
  fun startNaurt() {
      Naurt.start()
  }

  /** Stop the Naurt Engine  */
  @ReactMethod
  fun stopNaurt() {
      Naurt.stop()
  }

  @ReactMethod
  fun isInitialised(cb: Promise) {
    cb.resolve(Naurt.getInitialised())
  }

  @ReactMethod
  fun isValidated(cb: Promise) {
    cb.resolve(Naurt.getValidated())
  }

  @ReactMethod
  fun isRunning(cb: Promise) {
    cb.resolve(Naurt.getRunning())
  }

  @ReactMethod
  fun isOnline(cb: Promise) {
    cb.resolve(Naurt.getOnline())
  }

  @ReactMethod
  fun hasLocationProvider(cb: Promise) {
    cb.resolve(Naurt.getHasLocationProvider())
  }

  @ReactMethod
  fun deviceReport(cb: Promise) {
    Naurt.getDeviceReport()?.let {
      cb.resolve(mapDeviceReport(it))
    }

    // Return an empty map if no device report is available
    cb.resolve(Arguments.createMap())
  }

//  @ReactMethod
//  fun deviceUUID(cb: Promise) {
//    cb.resolve(Naurt.deviceUUID.toString())
//  }

  @ReactMethod
  fun journeyUuid(cb: Promise) {
    cb.resolve(Naurt.getJourneyUuid().toString())
  }

  @ReactMethod
  fun naurtPoint(cb: Promise) {
    Naurt.getLocation()?.let {
      cb.resolve(mapLocation(it))
    }

    // Return an empty map if no device report is available
    cb.resolve(Arguments.createMap())
  }

  @ReactMethod
  fun naurtPoints(cb: Promise){
    val arr = WritableNativeArray()
    Naurt.getLocationHistory().forEach{
      arr.pushMap(mapLocation(it))
    }
    cb.resolve(arr)
  }

  @ReactMethod
  fun trackingStatus(cb: Promise) {
    cb.resolve(stringifyTrackingStatus(Naurt.getTrackingStatus()))
  }
}
