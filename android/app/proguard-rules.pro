# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep class org.chromium.** { *; }

# Capacitor Plugins
-keep class com.capacitorjs.plugins.clipboard.** { *; }
-keep class com.capacitorjs.plugins.filesystem.** { *; }
-keep class com.capacitorjs.plugins.geolocation.** { *; }
-keep class com.capacitorjs.plugins.share.** { *; }
-keep class com.capacitorjs.plugins.localnotifications.** { *; }
-keep class com.example.tts.** { *; }

# Cordova (required by Capacitor)
-keep class org.apache.cordova.** { *; }
-keep class org.chromium.** { *; }

# WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
