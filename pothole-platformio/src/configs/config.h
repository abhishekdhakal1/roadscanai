#ifndef CONFIG_H
#define CONFIG_H

#define SERIAL_BAUDRATE 115200

// Device Name
#define DEVICE_ID "esp32cam_01"
extern unsigned long seq;

// Camera Configuration Settings
#define CAMERA_FRAME_SIZE FRAMESIZE_QVGA
#define CAMERA_PIXEL_FORMAT PIXFORMAT_JPEG
#define CAMERA_JPEG_QUALITY 10

// ML Settings
const char *const LABELS[] = {"High", "Low", "Medium", "Normal"};
constexpr int NUM_CLASSES = 4;

// GPS Module Configuration
#define GPS_RX_PIN 42 // ESP32 RX  <- GPS TX
#define GPS_TX_PIN 41 // ESP32 TX  -> GPS RX
#define GPS_BAUD_RATE 9600

// GSM Module Configuration (currently disabled in .ino)
#define GSM_RX_PIN 2
#define GSM_TX_PIN 1
#define GSM_BAUD_RATE 9600

// Alert Configuration
#define ALERT_PHONE_NUMBER "+1234567890"
#define ALERT_SERVER_URL "http://your-server.com/pothole-alert"

// Keep false while GSM code is commented out
#define SEND_SMS_ALERT false
#define SEND_HTTP_ALERT false

// Wi-Fi Credentials
// #define WIFI_SSID     "ALHN-34BA"
// #define WIFI_PASSWORD "CKt4ffm2H9"

#define WIFI_SSID     "BNBBOYS567_2.4"
#define WIFI_PASSWORD "BNBBOYS@123"

// Database / API Endpoint
#define API_SERVER_URL "https://pothole-backend-87ew.onrender.com/api/v1/detections"

#endif // CONFIG_H