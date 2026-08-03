#include "wifi_manager.h"
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

bool sendInferenceData(const char* serverUrl, const String& label, float confidence, const String& gpsCoords) {
    if (!isWiFiConnected()) {
        Serial.println("[WiFi] Cannot send data: Disconnected.");
        return false;
    }

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Construct JSON containing label, confidence, and GPS coordinates
    String jsonPayload = "{";
    jsonPayload += "\"label\":\"" + label + "\",";
    jsonPayload += "\"confidence\":" + String(confidence, 4) + ",";
    jsonPayload += "\"gps\":\"" + gpsCoords + "\"";
    jsonPayload += "}";

    int httpResponseCode = http.POST(jsonPayload);
    bool success = false;

    if (httpResponseCode > 0) {
        Serial.printf("[HTTP] POST success, Response code: %d\n", httpResponseCode);
        success = true;
    } else {
        Serial.printf("[HTTP] POST failed, Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
    return success;
}