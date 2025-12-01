package com.display.atomicclock

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.view.View
import android.view.Window
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.display.atomicclock.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private var isKioskMode = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge display
        enableEdgeToEdge()
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize WebView and setup
        setupWebView()
        setupSwipeRefresh()
        setupFullscreenMode()
        loadDisplay()
        
        // Check if started as kiosk mode
        checkKioskMode()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView = binding.webView
        swipeRefreshLayout = binding.swipeRefreshLayout

        // WebView configuration
        webView.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false
                
                // Performance optimizations
                setRenderPriority(WebSettings.RenderPriority.HIGH)
                cacheMode = WebSettings.LOAD_DEFAULT
                loadsImagesAutomatically = true
                
                // Zoom and scrolling
                setSupportZoom(false)
                builtInZoomControls = false
                displayZoomControls = false
                
                // Text and display
                textZoom = 100
                defaultTextEncodingName = "utf-8"
                
                // Security
                allowFileAccessFromFileURLs = false
                allowUniversalAccessFromFileURLs = false
                
                // Hardware acceleration
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    setLayerType(View.LAYER_TYPE_HARDWARE, null)
                }
            }

            // WebView client for handling navigation
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    // Allow all URLs to load within the WebView
                    return false
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    swipeRefreshLayout.isRefreshing = false
                    
                    // Inject Android-specific JavaScript
                    injectAndroidFeatures()
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceResponse?) {
                    super.onReceivedError(view, request, error)
                    swipeRefreshLayout.isRefreshing = false
                    loadOfflinePage()
                }
            }

            // WebChrome client for progress and console
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    super.onProgressChanged(view, newProgress)
                    if (newProgress == 100) {
                        swipeRefreshLayout.isRefreshing = false
                    }
                }

                override fun onConsoleMessage(message: String?, lineNumber: Int, sourceID: String?): Boolean {
                    android.util.Log.d("WebView", "Console: $message at $sourceID:$lineNumber")
                    return true
                }
            }
        }
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.apply {
            setColorSchemeColors(
                getColor(android.R.color.holo_blue_bright),
                getColor(android.R.color.holo_green_light),
                getColor(android.R.color.holo_orange_light),
                getColor(android.R.color.holo_red_light)
            )
            
            setOnRefreshListener {
                webView.reload()
            }
        }
    }

    private fun setupFullscreenMode() {
        // Hide system bars
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).let { controller ->
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        // Keep screen on
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        
        // Prevent sleep
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (powerManager.isIgnoringBatteryOptimizations(packageName)) {
                window.addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
            }
        }
    }

    private fun loadDisplay() {
        // Load the display from local file or remote URL
        val displayUrl = "file:///android_asset/display/index.html"
        
        if (isNetworkAvailable()) {
            webView.loadUrl(displayUrl)
        } else {
            loadOfflinePage()
        }
    }

    private fun loadOfflinePage() {
        val offlineHtml = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - Atomic Clock Display</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .offline-container {
                        padding: 2rem;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                    }
                    .icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                    }
                    h1 {
                        font-size: 2rem;
                        margin-bottom: 1rem;
                    }
                    p {
                        font-size: 1.2rem;
                        opacity: 0.8;
                        margin-bottom: 2rem;
                    }
                    button {
                        background: rgba(255, 255, 255, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        padding: 1rem 2rem;
                        border-radius: 10px;
                        font-size: 1rem;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="icon">📡</div>
                    <h1>Offline Mode</h1>
                    <p>No internet connection available. Some features may be limited.</p>
                    <button onclick="location.reload()">Retry Connection</button>
                </div>
            </body>
            </html>
        """
        webView.loadDataWithBaseURL(null, offlineHtml, "text/html", "UTF-8", null)
    }

    private fun injectAndroidFeatures() {
        val androidJS = """
            javascript:
            // Inject Android-specific features
            window.Android = {
                isKioskMode: $isKioskMode,
                platform: 'android',
                version: '${Build.VERSION.RELEASE}',
                
                // Vibration API
                vibrate: function(pattern) {
                    if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(pattern);
                    }
                },
                
                // Screen orientation
                lockOrientation: function() {
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape');
                    }
                },
                
                // Battery status
                getBatteryInfo: function() {
                    if (navigator.getBattery) {
                        return navigator.getBattery();
                    }
                    return Promise.resolve(null);
                }
            };
            
            // Auto-enable kiosk features
            if (window.Android.isKioskMode) {
                document.addEventListener('DOMContentLoaded', function() {
                    // Hide theme panel in kiosk mode
                    const themePanel = document.getElementById('theme-panel');
                    if (themePanel) {
                        themePanel.style.display = 'none';
                    }
                    
                    // Enable auto-refresh
                    console.log('Android kiosk mode enabled');
                });
            }
        """
        webView.evaluateJavascript(androidJS, null)
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return false
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } else {
            @Suppress("DEPRECATION")
            val networkInfo = connectivityManager.activeNetworkInfo ?: return false
            @Suppress("DEPRECATION")
            return networkInfo.isConnected
        }
    }

    private fun checkKioskMode() {
        // Check if app is set as launcher
        val homeActivities = (getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager)
            .getHomeActivities()
        
        isKioskMode = homeActivities.any { it.baseActivity?.packageName == packageName }
        
        if (isKioskMode) {
            enableKioskMode()
        }
    }

    private fun enableKioskMode() {
        // Lock orientation to landscape
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        
        // Hide navigation completely
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let {
                it.hide(WindowInsets.Type.systemBars())
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                )
        }
        
        // Prevent app from being closed
        startLockTask()
    }

    override fun onBackPressed() {
        if (isKioskMode) {
            // In kiosk mode, disable back button
            return
        }
        super.onBackPressed()
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (isKioskMode) {
            // Bring app to front in kiosk mode
            val startMain = Intent(Intent.ACTION_MAIN)
            startMain.addCategory(Intent.CATEGORY_HOME)
            startMain.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(startMain)
            
            // Restart our app
            val intent = Intent(this, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
    }

    override fun onResume() {
        super.onResume()
        if (isKioskMode) {
            startLockTask()
        }
    }

    override fun onPause() {
        super.onPause()
        if (isKioskMode) {
            stopLockTask()
        }
    }
}
