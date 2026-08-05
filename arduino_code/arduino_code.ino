#include "config.h"
#include "camera.h"
#include "model.h"
#include "gps.h"
#include "wifi_manager.h"
// #include "gsm.h" // GSM integration disabled

static unsigned long last_alert_time = 0;
static const unsigned long ALERT_COOLDOWN_MS = 5000;

void setup() {
  Serial.begin(SERIAL_BAUDRATE);

  while (!Serial && millis() < 5000) {
    delay(10);
  }

  Serial.println("\n==============================================");
  Serial.println("ESP32-S3 Native USB Serial Port Connected.");
  Serial.println("==============================================");

  // Initializing WiFi
  initWiFi(WIFI_SSID, WIFI_PASSWORD);

  if (!psramInit()) {
    Serial.println("System halt: PSRAM init failed.");
    while (true)
      delay(1000);
  }
  Serial.printf("PSRAM initialized. Total size: %d bytes\n", ESP.getPsramSize());

  if (!initCamera()) {
    Serial.println("System halt: Camera init failed.");
    while (true)
      delay(1000);
  }

  if (!initModel()) {
    Serial.println("System halt: Model init failed.");
    while (true)
      delay(1000);
  }

  if (!initGPS(GPS_RX_PIN, GPS_TX_PIN, GPS_BAUD_RATE)) {
    Serial.println("Warning: GPS init failed.");
  }

  Serial.printf("GPS UART -> RX:%d TX:%d BAUD:%d\n", GPS_RX_PIN, GPS_TX_PIN, GPS_BAUD_RATE);
  Serial.println("System operational. Beginning capture loop...\n");
}

void loop() {
  unsigned long loop_start = millis();

  camera_fb_t *fb = captureFrame();
  if (!fb) {
    Serial.println("Frame capture failed");
    delay(1000);
    return;
  }
  unsigned long t_capture = millis();

  Serial.printf(">> Photo captured: %dx%d, %u bytes\n", fb->width, fb->height, fb->len);

  uint8_t *rgb_matrix = (uint8_t *)ps_malloc(fb->width * fb->height * 3);
  if (!rgb_matrix) {
    Serial.println("RGB allocation failed");
    releaseFrame(fb);
    delay(1000);
    return;
  }

  if (!fmt2rgb888(fb->buf, fb->len, fb->format, rgb_matrix)) {
    Serial.println("JPEG->RGB conversion failed");
    free(rgb_matrix);
    releaseFrame(fb);
    delay(1000);
    return;
  }
  unsigned long t_convert = millis();

  InferenceResult inference = runInference(rgb_matrix, fb->width, fb->height);
  unsigned long t_inference = millis();

  // Always query GPS
  GPSData gps_data = readGPS();
  bool gps_fix = hasGPSFix() || gps_data.fix_valid;
  String gps_coords = getGPSCoordinates();

  Serial.printf("[GPS] Working: %s | Fix: %s | Sats: %d\n",
                (gps_data.satellite_count > 0 || gps_fix) ? "YES" : "NO",
                gps_fix ? "YES" : "NO",
                gps_data.satellite_count);
  Serial.printf("[GPS] Coordinates: %s\n", gps_coords.c_str());

  Serial.printf("Detection: %s (%.2f%%)\n",
                inference.class_name, inference.probability * 100.0f);

  // pothole = anything except "Normal"
  bool is_pothole = (strcmp(inference.class_name, "Normal") != 0);

  if (is_pothole) {
    unsigned long current_time = millis();
    if (current_time - last_alert_time >= ALERT_COOLDOWN_MS) {
      Serial.println("\n========== POTHOLE ALERT ==========");
      Serial.printf("Detection: %s (%.2f%%)\n", inference.class_name, inference.probability * 100.0f);
      Serial.printf("GPS: %s\n", gps_coords.c_str());
      last_alert_time = current_time;

      sendInferenceData(API_SERVER_URL,inference,gps_coords);

      Serial.println("==================================\n");
    } else {
      Serial.printf("Pothole detected, cooldown active (%lu ms left)\n\n",
                    ALERT_COOLDOWN_MS - (current_time - last_alert_time));
    }
  }

  free(rgb_matrix);
  releaseFrame(fb);

  unsigned long capture_ms = t_capture - loop_start;
  unsigned long convert_ms = t_convert - t_capture;
  unsigned long inference_ms = t_inference - t_convert;
  unsigned long total_ms = t_inference - loop_start;

  Serial.printf("[TIMING] capture:%lu ms | convert:%lu ms | inference:%lu ms | total:%lu ms\n\n",
                capture_ms, convert_ms, inference_ms, total_ms);

  const unsigned long TARGET_PERIOD_MS = 3000;
  unsigned long elapsed = millis() - loop_start;
  if (elapsed < TARGET_PERIOD_MS)
    delay(TARGET_PERIOD_MS - elapsed);
}