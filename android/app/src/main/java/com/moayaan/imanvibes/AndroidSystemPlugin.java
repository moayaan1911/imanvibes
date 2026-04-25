package com.moayaan.imanvibes;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidSystem")
public class AndroidSystemPlugin extends Plugin {
    @PluginMethod
    public void openAppSettings(PluginCall call) {
        String packageName = getContext().getPackageName();
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.parse("package:" + packageName));
        startActivitySafely(intent, call);
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        String packageName = getContext().getPackageName();
        Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
        intent.putExtra(Settings.EXTRA_APP_PACKAGE, packageName);
        intent.setData(Uri.parse("package:" + packageName));

        if (!canResolve(intent)) {
            openAppSettings(call);
            return;
        }

        startActivitySafely(intent, call);
    }

    @PluginMethod
    public void openLocationSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        startActivitySafely(intent, call);
    }

    @PluginMethod
    public void openPlayStorePage(PluginCall call) {
        String packageName = getContext().getPackageName();
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + packageName));

        if (!canResolve(intent)) {
            intent = new Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=" + packageName)
            );
        }

        startActivitySafely(intent, call);
    }

    private boolean canResolve(Intent intent) {
        return intent.resolveActivity(getContext().getPackageManager()) != null;
    }

    private void startActivitySafely(Intent intent, PluginCall call) {
        if (getActivity() == null) {
            call.reject("Android activity is unavailable.");
            return;
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (!canResolve(intent)) {
            call.reject("No Android screen is available for this action.");
            return;
        }

        getActivity().startActivity(intent);
        call.resolve();
    }
}
