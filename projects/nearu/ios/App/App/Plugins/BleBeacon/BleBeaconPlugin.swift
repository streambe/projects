/**
 * BleBeaconPlugin — iOS native implementation using CoreBluetooth + CoreLocation.
 *
 * Scans for iBeacon advertisements matching a given event UUID and reports
 * detected beacons (minorId, rssi, distance) via Capacitor event listeners.
 *
 * Required Info.plist entries:
 *   - NSLocationWhenInUseUsageDescription
 *   - NSLocationAlwaysAndWhenInUseUsageDescription
 *   - NSBluetoothAlwaysUsageDescription
 *   - UIBackgroundModes: bluetooth-central, location
 */

import Foundation
import Capacitor
import CoreLocation
import CoreBluetooth

@objc(BleBeaconPlugin)
public class BleBeaconPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate, CBCentralManagerDelegate {

    public let identifier = "BleBeaconPlugin"
    public let jsName = "BleBeacon"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startScanning", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopScanning", returnType: CAPPluginReturnPromise),
    ]

    private var locationManager: CLLocationManager?
    private var centralManager: CBCentralManager?
    private var beaconRegion: CLBeaconRegion?
    private var eventUuid: UUID?

    // Path loss model constants (matching ble-utils.ts)
    private let pathLossExponent: Double = 2.0
    private let defaultTxPower: Double = -59.0

    // MARK: - Capacitor Plugin Methods

    @objc func startScanning(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("eventUuid"),
              let uuid = UUID(uuidString: uuidString) else {
            call.reject("Invalid or missing eventUuid")
            return
        }

        self.eventUuid = uuid

        // Initialize CoreBluetooth to check BLE availability
        centralManager = CBCentralManager(delegate: self, queue: nil)

        // Initialize CoreLocation for iBeacon ranging
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        locationManager?.requestWhenInUseAuthorization()
        locationManager?.allowsBackgroundLocationUpdates = true

        // Create beacon region for this event UUID
        let region = CLBeaconRegion(
            uuid: uuid,
            identifier: "nearu.event.\(uuidString)"
        )
        region.notifyOnEntry = true
        region.notifyOnExit = true
        self.beaconRegion = region

        // Start monitoring + ranging
        locationManager?.startMonitoring(for: region)

        // For iOS 13+, use CLBeaconIdentityConstraint
        let constraint = CLBeaconIdentityConstraint(uuid: uuid)
        locationManager?.startRangingBeacons(satisfying: constraint)

        call.resolve()
    }

    @objc func stopScanning(_ call: CAPPluginCall) {
        if let region = beaconRegion {
            locationManager?.stopMonitoring(for: region)
            if let uuid = eventUuid {
                let constraint = CLBeaconIdentityConstraint(uuid: uuid)
                locationManager?.stopRangingBeacons(satisfying: constraint)
            }
        }

        locationManager = nil
        centralManager = nil
        beaconRegion = nil
        eventUuid = nil

        call.resolve()
    }

    // MARK: - CLLocationManagerDelegate (iBeacon Ranging)

    public func locationManager(
        _ manager: CLLocationManager,
        didRange beacons: [CLBeacon],
        satisfying beaconConstraint: CLBeaconIdentityConstraint
    ) {
        for beacon in beacons {
            let rssi = beacon.rssi
            let distance = estimateDistance(rssi: Double(rssi))

            // Only report beacons within ~5 meters
            guard distance <= 5.0 else { continue }

            let data: [String: Any] = [
                "minorId": beacon.minor.intValue,
                "rssi": rssi,
                "estimatedDistance": distance,
                "timestamp": Int(Date().timeIntervalSince1970 * 1000)
            ]

            notifyListeners("beaconDetected", data: data)
        }
    }

    public func locationManager(
        _ manager: CLLocationManager,
        didFailRangingFor beaconConstraint: CLBeaconIdentityConstraint,
        error: Error
    ) {
        notifyListeners("scanError", data: ["message": error.localizedDescription])
    }

    // MARK: - CBCentralManagerDelegate

    public func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOff:
            notifyListeners("scanError", data: ["message": "Bluetooth is powered off"])
        case .unauthorized:
            notifyListeners("scanError", data: ["message": "Bluetooth permission denied"])
        case .unsupported:
            notifyListeners("scanError", data: ["message": "BLE not supported on this device"])
        case .poweredOn:
            break // Ready to scan
        default:
            break
        }
    }

    // MARK: - Distance Estimation

    private func estimateDistance(rssi: Double, txPower: Double = -59.0) -> Double {
        guard rssi < 0 else { return 0.1 }
        let ratio = (txPower - rssi) / (10.0 * pathLossExponent)
        let distance = pow(10.0, ratio)
        return max(0.1, min(100.0, distance))
    }
}
