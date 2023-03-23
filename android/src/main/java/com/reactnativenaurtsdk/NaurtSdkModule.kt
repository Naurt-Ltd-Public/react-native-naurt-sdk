package com.reactnativenaurtsdk

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.LifecycleEventListener

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.naurt.Naurt
import com.naurt.*

import kotlinx.serialization.*
import kotlinx.serialization.json.Json

@Serializable
private data class NaurtOutput(
  val platformOrigin: String,
  val timestamp: Long,
  val locationProviderTimestamp: Long,
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
  val motionFlag: String,
  val locationOrigin: String,
  val environmentFlag: String,
  val backgroundStatus: String,
  val isMocked: Boolean,
  val isMockedPrevented: Boolean
) {

}

private class OutputTemp(
  timestamp: Long,
  locationProviderTimestamp: Long,
  longitude: Double,
  latitude: Double,
  altitude: Double,
  verticalAccuracy: Double,
  speed: Double,
  speedAccuracy: Double,
  course: Double,
  courseAccuracy: Double,
  horizontalAccuracy: Double,
  horizontalCovariance: Double,
  motionFlag: String,
  locationOrigin: String,
  environmentFlag: String,
  backgroundStatus: String,
  isMocked: Boolean,
  isMockedPrevented: Boolean
) {
  val timestamp = timestamp
  val locationProviderTimestamp = locationProviderTimestamp
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
  val motionFlag = motionFlag
  val locationOrigin = locationOrigin
  val environmentFlag = environmentFlag
  val backgroundStatus = backgroundStatus
  val isMocked = isMocked
  val isMockedPrevented = isMockedPrevented

  fun toData(): NaurtOutput {
    return NaurtOutput(
      "android",
      timestamp,
      locationProviderTimestamp,
      longitude,
      latitude,
      altitude,
      verticalAccuracy,
      speed,
      speedAccuracy,
      course,
      courseAccuracy,
      horizontalAccuracy,
      horizontalCovariance,
      this.motionFlag,
      this.locationOrigin,
      this.environmentFlag,
      this.backgroundStatus,
      this.isMocked,
      this.isMockedPrevented
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

class NaurtAndroid(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private var naurt: Naurt? = null;
  private lateinit var naurtLocationListener: NaurtEventListener<NaurtNewLocationEvent>;
  private lateinit var naurtValidationListener: NaurtEventListener<NaurtIsValidatedEvent>;
  private lateinit var naurtLocationEnabledEventListener: NaurtEventListener<NaurtLocationEnabledEvent>;
  private var keepAlive: Boolean = false;


  private val permissions = arrayOf(
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_NETWORK_STATE,
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.INTERNET,
    Manifest.permission.READ_PHONE_STATE,
  )

  val eventIds = arrayOf("naurtDidUpdateLocation", "naurtDidUpdateValidation", "naurtDidUpdateAnalyticsSession", "naurtUserLocationEnabledEvent")

  private val eventEmitter by lazy {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
  }

  init {
    reactContext.addLifecycleEventListener(this)
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
      timestamp = loc.timestamp,
      locationProviderTimestamp = loc.locationProviderTimestamp,
      longitude = loc.longitude,
      latitude = loc.latitude,
      horizontalAccuracy = loc.horizontalAccuracy,
      speed = loc.speed,
      course = loc.heading,
      speedAccuracy = loc.speedAccuracy,
      courseAccuracy = loc.headingAccuracy,
      horizontalCovariance = loc.horizontalCovariance,
      altitude = loc.altitude,
      verticalAccuracy = loc.verticalAccuracy,
      motionFlag = loc.motionFlag.toString(),
      locationOrigin = loc.locationOrigin.toString(),
      environmentFlag = loc.environmentFlag.toString(),
      backgroundStatus = loc.backgroundStatus.toString(),
      isMocked = loc.isMocked,
      isMockedPrevented = loc.isMockedPrevented
    ).toData()
    return Json.encodeToString(data)
  }

  /** Initialise Naurt with a given context  */
  @ReactMethod
  fun initialiseNaurt(apiKey: String, engineType: String, keepAlive: Boolean) {
    val naurtEngineType = when (engineType){
      "standalone" -> NaurtEngineType.Standalone
      "service" -> NaurtEngineType.Service
      else -> NaurtEngineType.Service
    }

    this.naurt = Naurt(apiKey, reactApplicationContext.applicationContext, naurtEngineType);

    if (naurtEngineType == NaurtEngineType.Standalone && keepAlive) {
      this.keepAlive = true;
    }

    if(!hasPermissions(reactApplicationContext.applicationContext, permissions)) {
      Log.e("naurt", "Naurt does not have all required permissions to start")
    }

    this.addListeners()
  }

  private fun addListeners() {
    this.naurtLocationListener = NaurtEventListener<NaurtNewLocationEvent> { p0 ->
      val jsonString = serisaliseLocation(p0.newPoint)
      emitJson("naurtDidUpdateLocation", jsonString)
    }
    this.naurt?.on(NaurtEvents.NEW_LOCATION, naurtLocationListener);

    this.naurtValidationListener = NaurtEventListener<NaurtIsValidatedEvent> { p0 ->
      val validated = p0.isValidated == NaurtValidationStatus.Valid;
      emitBool("naurtDidUpdateValidation", validated);
    }
    this.naurt?.on(NaurtEvents.IS_VALIDATED, naurtValidationListener);

    this.naurtLocationEnabledEventListener = NaurtEventListener<NaurtLocationEnabledEvent> { p0 ->
      emitBool("naurtUserLocationEnabledEvent", p0.enabled);
    }
    this.naurt?.on(NaurtEvents.LOCATION_ENABLED, naurtLocationEnabledEventListener);

//    // TODO: Must be changed!!
//    this.emitBool("naurtDidUpdateValidation", true);
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


  /** Start the Naurt engine  */
  @ReactMethod
  fun beginAnalyticsSession(metadata: String, promise: Promise) {
      try {
        this.naurt?.startAnalyticsSession(metadata);
        this.emitBool("naurtDidUpdateAnalyticsSession", true);
        promise.resolve(null);
      } catch (error: Error){
        promise.reject(error.message, error.stackTrace.toString());
      }

  }

  /** Stop the Naurt Engine  */
  @ReactMethod
  fun stopAnalyticsSession(dummy: String, promise: Promise) {
      try {
        this.naurt?.endAnalyticsSession();
        this.emitBool("naurtDidUpdateAnalyticsSession", false);
        promise.resolve(null);
      } catch (error: Error) {
        promise.reject(error.message, error.stackTrace.toString());
      }
  }

  @ReactMethod
  fun gteIsInitialised(): Boolean {
    if (this.naurt == null) {
      return false;
    }
    return this.naurt!!.getIsInitialised();
  }

  @ReactMethod
  fun getIsValidated(): Boolean {
    if (this.naurt == null) {
      return false;
    }
    val validated = this.naurt!!.getIsValidated();

    return validated == NaurtValidationStatus.Valid;

  }

  @ReactMethod
  fun getIsInAnalyticsSession(): Boolean {
    if (this.naurt == null) {
      return false;
    }
    return this.naurt!!.getInAnalyticsSession();
  }

  @ReactMethod
  fun getDeviceUUID(): String {
    if (this.naurt == null) {
      return "";
    }
    return this.naurt!!.getDeviceID();
  }

  @ReactMethod
  fun getJourneyUUID(): String {
    if (this.naurt == null) {
      return "";
    }
    return this.naurt!!.getCurrentSessionID();
  }

  @ReactMethod
  fun destroy() {
    if (this.naurt == null) {
      return;
    }

    this.naurt!!.onDestroy();
    this.naurt = null;
  }

  @ReactMethod
  fun setEmissionFrequency(frequency: Double, nul: Boolean) {
    if (this.naurt == null) {
      return;
    }
    if (nul) {
      this.naurt!!.setEmissionFrequency(null);
    } else {
      this.naurt!!.setEmissionFrequency(frequency);
    }

  }

  @ReactMethod
  fun activateBatteryOptimisation(activate: Boolean) {
    this.naurt?.activateBatteryOptimisation(activate);
  }

  private fun emitJson(eventName: String, data: String) {
    eventEmitter.emit(eventName, data)
  }

  private fun emitBool(eventName: String, data: Boolean) {
    eventEmitter.emit(eventName, data)
  }

  override fun onHostResume() {
    // Not relevant
  }

  override fun onHostPause() {
    // Not relevant
  }

  override fun onHostDestroy() {
    if (!this.keepAlive) {
      this.destroy();
    }
  }
}
