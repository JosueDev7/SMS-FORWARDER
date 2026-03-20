package com.smsforwarder

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Persistent foreground service that keeps the app alive so the
 * SmsBroadcastReceiver can emit events to React Native even when
 * the app is in the background.
 *
 * Lifecycle:
 *   startService  → shows persistent notification, keeps wakelock-like behaviour.
 *   stopService   → removes notification, stops self.
 *   SMS_RECEIVED  → SmsBroadcastReceiver forwards the SMS data here;
 *                   we then emit it to JS via SmsForegroundModule.
 */
class SmsForegroundService : Service() {

    companion object {
        private const val TAG = "SmsForegroundService"
        const val CHANNEL_ID = "sms_forwarder_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_SMS_RECEIVED = "com.smsforwarder.ACTION_SMS_RECEIVED"
        const val EXTRA_SENDER = "sender"
        const val EXTRA_BODY = "body"
        const val EXTRA_TIMESTAMP = "timestamp"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SMS_RECEIVED -> {
                val sender = intent.getStringExtra(EXTRA_SENDER) ?: "unknown"
                val body = intent.getStringExtra(EXTRA_BODY) ?: ""
                val timestamp = intent.getLongExtra(EXTRA_TIMESTAMP, System.currentTimeMillis())

                Log.d(TAG, "Emitting SMS to JS → sender=$sender")
                SmsForegroundModule.emitSmsEvent(sender, body, timestamp)
            }
            else -> {
                // Start / keep-alive — promote to foreground.
                startForeground(NOTIFICATION_ID, buildNotification())
                Log.i(TAG, "Foreground service started.")
            }
        }

        // Restart service if system kills it while the user hasn't stopped it.
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        Log.i(TAG, "Foreground service destroyed.")
        super.onDestroy()
    }

    // ─── Notification helpers ────────────────────────────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SMS Interceptor",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Mantiene activo el servicio de intercepción SMS."
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SMS Forwarder")
            .setContentText("Interceptando mensajes SMS…")
            .setSmallIcon(android.R.drawable.ic_dialog_email)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }
}
