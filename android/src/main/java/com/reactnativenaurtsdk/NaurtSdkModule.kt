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
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.naurt.Naurt
import com.naurt.*

import kotlinx.serialization.*
import kotlinx.serialization.json.Json
import kotlin.math.min

@Serializable
private data class NaurtOutput(
  val timestamp: Double,
  val longitude: Double,
  val latitude: Double,
  val altitude: Double,
  val verticalAccuracy: Double,
  val speed: Double,
  val speedAccuracy: Double,
  val course: Double,
  val courseAccuracy: Double,
  val horizontalAccuracy: Double,
  val horizontalCovariance: Double,
  
) {

}

private class OutputTemp(
  timestamp: Double,
  longitude: Double,
  latitude: Double,
  altitude: Double,
  verticalAccuracy: Double,
  speed: Double,
  speedAccuracy: Double,
  course: Double,
  courseAccuracy: Double,
  horizontalAccuracy: Double,
  horizontalCovariance: Double
) {
  val timestamp = timestamp
  val longitude = minusIfNan(longitude)
  val latitude = minusIfNan(latitude)
  val altitude = minusIfNan(altitude)
  val verticalAccuracy = minusIfNan(verticalAccuracy)
  val speed = minusIfNan(speed)
  val speedAccuracy = minusIfNan(speedAccuracy)
  val course = minusIfNan(course)
  val courseAccuracy = minusIfNan(courseAccuracy)
  val horizontalAccuracy = minusIfNan(horizontalAccuracy)
  val horizontalCovariance = minusIfNan(horizontalCovariance)

  fun toData(): NaurtOutput {
    return NaurtOutput(
      timestamp, longitude, latitude, altitude, verticalAccuracy, speed, speedAccuracy, course, courseAccuracy, horizontalAccuracy, horizontalCovariance
    )
  }
}

private fun minusIfNan(num: Double): Double {
  return if (num.isNaN()) {
    -999.0
  } else {
    num
  }

}

class NaurtAndroid(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
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


  @OptIn(ExperimentalSerializationApi::class)
  private fun serisaliseLocation(loc: NaurtLocation): String {
    // NOTE: "heading" is changing to "course", to make room for a new variable "heading"
    // This is more representative of the traditional navigation nomenclature
    val data = OutputTemp(
      timestamp = loc.timestamp.toDouble(),
      longitude = loc.longitude,
      latitude = loc.latitude,
      horizontalAccuracy = loc.horizontalAccuracy,
      speed = loc.speed,
      course = loc.heading,
      speedAccuracy = loc.speedAccuracy,
      courseAccuracy = loc.headingAccuracy,
      horizontalCovariance = loc.horizontalCovariance,
      altitude = loc.altitude,
      verticalAccuracy = loc.verticalAccuracy
    ).toData()
    return Json.encodeToString(data)
  }

  private fun addListeners() {
    naurtLocationListener = NaurtEventListener<NaurtNewLocationEvent> { p0 ->
      val jsonString = serisaliseLocation(p0.newPoint)
      emitJson("naurtDidUpdateLocation", jsonString)
    }
    Naurt.on(NaurtEvents.NEW_LOCATION, naurtLocationListener)

    naurtIsInitialisedListener = NaurtEventListener<NaurtIsInitialisedEvent> { p0 ->
      emitBool("naurtDidUpdateInitialise", p0.isInitialised)
    }
    Naurt.on(NaurtEvents.IS_INITIALISED, naurtIsInitialisedListener)

    naurtIsValidatedListener = NaurtEventListener<NaurtIsValidatedEvent> { p0 ->
      emitBool("naurtDidUpdateValidation", p0.isValidated)
    }
    Naurt.on(NaurtEvents.IS_VALIDATED, naurtIsValidatedListener)

    naurtRunningListener = NaurtEventListener<NaurtIsRunningEvent> { p0 ->
      emitBool("naurtDidUpdateRunning", p0.isRunning)
    }
    Naurt.on(NaurtEvents.IS_RUNNING, naurtRunningListener)

  }


  override fun getName(): String {
      return "NaurtAndroid"
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
  fun start() {
      Naurt.start()
  }

  /** Stop the Naurt Engine  */
  @ReactMethod
  fun stop() {
      Naurt.stop()
  }

  @ReactMethod
  fun gteIsInitialised(): Boolean {
    return Naurt.getInitialised()
  }

  @ReactMethod
  fun getIsValidated(): Boolean {
    return Naurt.getValidated()
  }

  @ReactMethod
  fun getIsRunning(): Boolean {
    return Naurt.getRunning()
  }

//  @ReactMethod
//  fun deviceUUID(cb: Promise) {
//    cb.resolve(Naurt.deviceUUID.toString())
//  }

  @ReactMethod
  fun journeyUuid(): String {
    return Naurt.getJourneyUuid().toString()
  }

  @ReactMethod
  fun naurtPoint(cb: Promise) {
    Naurt.getLocation()?.let {
      cb.resolve(serisaliseLocation(it))
    }

    // Return an empty map if no device report is available
    cb.resolve(Arguments.createMap())
  }

  private fun emitJson(eventName: String, data: String) {
    eventEmitter.emit(eventName, data)
  }

  private fun emitBool(eventName: String, data: Boolean) {
    eventEmitter.emit(eventName, data)
  }
}
