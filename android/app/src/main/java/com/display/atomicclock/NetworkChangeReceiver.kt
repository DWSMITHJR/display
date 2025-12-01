package com.display.atomicclock

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.util.Log

class NetworkChangeReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (ConnectivityManager.CONNECTIVITY_ACTION == intent.action) {
            
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val activeNetwork = connectivityManager.activeNetworkInfo
            val isConnected = activeNetwork?.isConnectedOrConnecting == true
            
            Log.d("NetworkChangeReceiver", "Network connectivity changed: $isConnected")
            
            // Notify MainActivity about network change
            val mainIntent = Intent(context, MainActivity::class.java).apply {
                action = "NETWORK_CHANGE"
                putExtra("isConnected", isConnected)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            
            context.startActivity(mainIntent)
        }
    }
}
