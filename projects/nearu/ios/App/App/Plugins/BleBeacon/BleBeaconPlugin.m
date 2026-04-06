#import <Capacitor/Capacitor.h>

CAP_PLUGIN(BleBeaconPlugin, "BleBeacon",
    CAP_PLUGIN_METHOD(startScanning, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopScanning, CAPPluginReturnPromise);
)
