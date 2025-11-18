import Foundation
import AVFoundation
import CallKit

@objc(AudioInterruptionModule)
class AudioInterruptionModule: RCTEventEmitter {

    private var callObserver: CXCallObserver?
    private var isCallActive = false
    private var callEndTimer: Timer?
    private var callStatePollingTimer: Timer?
    private var isPolling = false

    override init() {
        super.init()
        setupCallObserver()
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return ["onAudioInterruption"]
    }
    
    @objc
    func startListening() {
        // Setup audio session interruption notification
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioInterruption),
            name: AVAudioSession.interruptionNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        // Setup route change notification (headphones unplugged, etc.)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRouteChange),
            name: AVAudioSession.routeChangeNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        // Setup media services were reset notification
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMediaServicesReset),
            name: AVAudioSession.mediaServicesWereResetNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        // Setup silent mode detection
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleSilentModeChange),
            name: AVAudioSession.silenceSecondaryAudioHintNotification,
            object: AVAudioSession.sharedInstance()
        )
    }
    
    @objc
    func stopListening() {
        NotificationCenter.default.removeObserver(
            self,
            name: AVAudioSession.interruptionNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        NotificationCenter.default.removeObserver(
            self,
            name: AVAudioSession.routeChangeNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        NotificationCenter.default.removeObserver(
            self,
            name: AVAudioSession.mediaServicesWereResetNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        NotificationCenter.default.removeObserver(
            self,
            name: AVAudioSession.silenceSecondaryAudioHintNotification,
            object: AVAudioSession.sharedInstance()
        )
        
        // Stop call state polling
        stopCallStatePolling()
    }
    
    private func setupCallObserver() {
        callObserver = CXCallObserver()
        callObserver?.setDelegate(self, queue: nil)
    }
    
    // Required for NativeEventEmitter support on React Native 0.65+
    @objc
    func addListener(_ eventName: String) {
        // No-op. RN requires this method to avoid warning.
    }
    
    @objc
    func removeListeners(_ count: Double) {
        // No-op. RN requires this method to avoid warning.
    }
    
    @objc
    func checkMicrophoneAvailability(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Check if there are any active calls
        let hasActiveCalls = callObserver?.calls.contains { !$0.hasEnded } ?? false
        
        if hasActiveCalls {
            NSLog("🔍 Microphone check: UNAVAILABLE - Active call detected")
            resolve(false)
        } else {
            NSLog("🔍 Microphone check: AVAILABLE - No active call")
            resolve(true)
        }
    }
    
    @objc
    private func handleAudioInterruption(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
            return
        }
        
        switch type {
        case .began:
            // Audio interruption began (incoming call, alarm, etc.)
            NSLog("🔴 Audio interruption began - Sending 'began' event")
            sendEvent(withName: "onAudioInterruption", body: "began")
            
            // Start polling to detect when interruption ends
            startCallStatePolling()
        case .ended:
            // Audio interruption ended
            NSLog("🟢 Audio interruption ended")
            // Polling will handle sending the recovery events
            break
        @unknown default:
            break
        }
    }
    
    @objc
    private func handleRouteChange(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else {
            return
        }
        
        switch reason {
        case .oldDeviceUnavailable:
            // Headphones unplugged or audio device disconnected
            NSLog("🔌 Audio device unavailable - Sending 'deviceUnavailable' event")
            sendEvent(withName: "onAudioInterruption", body: "deviceUnavailable")
        case .override:
            // Audio route was overridden by another app
            NSLog("⚠️ Audio route override - Sending 'routeOverride' event")
            sendEvent(withName: "onAudioInterruption", body: "routeOverride")
        default:
            break
        }
    }
    
    @objc
    private func handleMediaServicesReset(notification: Notification) {
        // Media services were reset - cancel recording for safety
        NSLog("🔄 Media services reset - Sending 'mediaServicesReset' event")
        sendEvent(withName: "onAudioInterruption", body: "mediaServicesReset")
    }
    
    @objc
    private func handleSilentModeChange(notification: Notification) {
        // Another app requested to silence secondary audio (our recording)
        guard let userInfo = notification.userInfo,
              let typeValue = userInfo[AVAudioSessionSilenceSecondaryAudioHintTypeKey] as? UInt,
              let type = AVAudioSession.SilenceSecondaryAudioHintType(rawValue: typeValue) else {
            return
        }
        
        if type == .begin {
            // Another app is playing audio and requesting we be silenced
            NSLog("🔇 Secondary audio silenced - Sending 'secondaryAudioSilenced' event")
            sendEvent(withName: "onAudioInterruption", body: "secondaryAudioSilenced")
        }
    }
    
    private func startCallStatePolling() {
        if isPolling {
            NSLog("⏰ Call state polling already active")
            return
        }
        
        NSLog("⏰ Starting call state polling")
        isPolling = true
        
        callStatePollingTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            
            if !self.isPolling {
                return
            }
            
            // Check if any calls are still active
            let hasActiveCalls = self.callObserver?.calls.contains { !$0.hasEnded } ?? false
            NSLog("⏰ Polling - Has active calls: \(hasActiveCalls)")
            
            if !hasActiveCalls {
                NSLog("✅ No active calls detected by polling!")
                self.stopCallStatePolling()
                
                // Send recovery events
                self.sendEvent(withName: "onAudioInterruption", body: "call_ended")
                
                // Wait a bit for audio to be ready
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    NSLog("✅ Sending 'focus_gain' after call end")
                    self.sendEvent(withName: "onAudioInterruption", body: "focus_gain")
                }
            }
        }
    }
    
    private func stopCallStatePolling() {
        NSLog("🛑 Stopping call state polling")
        isPolling = false
        callStatePollingTimer?.invalidate()
        callStatePollingTimer = nil
    }
    
    deinit {
        callEndTimer?.invalidate()
        callEndTimer = nil
        stopCallStatePolling()
        stopListening()
    }
}

// MARK: - CXCallObserverDelegate
extension AudioInterruptionModule: CXCallObserverDelegate {
    func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
        NSLog("📱 Call state changed - hasConnected: \(call.hasConnected), hasEnded: \(call.hasEnded)")
        
        if call.hasConnected || !call.hasEnded {
            // Call is active or ringing
            if !isCallActive {
                isCallActive = true
                // Cancel any pending call end timer
                callEndTimer?.invalidate()
                callEndTimer = nil
                NSLog("📞 CALL ACTIVE - Sending 'call' event")
                sendEvent(withName: "onAudioInterruption", body: "call")
                
                // Start polling to detect when call ends
                startCallStatePolling()
            }
        } else if call.hasEnded {
            NSLog("📴 Call has ended - isCallActive: \(isCallActive)")
            // Call has ended - send immediate event
            if isCallActive {
                isCallActive = false
                // Cancel any existing timer
                callEndTimer?.invalidate()
                callEndTimer = nil
                
                NSLog("📴 CALL ENDED - Sending immediate event")
                
                // Send immediate event to unblock UI quickly
                sendEvent(withName: "onAudioInterruption", body: "call_ended")
                
                // Also send focus_gain after a delay to ensure audio is ready
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    guard let self = self else { return }
                    
                    // Double-check that no calls are active
                    let hasActiveCalls = callObserver.calls.contains { !$0.hasEnded }
                    if !hasActiveCalls {
                        NSLog("✅ Call still ended - Sending 'focus_gain' event for audio recovery")
                        self.sendEvent(withName: "onAudioInterruption", body: "focus_gain")
                    }
                }
                
                // Stop polling since we detected the call end
                stopCallStatePolling()
            } else {
                NSLog("⚠️ Call ended but isCallActive was false")
                // Still send focus_gain in case state got out of sync
                NSLog("🔄 Sending 'focus_gain' anyway to recover from stuck state")
                sendEvent(withName: "onAudioInterruption", body: "focus_gain")
            }
        }
    }
}
