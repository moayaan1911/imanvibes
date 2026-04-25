package com.moayaan.imanvibes;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.SystemClock;
import android.view.Display;
import android.view.Surface;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidCompass")
public class AndroidCompassPlugin extends Plugin implements SensorEventListener {
    private static final float LOW_PASS_ALPHA = 0.15f;
    private static final float MIN_HEADING_CHANGE_DEGREES = 0.6f;
    private static final long MIN_EMIT_INTERVAL_MS = 80L;

    private SensorManager sensorManager;
    private Sensor rotationVectorSensor;
    private Sensor accelerometerSensor;
    private Sensor magneticSensor;
    private boolean listening = false;
    private boolean usingRotationVector = false;
    private String headingSource = "android-sensors";
    private int latestAccuracy = SensorManager.SENSOR_STATUS_UNRELIABLE;

    private final float[] rotationMatrix = new float[9];
    private final float[] adjustedRotationMatrix = new float[9];
    private final float[] orientationValues = new float[3];
    private float[] gravityValues;
    private float[] magneticValues;
    private float lastHeading = Float.NaN;
    private long lastEmitAtMs = 0L;

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);

        if (sensorManager == null) {
            return;
        }

        rotationVectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);

        if (rotationVectorSensor == null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            rotationVectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
        }

        accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        magneticSensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (sensorManager == null) {
            call.reject("Compass sensors are unavailable.");
            return;
        }

        if (listening) {
            call.resolve();
            return;
        }

        resetState();

        if (rotationVectorSensor != null) {
            usingRotationVector = true;
            headingSource = "android-rotation-vector";
            listening = sensorManager.registerListener(this, rotationVectorSensor, SensorManager.SENSOR_DELAY_UI);
        } else if (accelerometerSensor != null && magneticSensor != null) {
            usingRotationVector = false;
            headingSource = "android-accelerometer-magnetometer";
            boolean accelRegistered = sensorManager.registerListener(this, accelerometerSensor, SensorManager.SENSOR_DELAY_UI);
            boolean magneticRegistered = sensorManager.registerListener(this, magneticSensor, SensorManager.SENSOR_DELAY_UI);
            listening = accelRegistered && magneticRegistered;
        }

        if (!listening) {
            stopListening();
            call.reject("Compass sensors are unavailable.");
            return;
        }

        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopListening();
        call.resolve();
    }

    @Override
    protected void handleOnPause() {
        stopListening();
    }

    @Override
    protected void handleOnDestroy() {
        stopListening();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (!listening) {
            return;
        }

        latestAccuracy = event.accuracy;

        if (usingRotationVector && event.sensor.getType() == rotationVectorSensor.getType()) {
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values);
            emitHeadingFromMatrix(rotationMatrix);
            return;
        }

        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            gravityValues = lowPass(event.values, gravityValues);
        } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            magneticValues = lowPass(event.values, magneticValues);
        }

        if (gravityValues == null || magneticValues == null) {
            return;
        }

        boolean hasMatrix = SensorManager.getRotationMatrix(rotationMatrix, null, gravityValues, magneticValues);

        if (hasMatrix) {
            emitHeadingFromMatrix(rotationMatrix);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        latestAccuracy = accuracy;
    }

    private void emitHeadingFromMatrix(float[] matrix) {
        if (!remapToDisplay(matrix)) {
            System.arraycopy(matrix, 0, adjustedRotationMatrix, 0, matrix.length);
        }

        SensorManager.getOrientation(adjustedRotationMatrix, orientationValues);

        float heading = normalizeDegrees((float) Math.toDegrees(orientationValues[0]));
        long now = SystemClock.elapsedRealtime();

        if (!Float.isNaN(lastHeading)) {
            float delta = angularDistance(lastHeading, heading);
            if (delta < MIN_HEADING_CHANGE_DEGREES || now - lastEmitAtMs < MIN_EMIT_INTERVAL_MS) {
                return;
            }
        }

        lastHeading = heading;
        lastEmitAtMs = now;

        JSObject data = new JSObject();
        data.put("heading", (double) heading);
        data.put("accuracy", latestAccuracy);
        data.put("source", headingSource);
        notifyListeners("heading", data);
    }

    private boolean remapToDisplay(float[] matrix) {
        int axisX;
        int axisY;

        switch (getDisplayRotation()) {
            case Surface.ROTATION_90:
                axisX = SensorManager.AXIS_Y;
                axisY = SensorManager.AXIS_MINUS_X;
                break;
            case Surface.ROTATION_180:
                axisX = SensorManager.AXIS_MINUS_X;
                axisY = SensorManager.AXIS_MINUS_Y;
                break;
            case Surface.ROTATION_270:
                axisX = SensorManager.AXIS_MINUS_Y;
                axisY = SensorManager.AXIS_X;
                break;
            case Surface.ROTATION_0:
            default:
                axisX = SensorManager.AXIS_X;
                axisY = SensorManager.AXIS_Y;
                break;
        }

        return SensorManager.remapCoordinateSystem(matrix, axisX, axisY, adjustedRotationMatrix);
    }

    private int getDisplayRotation() {
        if (getActivity() == null) {
            return Surface.ROTATION_0;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Display display = getActivity().getDisplay();
            return display == null ? Surface.ROTATION_0 : display.getRotation();
        }

        return getActivity().getWindowManager().getDefaultDisplay().getRotation();
    }

    private float[] lowPass(float[] input, float[] output) {
        if (output == null) {
            return input.clone();
        }

        for (int i = 0; i < input.length; i++) {
            output[i] = output[i] + LOW_PASS_ALPHA * (input[i] - output[i]);
        }

        return output;
    }

    private float normalizeDegrees(float value) {
        float normalized = value % 360f;
        return normalized < 0 ? normalized + 360f : normalized;
    }

    private float angularDistance(float first, float second) {
        float delta = Math.abs(first - second) % 360f;
        return delta > 180f ? 360f - delta : delta;
    }

    private void resetState() {
        gravityValues = null;
        magneticValues = null;
        lastHeading = Float.NaN;
        lastEmitAtMs = 0L;
        latestAccuracy = SensorManager.SENSOR_STATUS_UNRELIABLE;
    }

    private void stopListening() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }

        listening = false;
        usingRotationVector = false;
        resetState();
    }
}
