#include "configs/config.h"
#include "camera/camera.h"
#include "model/model.h"
#include "gps/gps.h"
#include "wifi/wifi_manager.h"
#include "gsm/gsm.h"

static unsigned long last_alert_time = 0;
static const unsigned long ALERT_COOLDOWN_MS = 5000;

// gpsDataQueue only holds the latest GPSData struct
QueueHandle_t gpsDataQueue;
QueueHandle_t inferenceDataQueue;

#define GPS_COORDS_MAXLEN 32

// AlertData struct to synchronize inference results and GPS coordinates between tasks
typedef struct
{
  InferenceResult inference;
  char gps_coords[GPS_COORDS_MAXLEN];
} AlertData;

void runInferenceTask(void *parameter)
{
  if (!psramInit())
  {
    Serial.println("System halt: PSRAM init failed.");
    while (true)
      delay(1000);
  }
  Serial.printf("PSRAM initialized. Total size: %d bytes\n", ESP.getPsramSize());

  if (!initCamera())
  {
    Serial.println("System halt: Camera init failed.");
    while (true)
      delay(1000);
  }

  if (!initModel())
  {
    Serial.println("System halt: Model init failed.");
    while (true)
      delay(1000);
  }

  for (;;)
  {
    unsigned long loop_start = millis();

    camera_fb_t *fb = captureFrame();
    if (!fb)
    {
      Serial.println("Frame capture failed");
      delay(1000);
      continue;
    }
    unsigned long t_capture = millis();

    Serial.printf(">> Photo captured: %dx%d, %u bytes\n", fb->width, fb->height, fb->len);

    uint8_t *rgb_matrix = (uint8_t *)ps_malloc(fb->width * fb->height * 3);
    if (!rgb_matrix)
    {
      Serial.println("RGB allocation failed");
      releaseFrame(fb);
      delay(1000);
      continue;
    }

    if (!fmt2rgb888(fb->buf, fb->len, fb->format, rgb_matrix))
    {
      Serial.println("JPEG->RGB conversion failed");
      free(rgb_matrix);
      releaseFrame(fb);
      delay(1000);
      continue;
    }
    unsigned long t_convert = millis();

    InferenceResult inference = runInference(rgb_matrix, fb->width, fb->height);
    unsigned long t_inference = millis();

    GPSData gps_data = {};

    // Latest GPSData struct is grabbed from the queue.
    xQueuePeek(gpsDataQueue, &gps_data, 0);
    bool gps_fix = hasGPSFix() || gps_data.fix_valid;
    String gps_coords = getGPSCoordinates(gps_data);

    Serial.printf("[GPS] Working: %s | Fix: %s | Sats: %d\n",
                  (gps_data.satellite_count > 0 || gps_fix) ? "YES" : "NO",
                  gps_fix ? "YES" : "NO",
                  gps_data.satellite_count);
    Serial.printf("[GPS] Coordinates: %s\n", gps_coords.c_str());

    Serial.printf("Detection: %s (%.2f%%)\n",
                  inference.class_name, inference.probability * 100.0f);

    // pothole = anything except "Normal"
    bool is_pothole = (strcmp(inference.class_name, "Normal") != 0);

    if (is_pothole)
    {
      unsigned long current_time = millis();
      if (current_time - last_alert_time >= ALERT_COOLDOWN_MS)
      {
        Serial.println("\n========== POTHOLE ALERT ==========");
        Serial.printf("Detection: %s (%.2f%%)\n", inference.class_name, inference.probability * 100.0f);
        Serial.printf("GPS: %s\n", gps_coords.c_str());
        last_alert_time = current_time;

        // Prepare the alert data to send to the sendPOSTRequestTask
        AlertData alert;
        alert.inference = inference;
        strncpy(alert.gps_coords, gps_coords.c_str(), GPS_COORDS_MAXLEN - 1);
        alert.gps_coords[GPS_COORDS_MAXLEN - 1] = '\0';

        // Send the inference result and GPS coordinates to the sendPOSTRequestTask
        if (xQueueSend(inferenceDataQueue, &alert, 0) != pdTRUE)
        {
          Serial.println("Warning: inferenceDataQueue full, dropping alert");
        }

        Serial.println("==================================\n");
      }
      else
      {
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
      vTaskDelay(pdMS_TO_TICKS(TARGET_PERIOD_MS - elapsed));
  }
}

void sendPOSTRequestTask(void *parameter)
{
  initWiFi(WIFI_SSID, WIFI_PASSWORD);
  initGSM(GSM_RX_PIN, GSM_TX_PIN, GSM_BAUD_RATE, "ntnet");

  AlertData alert;
  for (;;)
  {
    if (xQueueReceive(inferenceDataQueue, &alert, portMAX_DELAY)!=pdTRUE)
      continue;

    if (isGSMConnected())
    {
      sendInferenceDataGSM(API_SERVER_URL, alert.inference, alert.gps_coords);
    }
    else if (isWiFiConnected())
    {
        sendInferenceData(API_SERVER_URL, alert.inference, alert.gps_coords);

    }
  }
}

void getGPSDataTask(void *parameter)
{
  // Initialize GPS Module when the task starts for the first time
  if (!initGPS(GPS_RX_PIN, GPS_TX_PIN, GPS_BAUD_RATE))
  {
    Serial.println("Warning: GPS init failed.");
  }

  Serial.printf("GPS UART -> RX:%d TX:%d BAUD:%d\n", GPS_RX_PIN, GPS_TX_PIN, GPS_BAUD_RATE);
  Serial.println("System operational. Beginning capture loop...\n");

  for (;;)
  {
    GPSData gps_data = readGPS();

    // Overwrite the queue with the latest value

    xQueueOverwrite(gpsDataQueue, &gps_data);

    vTaskDelay(pdMS_TO_TICKS(200));
  }
}

void setup()
{
  Serial.begin(SERIAL_BAUDRATE);

  while (!Serial && millis() < 5000)
  {
    delay(10);
  }

  Serial.println("\n==============================================");
  Serial.println("ESP32-S3 Native USB Serial Port Connected.");
  Serial.println("==============================================");

  gpsDataQueue = xQueueCreate(1, sizeof(GPSData));
  inferenceDataQueue = xQueueCreate(5, sizeof(AlertData));

  xTaskCreatePinnedToCore(getGPSDataTask, "GPSTask", 4096, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(runInferenceTask, "InferenceTask", 8192, NULL, 2, NULL, 1);
  xTaskCreatePinnedToCore(sendPOSTRequestTask, "POSTTask", 8192, NULL, 1, NULL, 0);
}

void loop()
{
  // Everything happens in the tasks above.
  vTaskDelay(pdMS_TO_TICKS(1000));
}