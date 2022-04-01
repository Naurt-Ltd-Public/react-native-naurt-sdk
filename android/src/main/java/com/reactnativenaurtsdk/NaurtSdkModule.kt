package com.reactnativenaurtsdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Arguments

import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

import androidx.databinding.Observable
import com.naurt_kotlin_sdk.Naurt.INSTANCE as Naurt

val NAURT_EVENT_IDS = arrayOf(
  "NAURT_IS_INITIALISED",
  "NAURT_IS_VALIDATED",
  "NAURT_IS_RUNNING",
  "NAURT_NEW_POINT"
)

class NaurtSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {
  private var hadPaused = false

  // ============================= React Callbacks =============================
  private class IsInitialisedCallback(
    val reactContext: ReactApplicationContext,
  ) : Observable.OnPropertyChangedCallback() {
    override fun onPropertyChanged(sender: Observable?, propertyId: Int) {
      val params = Arguments.createMap()
      params.putBoolean("isInitialised", Naurt.isInitialised.get())

      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(NAURT_EVENT_IDS[0], params)
    }
  }
  private val isInitialisedCB = IsInitialisedCallback(reactContext)

  private class IsValidatedCallback(
    val reactContext: ReactApplicationContext,
  ) : Observable.OnPropertyChangedCallback() {
    override fun onPropertyChanged(sender: Observable, propertyId: Int) {
      val params = Arguments.createMap()
      params.putBoolean("isValidated", Naurt.isValidated.get())
      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(NAURT_EVENT_IDS[1], params)
    }
  }
  private val isValidatedCB = IsValidatedCallback(reactContext)

  private class IsRunningCallback(
    val reactContext: ReactApplicationContext,
  ) : Observable.OnPropertyChangedCallback() {
    override fun onPropertyChanged(sender: Observable, propertyId: Int) {
      val params = Arguments.createMap()
      params.putBoolean("isRunning", Naurt.isRunning.get())
      reactContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit(NAURT_EVENT_IDS[2], params)
    }
  }
  private val isRunningCB = IsRunningCallback(reactContext)

  private class NaurtPointCallback(
    val reactContext: ReactApplicationContext,
  ) : Observable.OnPropertyChangedCallback() {
    override fun onPropertyChanged(sender: Observable, propertyId: Int) {
      if (Naurt.naurtPoint.get() != null) {
        val params = Arguments.createMap()
        params.putDouble("latitude", Naurt.naurtPoint.get()!!.latitude)
        params.putDouble("longitude", Naurt.naurtPoint.get()!!.longitude)
        params.putString(
          "timestamp",
          Naurt.naurtPoint.get()!!.timestamp.toString()
        )
        reactContext
          .getJSModule(RCTDeviceEventEmitter::class.java)
          .emit(NAURT_EVENT_IDS[3], params)
      }
    }
  }
  private val naurtPointCB = NaurtPointCallback(reactContext)
  // ============================= React Callbacks =============================

  // =============================== Host Methods ==============================
  override fun getName(): String {
      return "NaurtSdk"
  }

  override fun onHostResume() {
    Naurt.resume(reactApplicationContext.applicationContext)
  }

  override fun onHostPause() {
    Naurt.pause()
  }

  override fun onHostDestroy() {
    Naurt.stop()
  }

  override fun canOverrideExistingModule(): Boolean {
    return true;
  }
  // =============================== Host Methods ==============================

  // =============================== Core Methods ==============================
  private fun addCallbacks() {
    // Set up observables with react events
    Naurt.isInitialised.addOnPropertyChangedCallback(isInitialisedCB)
    Naurt.isValidated.addOnPropertyChangedCallback(isValidatedCB)
    Naurt.isRunning.addOnPropertyChangedCallback(isRunningCB)
    Naurt.naurtPoint.addOnPropertyChangedCallback(naurtPointCB)
  }

  private fun removeCallbacks() {
    Naurt.isInitialised.removeOnPropertyChangedCallback(isInitialisedCB)
    Naurt.isValidated.removeOnPropertyChangedCallback(isValidatedCB)
    Naurt.isRunning.removeOnPropertyChangedCallback(isRunningCB)
    Naurt.naurtPoint.removeOnPropertyChangedCallback(naurtPointCB)
  }

  init {
    // Setup lifecycle events handled by android
    reactApplicationContext.addLifecycleEventListener(this)
    addCallbacks()
  }
  // =============================== Core Methods ==============================

  // ============================== React Methods ==============================
  @ReactMethod
  fun getIds(): Array<String> {
    return NAURT_EVENT_IDS
  }

  /** Initialise Naurt with a given context  */
  @ReactMethod
  fun initialiseNaurt(apiKey: String, precision: Int?) {
    // Guarded return, to prevent duplicate Initialisations
    if (Naurt.isInitialised.get()) {
      return
    }

    Naurt.initialise(
      apiKey,
      reactApplicationContext.applicationContext,
      precision?: 6
    )
  }

  /** Resume the Naurt Engine with a given context  */
  @ReactMethod
  fun resumeNaurt() {
    if (Naurt.isInitialised.get()) {
      // If we had previously initialised Naurt, resume the engine
      if (hadPaused) {
        Naurt.resume(reactApplicationContext.applicationContext)
        hadPaused = false
      }
      addCallbacks()
    }
  }

  /** Pause the Naurt Engine  */
  @ReactMethod
  fun pauseNaurt() {
    if (Naurt.isInitialised.get()) {
      Naurt.pause()
      hadPaused = true
      removeCallbacks()
    }
  }

  /** Start the Naurt engine  */
  @ReactMethod
  fun startNaurt() {
    if (Naurt.isInitialised.get()) {
      Naurt.start()
    }
  }

  /** Stop the Naurt Engine  */
  @ReactMethod
  fun stopNaurt() {
    if (Naurt.isInitialised.get()) {
      Naurt.stop()
    }
  }

  // TODO: Expose whole Journey & Other Naurt Metadata as JSON
}
