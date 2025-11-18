#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AudioInterruptionModule, RCTEventEmitter)

RCT_EXTERN_METHOD(startListening)
RCT_EXTERN_METHOD(stopListening)
RCT_EXTERN_METHOD(checkMicrophoneAvailability:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
