/**
 * BleBeaconPlugin — Android native implementation using Android BLE API.
 *
 * STUB: This file shows the correct architecture for scanning iBeacon devices
 * on Android via Capacitor. It will NOT compile without Android Studio and the
 * Capacitor Android bridge properly configured.
 *
 * Architecture:
 *   JS (Capacitor) → BleBeaconPlugin (Kotlin) → BluetoothLeScanner
 *
 * iBeacon advertisement data format (parsed manually from raw BLE scan):
 *   Bytes 0-1:   Company ID (0x004C = Apple)
 *   Byte 2:      iBeacon type (0x02)
 *   Byte 3:      Data length (0x15 = 21)
 *   Bytes 4-19:  UUID (16 bytes)
 *   Bytes 20-21: Major (2 bytes, big-endian)
 *   Bytes 22-23: Minor (2 bytes, big-endian)
 *   Byte 24:     TX Power (1 byte, signed)
 *
 * Required AndroidManifest.xml permissions:
 *   - android.permission.BLUETOOTH_SCAN
 *   - android.permission.BLUETOOTH_CONNECT
 *   - android.permission.ACCESS_FINE_LOCATION
 *   - android.permission.ACCESS_COARSE_LOCATION
 */

package com.nearu.plugins.ble

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.nio.ByteBuffer
import java.util.UUID

@CapacitorPlugin(name = "BleBeacon")
class BleBeaconPlugin : Plugin() {

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bleScanner: BluetoothLeScanner? = null
    private var eventUuid: UUID? = null
    private var isScanning = false

    // Path loss model constants (matching ble-utils.ts)
    private val pathLossExponent = 2.0
    private val defaultTxPower = -59.0

    // iBeacon company identifier (Apple)
    private val IBEACON_COMPANY_ID = 0x004C
    private val IBEACON_TYPE: Byte = 0x02
    private val IBEACON_DATA_LENGTH: Byte = 0x15

    @PluginMethod
    fun startScanning(call: PluginCall) {
        val uuidString = call.getString("eventUuid")
        if (uuidString == null) {
            call.reject("Missing eventUuid")
            return
        }

        try {
            eventUuid = UUID.fromString(uuidString)
        } catch (e: IllegalArgumentException) {
            call.reject("Invalid eventUuid format")
            return
        }

        val bluetoothManager =
            context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bluetoothAdapter = bluetoothManager?.adapter

        if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) {
            notifyListeners("scanError", JSObject().put("message", "Bluetooth is not enabled"))
            call.reject("Bluetooth is not enabled")
            return
        }

        bleScanner = bluetoothAdapter?.bluetoothLeScanner
        if (bleScanner == null) {
            call.reject("BLE scanner not available")
            return
        }

        startBleScan()
        call.resolve()
    }

    @PluginMethod
    fun stopScanning(call: PluginCall) {
        stopBleScan()
        call.resolve()
    }

    @SuppressLint("MissingPermission")
    private fun startBleScan() {
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setReportDelay(0)
            .build()

        // Scan for all BLE devices — we filter iBeacon in the callback
        // because Android ScanFilter cannot match iBeacon manufacturer data partially
        bleScanner?.startScan(emptyList<ScanFilter>(), settings, scanCallback)
        isScanning = true
    }

    @SuppressLint("MissingPermission")
    private fun stopBleScan() {
        if (isScanning) {
            bleScanner?.stopScan(scanCallback)
            isScanning = false
        }
        bleScanner = null
        eventUuid = null
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val scanRecord = result.scanRecord ?: return
            val manufacturerData = scanRecord.getManufacturerSpecificData(IBEACON_COMPANY_ID)
                ?: return

            val parsed = parseIBeaconData(manufacturerData) ?: return

            // Filter by event UUID
            if (parsed.uuid != eventUuid) return

            val rssi = result.rssi
            val distance = estimateDistance(rssi.toDouble(), parsed.txPower.toDouble())

            // Only report beacons within ~5 meters
            if (distance > 5.0) return

            val data = JSObject().apply {
                put("minorId", parsed.minor)
                put("rssi", rssi)
                put("estimatedDistance", distance)
                put("timestamp", System.currentTimeMillis())
            }

            notifyListeners("beaconDetected", data)
        }

        override fun onScanFailed(errorCode: Int) {
            val message = when (errorCode) {
                SCAN_FAILED_ALREADY_STARTED -> "Scan already started"
                SCAN_FAILED_APPLICATION_REGISTRATION_FAILED -> "App registration failed"
                SCAN_FAILED_FEATURE_UNSUPPORTED -> "BLE scan not supported"
                SCAN_FAILED_INTERNAL_ERROR -> "Internal BLE error"
                else -> "Scan failed with code $errorCode"
            }
            notifyListeners("scanError", JSObject().put("message", message))
        }
    }

    /**
     * Parse iBeacon manufacturer-specific data.
     *
     * Expected format after company ID (0x004C) is stripped:
     *   Byte 0:      Type (0x02)
     *   Byte 1:      Length (0x15 = 21)
     *   Bytes 2-17:  UUID (16 bytes)
     *   Bytes 18-19: Major (big-endian)
     *   Bytes 20-21: Minor (big-endian)
     *   Byte 22:     TX Power (signed byte)
     */
    private fun parseIBeaconData(data: ByteArray): IBeaconData? {
        if (data.size < 23) return null
        if (data[0] != IBEACON_TYPE || data[1] != IBEACON_DATA_LENGTH) return null

        val uuidBytes = ByteBuffer.wrap(data, 2, 16)
        val mostSig = uuidBytes.long
        val leastSig = uuidBytes.long
        val uuid = UUID(mostSig, leastSig)

        val major = ((data[18].toInt() and 0xFF) shl 8) or (data[19].toInt() and 0xFF)
        val minor = ((data[20].toInt() and 0xFF) shl 8) or (data[21].toInt() and 0xFF)
        val txPower = data[22].toInt() // signed byte

        return IBeaconData(uuid, major, minor, txPower)
    }

    private fun estimateDistance(rssi: Double, txPower: Double = defaultTxPower): Double {
        if (rssi >= 0) return 0.1
        val ratio = (txPower - rssi) / (10.0 * pathLossExponent)
        val distance = Math.pow(10.0, ratio)
        return maxOf(0.1, minOf(100.0, distance))
    }

    private data class IBeaconData(
        val uuid: UUID,
        val major: Int,
        val minor: Int,
        val txPower: Int,
    )
}
