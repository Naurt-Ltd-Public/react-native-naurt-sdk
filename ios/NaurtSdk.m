#import "NaurtSdk.h"

// TODO: Need to make all these interfaces
@interface RCT_EXTERN_MODULE(NaurtSdk, NaurtDelegate, RCTEventEmitter)

RCT_EXTERN_METHOD(init: (String)apiKey)

RCT_EXTERN_METHOD(startNaurt)
RCT_EXTERN_METHOD(stopNaurt)

RCT_EXTERN_METHOD()
@end
