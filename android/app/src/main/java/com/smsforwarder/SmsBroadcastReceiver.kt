package com.smsforwarder

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

/**
 * Receives SMS_RECEIVED broadcasts from the Android system.
 * Extracts sender/body/timestamp and forwards to SmsForegroundService,
 * which in turn emits the event to the React Native JS layer.
 */
class SmsBroadcastReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "SmsBroadcastReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        if (messages.isNullOrEmpty()) {
            Log.w(TAG, "onReceive: no SmsMessage objects in intent")
            return
        }

        // Group message parts by originating address (multi-part SMS).
        val grouped = mutableMapOf<String, StringBuilder>()
        var timestamp = System.currentTimeMillis()

        for (sms in messages) {
            val sender = sms.displayOriginatingAddress ?: "unknown"
            grouped.getOrPut(sender) { StringBuilder() }.append(sms.displayMessageBody ?: "")
            timestamp = sms.timestampMillis
        }

        for ((sender, bodyBuilder) in grouped) {
            val body = bodyBuilder.toString()
            Log.d(TAG, "SMS from $sender: ${body.take(80)}…")

            // Forward to the foreground service for emission.
            val serviceIntent = Intent(context, SmsForegroundService::class.java).apply {
                action = SmsForegroundService.ACTION_SMS_RECEIVED
                putExtra(SmsForegroundService.EXTRA_SENDER, sender)
                putExtra(SmsForegroundService.EXTRA_BODY, body)
                putExtra(SmsForegroundService.EXTRA_TIMESTAMP, timestamp)
            }
            context.startService(serviceIntent)
        }
    }
}
