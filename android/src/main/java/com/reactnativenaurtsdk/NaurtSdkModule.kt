package com.reactnativenaurtsdk

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.bridge.Promise;

import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

//import com.naurt.Sdk.INSTANCE as Sdk
import com.naurt.Sdk as Sdk
import com.naurt.*
import com.naurt.events.*

class NaurtSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {
  private lateinit var naurtLocationListener: EventListener<NaurtNewLocationEvent>
  private lateinit var naurtOnlineListener: EventListener<NaurtIsOnlineEvent>
  private lateinit var naurtIsInitialisedListener: EventListener<NaurtIsInitialisedEvent>
  private lateinit var naurtIsValidatedListener: EventListener<NaurtIsValidatedEvent>
  private lateinit var naurtNewJourneyListener: EventListener<NaurtNewJourneyEvent>
  private lateinit var naurtRunningListener: EventListener<NaurtIsRunningEvent>
  private lateinit var naurtHasLocationProviderListener: EventListener<NaurtHasLocationProviderEvent>
  private lateinit var naurtNewTrackingStatusListener: EventListener<NaurtNewTrackingStatusEvent>
  private lateinit var naurtNewDeviceReportListener: EventListener<NaurtNewDeviceReportEvent>

  private val permissions = arrayOf(
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_NETWORK_STATE,
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.INTERNET
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
    params.putInt("timestamp", loc.timestamp.toInt())
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

  private fun mapDeviceReport(rep: DeviceReport): WritableMap {
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
    naurtLocationListener = EventListener<NaurtNewLocationEvent> { p0 ->
      val params = mapLocation(p0.newPoint)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[0], params)
    }
    Sdk.on("NAURT_NEW_POINT", naurtLocationListener)

    naurtOnlineListener = EventListener<NaurtIsOnlineEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isSOnline", p0.isOnline)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[5], params)
    }
    Sdk.on("NAURT_IS_ONLINE", naurtOnlineListener)

    naurtIsInitialisedListener = EventListener<NaurtIsInitialisedEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isInitialised", p0.isInitialised)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[2], params)
    }
    Sdk.on("NAURT_IS_INITIALISED", naurtIsInitialisedListener)

    naurtIsValidatedListener = EventListener<NaurtIsValidatedEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isValidated", p0.isValidated)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[3], params)
    }
    Sdk.on("NAURT_IS_VALIDATED", naurtIsValidatedListener)

    naurtNewJourneyListener = EventListener<NaurtNewJourneyEvent> { p0 ->
      val params = Arguments.createMap()
      params.putString("newJourney", p0.newUuid.toString())

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[1], params)
    }
    Sdk.on("NAURT_NEW_JOURNEY", naurtNewJourneyListener)

    naurtRunningListener = EventListener<NaurtIsRunningEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isRunning", p0.isRunning)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[4], params)
    }
    Sdk.on("NAURT_IS_RUNNING", naurtRunningListener)

    naurtHasLocationProviderListener = EventListener<NaurtHasLocationProviderEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("hasLocationProvider", p0.hasLocationProvider)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[6], params)
    }
    Sdk.on("NAURT_HAS_LOCATION", naurtHasLocationProviderListener)

    naurtNewTrackingStatusListener = EventListener<NaurtNewTrackingStatusEvent> { p0 ->
      val params = Arguments.createMap()
      params.putString("newTrackingStatus", stringifyTrackingStatus(p0.status))

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[8], params)
    }
    Sdk.on("NAURT_NEW_TRACKING_STATUS", naurtNewTrackingStatusListener)

    naurtNewDeviceReportListener = EventListener<NaurtNewDeviceReportEvent> { p0 ->
      val params = mapDeviceReport(p0.deviceReport)

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(eventIds[7], params)
    }
    Sdk.on("NAURT_NEW_DEVICE_REPORT", naurtNewDeviceReportListener)
  }

  // =============================== Host Methods ==============================
  override fun getName(): String {
      return "NaurtSdk"
  }

  override fun onHostResume() {
    try {
      if (reactApplicationContext != null) {
        Sdk.resume(reactApplicationContext.applicationContext)
      }
    }
    catch(e: Exception) {
      e.printStackTrace()
    }
  }

  override fun onHostPause() {
    Sdk.pause()
  }

  override fun onHostDestroy() {
    Sdk.stop()
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
  fun initialiseNaurt(apiKey: String, precision: Int?) {
    if(!hasPermissions(reactApplicationContext.applicationContext, permissions)) {
      Log.e("naurt", "Naurt does not have all required permissions to start")
    }

    Sdk.initialise(
      apiKey,
      reactApplicationContext.applicationContext,
      precision?: 6
    )
  }

  /** Resume the Naurt Engine with a given context  */
  @ReactMethod
  fun resumeNaurt() {
    Sdk.resume(reactApplicationContext.applicationContext)
    addListeners(reactApplicationContext)
  }

  /** Pause the Naurt Engine  */
  @ReactMethod
  fun pauseNaurt() {
      Sdk.pause()
      Sdk.removeAllListeners()
  }

  /** Start the Naurt engine  */
  @ReactMethod
  fun startNaurt() {
      Sdk.start()
  }

  /** Stop the Naurt Engine  */
  @ReactMethod
  fun stopNaurt() {
      Sdk.stop()
  }

  @ReactMethod
  fun isInitialised(cb: Promise) {
    cb.resolve(Sdk.isInitialised)
  }

  @ReactMethod
  fun isValidated(cb: Promise) {
    cb.resolve(Sdk.isValidated)
  }

  @ReactMethod
  fun isRunning(cb: Promise) {
    cb.resolve(Sdk.isRunning)
  }

  @ReactMethod
  fun isOnline(cb: Promise) {
    cb.resolve(Sdk.isOnline)
  }

  @ReactMethod
  fun hasLocationProvider(cb: Promise) {
    cb.resolve(Sdk.hasLocationProvider)
  }

  @ReactMethod
  fun deviceReport(cb: Promise) {
    Sdk.deviceReport?.let {
      cb.resolve(mapDeviceReport(it))
    }

    // Return an empty map if no device report is available
    cb.resolve(Arguments.createMap())
  }

  @ReactMethod
  fun deviceUUID(cb: Promise) {
    cb.resolve(Sdk.deviceUUID.toString())
  }

  @ReactMethod
  fun journeyUuid(cb: Promise) {
    cb.resolve(Sdk.journeyUuid.toString())
  }

  @ReactMethod
  fun naurtPoint(cb: Promise) {
    Sdk.naurtPoint?.let {
      cb.resolve(mapLocation(it))
    }

    // Return an empty map if no device report is available
    cb.resolve(Arguments.createMap())
  }

  @ReactMethod
  fun naurtPoints(cb: Promise){
    val arr = WritableNativeArray()
    Sdk.naurtPoints.forEach{
      arr.pushMap(mapLocation(it))
    }
    cb.resolve(arr)
  }

  @ReactMethod
  fun trackingStatus(cb: Promise) {
    cb.resolve(stringifyTrackingStatus(Sdk.trackingStatus))
  }
}
