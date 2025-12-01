//
//  ViewController.swift
//  AtomicClockDisplay
//
//  Created for iOS deployment of Atomic Clock & Weather Display
//

import UIKit
import WebKit
import SystemConfiguration

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    
    @IBOutlet weak var webView: WKWebView!
    @IBOutlet weak var refreshButton: UIButton!
    @IBOutlet weak var kioskModeButton: UIButton!
    
    private var refreshControl: UIRefreshControl!
    private var networkMonitor: NetworkMonitor!
    private var isKioskMode = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupWebView()
        setupNetworkMonitoring()
        setupRefreshControl()
        setupUI()
        loadDisplay()
        
        // Add notification observers
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(refreshWebView),
            name: NSNotification.Name("RefreshWebView"),
            object: nil
        )
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        // Configure for landscape orientation
        configureForLandscape()
        
        // Check if guided access is enabled
        checkGuidedAccessStatus()
    }
    
    // MARK: - WebView Setup
    
    private func setupWebView() {
        let webConfiguration = WKWebViewConfiguration()
        
        // Enable JavaScript
        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true
        webConfiguration.preferences = preferences
        
        // Allow inline media playback
        webConfiguration.allowsInlineMediaPlayback = true
        webConfiguration.mediaTypesRequiringUserActionForPlayback = []
        
        // Add script message handler for iOS integration
        let contentController = WKUserContentController()
        contentController.add(self, name: "iOSHandler")
        
        // Inject iOS-specific JavaScript
        let iosScript = WKUserScript(
            source: getIOSIntegrationScript(),
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        contentController.addUserScript(iosScript)
        
        webConfiguration.userContentController = contentController
        
        // Create WebView
        webView = WKWebView(frame: view.bounds, configuration: webConfiguration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        
        // Add to view hierarchy
        view.addSubview(webView)
        view.sendSubviewToBack(webView)
        
        // Setup constraints
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
        
        // Configure WebView properties
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.showsHorizontalScrollIndicator = false
        webView.scrollView.showsVerticalScrollIndicator = false
        
        // Configure for performance
        webView.configuration.allowsAirPlayForMediaPlayback = true
        webView.configuration.limitsNavigationsToAppBoundDomains = false
    }
    
    private func getIOSIntegrationScript() -> String {
        return """
        window.iOS = {
            isIOS: true,
            version: '\(UIDevice.current.systemVersion)',
            model: '\(UIDevice.current.model)',
            
            // Vibration API
            vibrate: function() {
                if (navigator.vibrate) {
                    navigator.vibrate(200);
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
            },
            
            // iOS-specific features
            isGuidedAccessEnabled: function() {
                return \(UIAccessibility.isGuidedAccessEnabled);
            },
            
            // Send message to iOS app
            sendMessage: function(message) {
                window.webkit.messageHandlers.iOSHandler.postMessage(message);
            }
        };
        
        // Auto-enable iOS features
        if (window.iOS.isGuidedAccessEnabled()) {
            console.log('iOS Guided Access mode detected');
            // Hide UI controls in guided access mode
            document.addEventListener('DOMContentLoaded', function() {
                const themePanel = document.getElementById('theme-panel');
                if (themePanel) {
                    themePanel.style.display = 'none';
                }
            });
        }
        """
    }
    
    // MARK: - Network Monitoring
    
    private func setupNetworkMonitoring() {
        networkMonitor = NetworkMonitor { [weak self] isConnected in
            DispatchQueue.main.async {
                if isConnected {
                    self?.loadDisplay()
                } else {
                    self?.loadOfflinePage()
                }
            }
        }
    }
    
    // MARK: - UI Setup
    
    private func setupUI() {
        view.backgroundColor = UIColor.black
        
        // Setup refresh button
        refreshButton = UIButton(type: .system)
        refreshButton.setTitle("Refresh", for: .normal)
        refreshButton.backgroundColor = UIColor.systemBlue
        refreshButton.setTitleColor(UIColor.white, for: .normal)
        refreshButton.layer.cornerRadius = 8
        refreshButton.translatesAutoresizingMaskIntoConstraints = false
        refreshButton.addTarget(self, action: #selector(refreshButtonTapped), for: .touchUpInside)
        
        view.addSubview(refreshButton)
        
        // Setup kiosk mode button
        kioskModeButton = UIButton(type: .system)
        kioskModeButton.setTitle("Enable Guided Access", for: .normal)
        kioskModeButton.backgroundColor = UIColor.systemGreen
        kioskModeButton.setTitleColor(UIColor.white, for: .normal)
        kioskModeButton.layer.cornerRadius = 8
        kioskModeButton.translatesAutoresizingMaskIntoConstraints = false
        kioskModeButton.addTarget(self, action: #selector(kioskModeButtonTapped), for: .touchUpInside)
        
        view.addSubview(kioskModeButton)
        
        // Setup constraints
        NSLayoutConstraint.activate([
            refreshButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            refreshButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            refreshButton.widthAnchor.constraint(equalToConstant: 100),
            refreshButton.heightAnchor.constraint(equalToConstant: 40),
            
            kioskModeButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            kioskModeButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            kioskModeButton.widthAnchor.constraint(equalToConstant: 160),
            kioskModeButton.heightAnchor.constraint(equalToConstant: 40)
        ])
    }
    
    private func setupRefreshControl() {
        refreshControl = UIRefreshControl()
        refreshControl.addTarget(self, action: #selector(refreshWebView), for: .valueChanged)
        
        webView.scrollView.addSubview(refreshControl)
    }
    
    // MARK: - Display Loading
    
    private func loadDisplay() {
        guard let url = Bundle.main.url(forResource: "display/index", withExtension: "html") else {
            loadOfflinePage()
            return
        }
        
        let request = URLRequest(url: url)
        webView.load(request)
    }
    
    private func loadOfflinePage() {
        let offlineHTML = """
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
        
        webView.loadHTMLString(offlineHTML, baseURL: nil)
    }
    
    // MARK: - Actions
    
    @objc private func refreshButtonTapped() {
        refreshWebView()
    }
    
    @objc private func kioskModeButtonTapped() {
        if !UIAccessibility.isGuidedAccessEnabled {
            showGuidedAccessAlert()
        } else {
            showGuidedAccessDisableAlert()
        }
    }
    
    @objc private func refreshWebView() {
        if networkMonitor.isConnected {
            webView.reload()
        } else {
            loadDisplay()
        }
        refreshControl.endRefreshing()
    }
    
    // MARK: - Guided Access
    
    private func checkGuidedAccessStatus() {
        DispatchQueue.main.async {
            if UIAccessibility.isGuidedAccessEnabled {
                self.kioskModeButton.setTitle("Disable Guided Access", for: .normal)
                self.kioskModeButton.backgroundColor = UIColor.systemRed
                self.hideUIControls()
            } else {
                self.kioskModeButton.setTitle("Enable Guided Access", for: .normal)
                self.kioskModeButton.backgroundColor = UIColor.systemGreen
                self.showUIControls()
            }
        }
    }
    
    private func showGuidedAccessAlert() {
        let alert = UIAlertController(
            title: "Enable Guided Access",
            message: "To enable Guided Access (kiosk mode):\n\n1. Go to Settings > Accessibility > Guided Access\n2. Turn on Guided Access\n3. Triple-click the Home/Power button to start\n\nGuided Access will lock the device to this app only.",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        alert.addAction(UIAlertAction(title: "Open Settings", style: .default) { _ in
            if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(settingsUrl)
            }
        })
        
        present(alert, animated: true)
    }
    
    private func showGuidedAccessDisableAlert() {
        let alert = UIAlertController(
            title: "Guided Access Active",
            message: "Guided Access is currently enabled. Triple-click the Home/Power button to disable it.",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func hideUIControls() {
        UIView.animate(withDuration: 0.3) {
            self.refreshButton.alpha = 0
            self.kioskModeButton.alpha = 0
        }
    }
    
    private func showUIControls() {
        UIView.animate(withDuration: 0.3) {
            self.refreshButton.alpha = 1
            self.kioskModeButton.alpha = 1
        }
    }
    
    // MARK: - Orientation
    
    private func configureForLandscape() {
        let value = UIInterfaceOrientation.landscapeRight.rawValue
        UIDevice.current.setValue(value, forKey: "orientation")
    }
    
    // MARK: - WKNavigationDelegate
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
        
        // Inject additional JavaScript after page load
        webView.evaluateJavaScript("console.log('iOS Atomic Clock Display loaded successfully')")
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        refreshControl.endRefreshing()
        loadOfflinePage()
    }
    
    // MARK: - WKScriptMessageHandler
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "iOSHandler" {
            handleJavaScriptMessage(message.body)
        }
    }
    
    private func handleJavaScriptMessage(_ messageBody: Any) {
        print("Received message from JavaScript: \(messageBody)")
        
        // Handle different message types
        if let message = messageBody as? [String: Any] {
            switch message["type"] as? String {
            case "vibrate":
                let generator = UIImpactFeedbackGenerator(style: .medium)
                generator.impactOccurred()
                
            case "enableKiosk":
                kioskModeButtonTapped()
                
            case "refresh":
                refreshWebView()
                
            default:
                print("Unknown message type: \(message["type"] ?? "unknown")")
            }
        }
    }
    
    // MARK: - Memory Management
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        networkMonitor?.stopMonitoring()
    }
}

// MARK: - Network Monitor

class NetworkMonitor {
    private let monitor: NWPathMonitor
    private let queue = DispatchQueue(label: "NetworkMonitor")
    private let isConnectedCallback: (Bool) -> Void
    
    var isConnected: Bool = true
    
    init(isConnectedCallback: @escaping (Bool) -> Void) {
        self.isConnectedCallback = isConnectedCallback
        self.monitor = NWPathMonitor()
        startMonitoring()
    }
    
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                let isConnected = path.status == .satisfied
                if self?.isConnected != isConnected {
                    self?.isConnected = isConnected
                    self?.isConnectedCallback(isConnected)
                }
            }
        }
        monitor.start(queue: queue)
    }
    
    func stopMonitoring() {
        monitor.cancel()
    }
}
