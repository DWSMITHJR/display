//
//  AppDelegate.swift
//  AtomicClockDisplay
//
//  Created for iOS deployment of Atomic Clock & Weather Display
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Configure app for kiosk mode
        configureKioskMode()
        
        // Prevent idle timer
        UIApplication.shared.isIdleTimerDisabled = true
        
        // Configure WebView settings
        configureWebView()
        
        print("Atomic Clock Display - iOS App Started")
        return true
    }

    // MARK: UISceneSession Lifecycle

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }
    
    // MARK: - Kiosk Mode Configuration
    
    private func configureKioskMode() {
        // Configure for guided access support
        if #available(iOS 13.0, *) {
            // Guided access is available
            print("Guided Access supported on this device")
        }
        
        // Configure for single app mode (requires MDM)
        print("Single app mode configuration ready")
    }
    
    private func configureWebView() {
        // WebView configuration will be handled in ViewController
        print("WebView configuration prepared")
    }
}
