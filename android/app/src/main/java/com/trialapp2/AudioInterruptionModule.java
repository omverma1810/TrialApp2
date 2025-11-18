package com.trialapp2;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class AudioInterruptionModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "AudioInterruptionModule";
    private ReactApplicationContext reactContext;
    private BroadcastReceiver noisyAudioReceiver;
    private PhoneStateListener phoneStateListener;
    private TelephonyManager telephonyManager;
    private AudioManager audioManager;
    private AudioManager.OnAudioFocusChangeListener focusChangeListener;
    private AudioFocusRequest audioFocusRequest;
    private boolean isCallActive = false;
    private android.os.Handler callStatePollingHandler;
    private Runnable callStatePollingRunnable;
    private boolean isPolling = false;

    public AudioInterruptionModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void startListening() {
        // Listen for incoming calls
        setupPhoneStateListener();
        
        // Listen for audio becoming noisy (headphones unplugged, etc.)
        setupNoisyAudioReceiver();
    }

    @ReactMethod
    public void stopListening() {
        // Cleanup listeners
        if (phoneStateListener != null && telephonyManager != null) {
            telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE);
            phoneStateListener = null;
        }

        if (noisyAudioReceiver != null) {
            try {
                reactContext.unregisterReceiver(noisyAudioReceiver);
            } catch (Exception e) {
                // Already unregistered
            }
            noisyAudioReceiver = null;
        }

        // Release audio focus
        if (audioManager != null && focusChangeListener != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (audioFocusRequest != null) {
                    audioManager.abandonAudioFocusRequest(audioFocusRequest);
                }
            } else {
                audioManager.abandonAudioFocus(focusChangeListener);
            }
            focusChangeListener = null;
            audioFocusRequest = null;
        }
        audioManager = null;
        
        // Stop call state polling
        stopCallStatePolling();
    }

    @ReactMethod
    public void checkMicrophoneAvailability(com.facebook.react.bridge.Promise promise) {
        try {
            boolean isAvailable = true;
            String reason = "available";
            
            // Check if there's an active phone call
            if (telephonyManager != null) {
                int callState = telephonyManager.getCallState();
                if (callState == TelephonyManager.CALL_STATE_RINGING || 
                    callState == TelephonyManager.CALL_STATE_OFFHOOK) {
                    isAvailable = false;
                    reason = "active_call";
                    android.util.Log.d("AudioInterruption", "🔍 Microphone check: UNAVAILABLE - Active call detected");
                } else {
                    android.util.Log.d("AudioInterruption", "🔍 Microphone check: AVAILABLE - No active call");
                }
            }
            
            promise.resolve(isAvailable);
        } catch (Exception e) {
            android.util.Log.e("AudioInterruption", "Error checking microphone availability", e);
            promise.reject("ERROR", "Failed to check microphone availability", e);
        }
    }

    private void setupPhoneStateListener() {
        if (!hasReadPhoneStatePermission()) {
            // Permission not granted - skip phone state listener to avoid crashes
            return;
        }

        telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        if (telephonyManager == null) {
            return;
        }

        phoneStateListener = new PhoneStateListener() {
            @Override
            public void onCallStateChanged(int state, String phoneNumber) {
                android.util.Log.d("AudioInterruption", "📱 Phone state changed to: " + state);
                switch (state) {
                    case TelephonyManager.CALL_STATE_RINGING:
                        android.util.Log.d("AudioInterruption", "📞 CALL_STATE_RINGING");
                    case TelephonyManager.CALL_STATE_OFFHOOK:
                        if (state == TelephonyManager.CALL_STATE_OFFHOOK) {
                            android.util.Log.d("AudioInterruption", "📞 CALL_STATE_OFFHOOK");
                        }
                        // Incoming call or call answered
                        if (!isCallActive) {
                            isCallActive = true;
                            android.util.Log.d("AudioInterruption", "📞 CALL ACTIVE - Sending 'call' event");
                            sendEvent("onAudioInterruption", "call");
                        }
                        break;
                    case TelephonyManager.CALL_STATE_IDLE:
                        android.util.Log.d("AudioInterruption", "📴 CALL_STATE_IDLE - isCallActive: " + isCallActive);
                        // Call ended - but only send event if we had an active call
                        if (isCallActive) {
                            isCallActive = false;
                            android.util.Log.d("AudioInterruption", "📴 CALL ENDED - Sending immediate event");
                            
                            // Send immediate event to unblock UI quickly
                            sendEvent("onAudioInterruption", "call_ended");
                            
                            // Also send focus_gain after a delay to ensure audio is ready
                            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(new Runnable() {
                                @Override
                                public void run() {
                                    // Double-check that we're still in IDLE state
                                    if (telephonyManager != null &&
                                        telephonyManager.getCallState() == TelephonyManager.CALL_STATE_IDLE) {
                                        android.util.Log.d("AudioInterruption", "✅ Call still idle - Sending 'focus_gain' event for audio recovery");
                                        sendEvent("onAudioInterruption", "focus_gain");
                                    }
                                }
                            }, 500); // Wait 500ms for audio resources to be ready
                        } else {
                            android.util.Log.d("AudioInterruption", "⚠️ CALL_STATE_IDLE but isCallActive was false");
                            // Still send focus_gain in case the state got out of sync
                            android.util.Log.d("AudioInterruption", "🔄 Sending 'focus_gain' anyway to recover from stuck state");
                            sendEvent("onAudioInterruption", "focus_gain");
                        }
                        break;
                }
            }
        };

        telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
    }

    private void setupNoisyAudioReceiver() {
        // Listen for multiple audio-related intents
        IntentFilter filter = new IntentFilter();
        filter.addAction(AudioManager.ACTION_AUDIO_BECOMING_NOISY);
        // Also listen for audio focus changes from other apps
        
        noisyAudioReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(action)) {
                    sendEvent("onAudioInterruption", "noisy");
                }
            }
        };

        reactContext.registerReceiver(noisyAudioReceiver, filter);
        
        // Also monitor audio focus changes directly
        setupAudioFocusListener();
    }
    
    private void setupAudioFocusListener() {
        audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        if (audioManager == null) {
            return;
        }
        
        focusChangeListener = new AudioManager.OnAudioFocusChangeListener() {
            @Override
            public void onAudioFocusChange(int focusChange) {
                android.util.Log.d("AudioInterruption", "🎧 Audio Focus Change: " + focusChange);
                switch (focusChange) {
                    case AudioManager.AUDIOFOCUS_LOSS:
                        // Permanent audio focus loss - another app is playing audio
                        android.util.Log.d("AudioInterruption", "❌ AUDIOFOCUS_LOSS - Sending 'focus_loss' event");
                        sendEvent("onAudioInterruption", "focus_loss");
                        break;
                    case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                        // Temporary audio focus loss (e.g., notification sound, phone call)
                        android.util.Log.d("AudioInterruption", "⏸️ AUDIOFOCUS_LOSS_TRANSIENT - Sending 'focus_loss_transient' event");
                        sendEvent("onAudioInterruption", "focus_loss_transient");
                        
                        // Start polling for call end since PhoneStateListener might not work
                        startCallStatePolling();
                        break;
                    case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                        // Can duck - another app wants to play audio
                        android.util.Log.d("AudioInterruption", "🔉 AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK - Sending 'focus_loss_can_duck' event");
                        sendEvent("onAudioInterruption", "focus_loss_can_duck");
                        break;
                    case AudioManager.AUDIOFOCUS_GAIN:
                        // Audio focus regained - check if call has ended
                        android.util.Log.d("AudioInterruption", "🔊 AUDIO FOCUS GAINED");
                        
                        // Check if there's an active call before sending focus_gain
                        boolean hasActiveCall = false;
                        if (telephonyManager != null) {
                            int callState = telephonyManager.getCallState();
                            hasActiveCall = (callState == TelephonyManager.CALL_STATE_RINGING || 
                                           callState == TelephonyManager.CALL_STATE_OFFHOOK);
                            android.util.Log.d("AudioInterruption", "Call state: " + callState + ", hasActiveCall: " + hasActiveCall);
                        }
                        
                        // Only send focus_gain if there's no active call
                        if (!hasActiveCall) {
                            android.util.Log.d("AudioInterruption", "✅ No active call - Sending 'focus_gain' event");
                            sendEvent("onAudioInterruption", "focus_gain");
                            
                            // Reset isCallActive flag if it was somehow stuck
                            if (isCallActive) {
                                android.util.Log.d("AudioInterruption", "⚠️ Resetting stuck isCallActive flag");
                                isCallActive = false;
                            }
                        } else {
                            android.util.Log.d("AudioInterruption", "⏳ Active call in progress - NOT sending focus_gain");
                        }
                        break;
                }
            }
        };
        
        // Request audio focus to monitor changes
        // This allows us to detect when other apps take audio focus
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(
                            new android.media.AudioAttributes.Builder()
                                    .setUsage(android.media.AudioAttributes.USAGE_MEDIA)
                                    .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SPEECH)
                                    .build())
                    .setOnAudioFocusChangeListener(focusChangeListener)
                    .build();
            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            audioManager.requestAudioFocus(
                    focusChangeListener,
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN
            );
        }
    }

    private void sendEvent(String eventName, String reason) {
        android.util.Log.d("AudioInterruption", "📤 SENDING EVENT: " + eventName + " with reason: " + reason);
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, reason);
        android.util.Log.d("AudioInterruption", "✉️ Event sent successfully");
    }

    private boolean hasReadPhoneStatePermission() {
        return ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.READ_PHONE_STATE
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;
    }

    private void startCallStatePolling() {
        if (isPolling) {
            android.util.Log.d("AudioInterruption", "⏰ Call state polling already active");
            return;
        }
        
        android.util.Log.d("AudioInterruption", "⏰ Starting call state polling");
        isPolling = true;
        
        if (callStatePollingHandler == null) {
            callStatePollingHandler = new android.os.Handler(android.os.Looper.getMainLooper());
        }
        
        callStatePollingRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isPolling) {
                    return;
                }
                
                // Check if call has ended
                if (telephonyManager != null) {
                    int callState = telephonyManager.getCallState();
                    android.util.Log.d("AudioInterruption", "⏰ Polling - Call state: " + callState);
                    
                    if (callState == TelephonyManager.CALL_STATE_IDLE) {
                        android.util.Log.d("AudioInterruption", "✅ Call ended detected by polling!");
                        stopCallStatePolling();
                        
                        // Send recovery events
                        sendEvent("onAudioInterruption", "call_ended");
                        
                        // Wait a bit for audio to be ready
                        callStatePollingHandler.postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                android.util.Log.d("AudioInterruption", "✅ Sending 'focus_gain' after call end");
                                sendEvent("onAudioInterruption", "focus_gain");
                            }
                        }, 500);
                    } else {
                        // Call still active, continue polling
                        callStatePollingHandler.postDelayed(this, 1000); // Check every second
                    }
                }
            }
        };
        
        // Start polling immediately
        callStatePollingHandler.post(callStatePollingRunnable);
    }
    
    private void stopCallStatePolling() {
        android.util.Log.d("AudioInterruption", "🛑 Stopping call state polling");
        isPolling = false;
        if (callStatePollingHandler != null && callStatePollingRunnable != null) {
            callStatePollingHandler.removeCallbacks(callStatePollingRunnable);
        }
    }

    /**
     * Required for NativeEventEmitter support on React Native 0.65+
     */
    @ReactMethod
    public void addListener(String eventName) {
        // No-op. RN requires this method to avoid warning.
    }

    @ReactMethod
    public void removeListeners(double count) {
        // No-op. RN requires this method to avoid warning.
    }

    @Override
    public void invalidate() {
        super.invalidate();
        stopListening();
    }
}
