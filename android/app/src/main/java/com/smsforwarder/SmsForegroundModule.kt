package com.smsforwarder

import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native native module exposed as `SmsForegroundModule`.
 *
 * JS API:
 *   SmsForegroundModule.startService()  → starts the persistent foreground service
 *   SmsForegroundModule.stopService()   → stops the foreground service
 *
 * Events emitted to JS:
 *   "onIncomingSms" → { sender: string, body: string, timestamp: number }
 */
class SmsForegroundModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "SmsForegroundModule"

        // Static reference so SmsForegroundService can emit events via this module.
        private var sReactContext: ReactApplicationContext? = null

        fun emitSmsEvent(sender: String, body: String, timestamp: Long) {
            val ctx = sReactContext
            if (ctx == null || !ctx.hasActiveReactInstance()) {
                Log.w(TAG, "emitSmsEvent: no active React context, event dropped.")
                return
            }

            val params = Arguments.createMap().apply {
                putString("sender", sender)
                putString("body", body)
                putDouble("timestamp", timestamp.toDouble())
            }

            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onIncomingSms", params)

            Log.d(TAG, "emitSmsEvent → sender=$sender (emitted to JS)")
        }
    }

    override fun getName(): String = "SmsForegroundModule"

    override fun initialize() {
        super.initialize()
        sReactContext = reactContext
    }

    override fun invalidate() {
        super.invalidate()
        if (sReactContext === reactContext) {
            sReactContext = null
        }
    }

    @ReactMethod
    fun startService(promise: Promise) {
        try {
            val intent = Intent(reactContext, SmsForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            Log.i(TAG, "startService requested.")
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "startService failed", e)
            promise.reject("SERVICE_ERR", e.message, e)
        }
    }

    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            val intent = Intent(reactContext, SmsForegroundService::class.java)
            reactContext.stopService(intent)
            Log.i(TAG, "stopService requested.")
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "stopService failed", e)
            promise.reject("SERVICE_ERR", e.message, e)
        }
    }

    // Required by RN for NativeEventEmitter.
    @ReactMethod
    fun addListener(eventName: String) { /* no-op */ }

    @ReactMethod
    fun removeListeners(count: Int) { /* no-op */ }
}
