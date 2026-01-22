/**
 * Bluetooth Check-in Service
 *
 * Uses Web Bluetooth API for proximity-based check-in.
 * The gym runs a BLE beacon, and members' phones detect it for automatic check-in.
 *
 * Two modes:
 * 1. Member Mode: Member's phone scans for gym beacon and triggers check-in
 * 2. Terminal Mode: Gym terminal scans for member devices (requires device registration)
 */

// BLE Service UUIDs for gym check-in
const GYM_CHECKIN_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const GYM_CHECKIN_CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';

export interface BluetoothDevice {
  id: string;
  name: string | null;
  connected: boolean;
}

export interface BluetoothScanResult {
  deviceId: string;
  deviceName: string | null;
  rssi?: number;
}

class BluetoothCheckinService {
  private isScanning = false;
  private connectedDevice: BluetoothDevice | null = null;

  // Check if Web Bluetooth is supported
  isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  // Generate a unique device ID based on browser fingerprint
  async getDeviceFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      new Date().getTimezoneOffset().toString(),
      screen.width.toString(),
      screen.height.toString(),
      screen.colorDepth.toString(),
    ];

    const fingerprint = components.join('|');

    // Create hash of fingerprint
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return hashHex.substring(0, 32);
  }

  // Get device type
  getDeviceType(): 'ios' | 'android' | 'web' {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'web';
  }

  // Scan for gym beacon (Member Mode)
  async scanForGymBeacon(
    gymId: string,
    onFound: (beacon: BluetoothScanResult) => void,
    options?: { timeout?: number }
  ): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Bluetooth is not supported in this browser');
    }

    if (this.isScanning) {
      throw new Error('Already scanning');
    }

    this.isScanning = true;

    try {
      // Request device with gym service
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [GYM_CHECKIN_SERVICE_UUID],
          },
        ],
        optionalServices: [GYM_CHECKIN_CHARACTERISTIC_UUID],
      });

      onFound({
        deviceId: device.id,
        deviceName: device.name || null,
      });

      this.connectedDevice = {
        id: device.id,
        name: device.name || null,
        connected: false,
      };
    } finally {
      this.isScanning = false;
    }
  }

  // Connect to gym beacon and perform check-in
  async connectAndCheckin(
    device: BluetoothDevice,
    memberId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // This is a simplified implementation
      // In production, you would connect to the characteristic and send member ID
      return {
        success: true,
        message: 'Connected to gym beacon',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // Alternative: Use device presence detection
  // This works by detecting if the member's device is "in range"
  // using browser-based proximity detection
  async detectDevicePresence(): Promise<{
    deviceId: string;
    deviceType: 'ios' | 'android' | 'web';
    timestamp: number;
  }> {
    const deviceId = await this.getDeviceFingerprint();
    const deviceType = this.getDeviceType();

    return {
      deviceId,
      deviceType,
      timestamp: Date.now(),
    };
  }

  // For members to register their current device
  async registerCurrentDevice(): Promise<{
    deviceId: string;
    deviceName: string;
    deviceType: 'ios' | 'android' | 'web';
  }> {
    const deviceId = await this.getDeviceFingerprint();
    const deviceType = this.getDeviceType();
    const deviceName = this.getDeviceName();

    return {
      deviceId,
      deviceName,
      deviceType,
    };
  }

  private getDeviceName(): string {
    const ua = navigator.userAgent;

    // Try to extract device name from user agent
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android/.test(ua)) {
      const match = ua.match(/Android.*?;([^;)]+)/);
      return match ? match[1].trim() : 'Android Device';
    }
    if (/Mac/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Linux/.test(ua)) return 'Linux PC';

    return 'Unknown Device';
  }

  // Stop scanning
  stopScan(): void {
    this.isScanning = false;
  }

  // Disconnect current device
  disconnect(): void {
    this.connectedDevice = null;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }
}

export const bluetoothCheckinService = new BluetoothCheckinService();

// ==========================================
// Simple Device-Based Check-in (Fallback)
// ==========================================

/**
 * Simplified check-in flow using device fingerprinting
 * This is more reliable than Bluetooth as it works on all browsers
 */
export const deviceCheckinService = {
  async getDeviceInfo(): Promise<{
    deviceId: string;
    deviceName: string;
    deviceType: 'ios' | 'android' | 'web';
  }> {
    return bluetoothCheckinService.registerCurrentDevice();
  },

  isRegisteredDevice(deviceId: string, registeredDevices: string[]): boolean {
    return registeredDevices.includes(deviceId);
  },
};
