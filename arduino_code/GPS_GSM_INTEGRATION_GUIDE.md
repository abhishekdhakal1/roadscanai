# ESP32-S3 TensorFlow Lite Pothole Detection with GPS & GSM Integration

## Overview
This project integrates GPS and GSM modules with an ESP32-S3 camera-based pothole detection system using TensorFlow Lite inference. When a pothole is detected (classification other than "Normal"), the system captures GPS coordinates and sends real-time alerts via SMS and HTTP POST requests.

## System Architecture

```
┌─────────────────────────────────────────────┐
│           ESP32-S3 Main Board               │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐        │
│  │  Camera      │  │  TensorFlow  │        │
│  │  (QVGA)      │  │  Lite Model  │        │
│  └──────────────┘  └──────────────┘        │
│         │                  │                │
│         └──────┬───────────┘                │
│                │                           │
│    ┌───────────▼──────────┐                │
│    │  Classification      │                │
│    │  (High/Low/Medium/   │                │
│    │   Normal)            │                │
│    └───────────┬──────────┘                │
│                │                           │
│         ┌──────▼─────────┐                │
│         │ Pothole Alert  │                │
│         │ Logic          │                │
│         └──────┬─────────┘                │
│                │                           │
│    ┌───────────┴──────────┬─────────┐     │
│    │                      │         │     │
│  ┌─▼──────┐        ┌──────▼──┐  ┌──▼──┐ │
│  │ GPS    │        │ GSM     │  │ GPS │ │
│  │ Module │        │ Module  │  │Data │ │
│  │(UART1) │        │(UART2)  │  │ Tx  │ │
│  └────────┘        └──────┬──┘  └─────┘ │
└─────────────────────────────┼────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                ┌───▼──────┐   ┌────────▼──┐
                │  SMS     │   │   HTTP    │
                │  Alert   │   │   POST    │
                └──────────┘   └───────────┘
```

## Hardware Requirements

### Main Components
1. **ESP32-S3** - Microcontroller with built-in PSRAM and WiFi
2. **OV2640 Camera** - 2MP camera for image capture
3. **GPS Module** - NEO-6M or NEO-M8N (UART, 9600 baud)
4. **GSM Module** - SIM800L or SIM900A (UART, 9600 baud)
5. **SIM Card** - For GSM module (with active data plan for HTTP POST)

### Wiring

#### Camera Connection (Already configured in camera_pins.h)
```
ESP32-S3 Pin    → OV2640
GPIO 15         → XCLK
GPIO 4          → SIOD (SDA)
GPIO 5          → SIOC (SCL)
GPIO 11         → Y2
GPIO 9          → Y3
GPIO 8          → Y4
GPIO 10         → Y5
GPIO 12         → Y6
GPIO 18         → Y7
GPIO 17         → Y8
GPIO 16         → Y9
GPIO 6          → VSYNC
GPIO 7          → HREF
GPIO 13         → PCLK
```

#### GPS Module (NEO-6M) - UART1
```
ESP32-S3 Pin    → GPS Module
GPIO 44 (RX)    → TX
GPIO 43 (TX)    → RX
GND             → GND
5V              → VCC
```

#### GSM Module (SIM800L) - UART2
```
ESP32-S3 Pin    → GSM Module
GPIO 2 (RX)     → TX
GPIO 1 (TX)     → RX
GND             → GND
5V              → VCC (with capacitor 470µF)
```

## Software Configuration

### Required Libraries
Add these libraries to your Arduino IDE:
1. **TensorFlow Lite for Microcontrollers** - Model inference
2. **TinyGPS++** - GPS data parsing
3. **esp32-camera** - Camera driver (included in ESP32 board package)

### Installation Steps
```bash
# Via Arduino IDE:
# Sketch → Include Library → Manage Libraries
# Search for and install:
# - TinyGPS++
# - MicroTFLite (or TensorFlow Lite Micro)
```

### Configuration (config.h)

Edit the following settings:

```cpp
// GPS Pins
#define GPS_RX_PIN 44
#define GPS_TX_PIN 43
#define GPS_BAUD_RATE 9600

// GSM Pins  
#define GSM_RX_PIN 2
#define GSM_TX_PIN 1
#define GSM_BAUD_RATE 9600

// Alert Settings
#define ALERT_PHONE_NUMBER "+1234567890"  // Your phone number
#define ALERT_SERVER_URL "http://your-server.com/pothole-alert"

// Enable/Disable Features
#define SEND_SMS_ALERT true
#define SEND_HTTP_ALERT true
```

## How It Works

### 1. Startup Sequence
- Initialize PSRAM and camera
- Load TensorFlow Lite model
- Initialize GPS module (waits for fix)
- Initialize GSM module (connects to network)

### 2. Main Loop
```
Capture Frame
    ↓
Convert JPEG to RGB
    ↓
Run TensorFlow Inference
    ↓
Get Classification Result
    ↓
Is "Normal"? → Yes → No Alert
    ↓ No
Check Alert Cooldown
    ↓
Get GPS Coordinates
    ↓
Send SMS Alert (optional)
    ↓
Send HTTP POST Alert (optional)
    ↓
Wait for next frame
```

### 3. Alert Detection Logic
- **Pothole Detected**: Classification result is NOT "Normal"
- **Classes**: High, Low, Medium, Normal
- **Confidence**: All predictions sent (no threshold filtering)
- **Cooldown**: Minimum 5 seconds between alerts to prevent flooding

### 4. GPS Coordinate Capture
- When pothole detected, queries GPS module
- Requires GPS fix (minimum 4 satellites)
- Format: `LAT:xx.xxxxxx,LON:yy.yyyyyy`

### 5. Alert Transmission

#### SMS Alert
- Recipient: Configured phone number
- Format: `"[Pothole Type] pothole detected at LAT:xx.xxxxxx,LON:yy.yyyyyy"`
- Max length: 160 characters (SMS limitation)

#### HTTP POST Alert
- JSON Payload:
```json
{
  "type": "High",
  "confidence": 0.92,
  "coordinates": "LAT:37.7749,LON:-122.4194",
  "timestamp": 45823
}
```

## Serial Output Example

```
==============================================
ESP32-S3 Native USB Serial Port Connected.
==============================================
PSRAM initialized successfully. Total size: 8388608 bytes
--- GPS Module Initialization ---
GPS module initialized on UART1
RX: GPIO44, TX: GPIO43, Baud: 9600

--- TensorFlow Lite Micro Init (via MicroTFLite) ---
Model size (compiled in): 2702352 bytes
Tensor Arena allocated: 1048576 bytes
TensorFlow Lite Micro initialized

--- GSM Module Initialization ---
GSM module initialized on UART2
RX: GPIO2, TX: GPIO1, Baud: 9600
Module Info: SIM800L R14.18

System operational. Beginning capture loop...

>> Photo captured: 320x240, 8456 bytes

--- Classification Probability Breakdown ---
Class High: 2.15%
Class Low: 15.32%
Class Medium: 78.45%
Class Normal: 4.08%

>> Top Match: Medium (Probability: 78.45%, Inference Time: 245 ms)

[TIMING] capture: 156 ms | convert: 89 ms | inference: 245 ms | TOTAL: 490 ms (2.04 FPS)

========== POTHOLE ALERT TRIGGERED ==========
Detection: Medium (78.45% confidence)
GPS Coordinates: LAT:37.7749,LON:-122.4194
Sending SMS alert...
SMS sent successfully
Sending HTTP alert...
HTTP POST request successful (HTTP 200)
============================================
```

## Troubleshooting

### GPS Issues
- **No GPS Fix**: Ensure GPS module has clear sky view
- **Slow Fix**: GPS cold start can take 30+ seconds
- **Check**: Use serial monitor to debug: `Serial.println(getGPSCoordinates())`

### GSM Issues
- **Module Not Responding**: Check UART pins and wiring
- **No Network**: Verify SIM card and signal strength
- **SMS Fails**: Ensure sufficient balance on SIM card
- **HTTP POST Fails**: Check GPRS settings and server URL

### Model/Inference Issues
- **Slow Inference**: Normal, TFLite inference is compute-heavy
- **Memory Issues**: Reduce TENSOR_ARENA_SIZE if needed (minimum 1MB)
- **Wrong Classifications**: May need model retraining

## Performance Metrics

| Operation | Time (ms) | Notes |
|-----------|-----------|-------|
| Frame Capture | ~150 | QVGA 320x240 |
| RGB Conversion | ~90 | JPEG to RGB888 |
| Inference | ~245 | TFLite model |
| **Total Loop** | ~490 | ~2 FPS |
| GPS Fix | 30,000+ | Cold start |
| SMS Send | 5,000-10,000 | Network dependent |
| HTTP POST | 5,000-15,000 | Network dependent |

## Alert Cooldown
- **Default**: 5 seconds between alerts
- **Reason**: Prevent SMS/HTTP flooding
- **Modify**: Change `ALERT_COOLDOWN_MS` in esp32s3_tflite_inference.ino

## Future Enhancements
- [ ] Add GNSS (dual GPS/GLONASS) for better accuracy
- [ ] Implement 4G LTE instead of GSM
- [ ] Add accelerometer to detect vehicle impact
- [ ] Cloud data logging and heatmap visualization
- [ ] Multi-class severity scoring
- [ ] Battery-powered operation with deep sleep

## References
- [TinyGPS++ Documentation](http://arduiniana.org/libraries/tinygps/)
- [SIM800L AT Commands](https://www.simcom.com/)
- [ESP32-S3 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf)
- [TensorFlow Lite for Microcontrollers](https://www.tensorflow.org/lite/microcontrollers)

## License
This project is provided as-is for educational and research purposes.
