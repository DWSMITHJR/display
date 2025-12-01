//
//  SceneDelegate.swift
//  AtomicClockDisplay
//
//  Created for iOS deployment of Atomic Clock & Weather Display
//

import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Use this method to optionally configure and attach the UIWindow `window` to the provided UIWindowScene `scene`.
        // If using a storyboard, the `window` property will automatically be set and attached to the scene.
        // This delegate does not imply the connecting scene or session are new (see `application:configurationForConnectingSceneSession` instead).
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        // Configure window for kiosk display
        configureWindowForKiosk(windowScene)
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
        // This occurs shortly after the scene enters the background, or when its session is discarded.
        // Release any resources associated with this scene that can be re-created the next time the scene connects.
        // The scene may re-connect later, as its session was not necessarily discarded (see `application:didDiscardSceneSessions` instead).
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Called when the scene has moved from an inactive state to an active state.
        // Use this method to restart any tasks that were paused (or not yet started) when the scene was inactive.
        
        // Ensure idle timer is disabled when becoming active
        UIApplication.shared.isIdleTimerDisabled = true
        
        print("Scene became active - Atomic Clock Display")
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will move from an active state to an inactive state.
        // This may occur due to temporary interruptions (ex. an incoming phone call).
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
        // Use this method to undo the changes made on entering the background.
        
        // Refresh WebView when entering foreground
        NotificationCenter.default.post(name: NSNotification.Name("RefreshWebView"), object: nil)
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called as the scene transitions from the foreground to the background.
        // Use this method to save data, release shared resources, and store enough scene-specific state information
        // to restore the scene back to its current state.
        
        // Save any necessary data
        UserDefaults.standard.synchronize()
    }
    
    // MARK: - Kiosk Configuration
    
    private func configureWindowForKiosk(_ windowScene: UIWindowScene) {
        // Configure window properties for kiosk mode
        window?.tintColor = UIColor.systemBlue
        
        // Set preferred orientations (landscape for display)
        if #available(iOS 16.0, *) {
            windowScene.requestGeometryUpdate(.iOS(interfaceOrientations: .landscape))
        }
        
        print("Window configured for kiosk display")
    }
}
