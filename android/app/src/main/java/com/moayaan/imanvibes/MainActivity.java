package com.moayaan.imanvibes;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidSystemPlugin.class);
        registerPlugin(AndroidCompassPlugin.class);
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                dispatchBackToWebApp();
            }
        });
    }

    private void dispatchBackToWebApp() {
        if (bridge == null || bridge.getWebView() == null) {
            return;
        }

        bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(
            "window.__imanvibesHandleNativeBack && window.__imanvibesHandleNativeBack();",
            null
        ));
    }
}
