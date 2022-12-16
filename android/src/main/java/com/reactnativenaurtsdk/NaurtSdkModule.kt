package com.reactnativenaurtsdk

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.naurt.Naurt
import com.naurt.*

class NaurtSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private lateinit var naurtLocationListener: NaurtEventListener<NaurtNewLocationEvent>
  private lateinit var naurtIsInitialisedListener: NaurtEventListener<NaurtIsInitialisedEvent>
  private lateinit var naurtIsValidatedListener: NaurtEventListener<NaurtIsValidatedEvent>
  private lateinit var naurtRunningListener: NaurtEventListener<NaurtIsRunningEvent>

  private val permissions = arrayOf(
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_NETWORK_STATE,
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.INTERNET,
    Manifest.permission.READ_PHONE_STATE,
  )

  val eventIds = arrayOf("naurtDidUpdateLocation", "naurtDidUpdateValidation", "naurtDidUpdateRunning", "naurtDidUpdateInitialise")

  private val eventEmitter by lazy {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
  }

  init {
    // Setup lifecycle events handled by android
    addListeners()
  }

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

  private fun addListeners() {
    naurtLocationListener = NaurtEventListener<NaurtNewLocationEvent> { p0 ->
      val params = mapLocation(p0.newPoint)

      emitEvent("naurtDidUpdateLocation", params)
    }
    Naurt.on(NaurtEvents.NEW_LOCATION, naurtLocationListener)

    naurtIsInitialisedListener = NaurtEventListener<NaurtIsInitialisedEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isInitialised", p0.isInitialised)

      emitEvent("naurtDidUpdateInitialise", params)
    }
    Naurt.on(NaurtEvents.IS_INITIALISED, naurtIsInitialisedListener)

    naurtIsValidatedListener = NaurtEventListener<NaurtIsValidatedEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isValidated", p0.isValidated)
      emitEvent("naurtDidUpdateValidation", params)
    }
    Naurt.on(NaurtEvents.IS_VALIDATED, naurtIsValidatedListener)

    naurtRunningListener = NaurtEventListener<NaurtIsRunningEvent> { p0 ->
      val params = Arguments.createMap()
      params.putBoolean("isRunning", p0.isRunning)
      emitEvent("naurtDidUpdateRunning", params)
    }
    Naurt.on(NaurtEvents.IS_RUNNING, naurtRunningListener)

  }


  override fun getName(): String {
      return "NaurtSdk"
  }


  override fun canOverrideExistingModule(): Boolean {
    return true
  }

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
  fun initialiseNaurtStandalone(apiKey: String) {
    if(!hasPermissions(reactApplicationContext.applicationContext, permissions)) {
      Log.e("naurt", "Naurt does not have all required permissions to start")
    }

    Naurt.initialiseStandalone(
      apiKey,
      reactApplicationContext.applicationContext
    )
  }


  /** Initialise Naurt with a given context  */
  @ReactMethod
  fun initialiseNaurtService(apiKey: String) {
    if(!hasPermissions(reactApplicationContext.applicationContext, permissions)) {
      Log.e("naurt", "Naurt does not have all required permissions to start")
    }

    Naurt.initialiseService(
      apiKey,
      reactApplicationContext.applicationContext
    )
  }

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

  private fun emitEvent(eventName: String, data: WritableMap) {
    eventEmitter.emit(eventName, data);
  }
}
