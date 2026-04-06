package com.streambe.nearu;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.streambe.nearu.plugins.ble.BleBeaconPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(BleBeaconPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
