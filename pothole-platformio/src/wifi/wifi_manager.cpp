#include "wifi_manager.h"
#include "../model/model.h"
#include "../configs/config.h"
#include <WiFi.h>
#include <HTTPClient.h>

void initWiFi(const char* ssid, const char* password) {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("[WiFi] Connecting to ");
  Serial.print(ssid);

  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection Failed!");
  }
}

bool isWiFiConnected() {
  return (WiFi.status() == WL_CONNECTED);
}

bool sendInferenceData(const char* serverUrl,
                       const InferenceResult& result,
                       const GPSData& gpsData) {
  if (!isWiFiConnected()) {
    Serial.println("[WiFi] Cannot send data: Disconnected.");
    return false;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String jsonPayload = "{";

jsonPayload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
jsonPayload += "\"seq\":" + String(seq) + ",";
jsonPayload += "\"timestamp\":\"" + getGPSTimestamp(gpsData) + "\",";

jsonPayload += "\"gps\":{";
jsonPayload += "\"lat\":" + String(gpsData.latitude, 6) + ",";
jsonPayload += "\"lon\":" + String(gpsData.longitude, 6) + ",";
jsonPayload += "\"hdop\":" + String(gpsData.accuracy, 2) + ",";
jsonPayload += "\"fix\":" + String(gpsData.fix_valid ? "true" : "false") + ",";
jsonPayload += "\"speed_kmh\":0";
jsonPayload += "},";

jsonPayload += "\"prediction\":\"" + String(result.class_name) + "\",";
jsonPayload += "\"confidence\":" + String(result.probability, 6);

jsonPayload += "}";

  int httpResponseCode = http.POST(jsonPayload);

  bool success = false;

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP] POST success, Response code: %d\n", httpResponseCode);
    Serial.println("[HTTP] Payload:");
    Serial.println(jsonPayload);
    success = true;
  } else {

    Serial.printf("[HTTP] POST failed, Error: %s\n",
                  http.errorToString(httpResponseCode).c_str());
  }

  http.end();
  return success;
}