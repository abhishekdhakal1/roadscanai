#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>

void initWiFi(const char* ssid, const char* password);
bool isWiFiConnected();

// Updated signature to accept GPS coordinates string
bool sendInferenceData(const char* serverUrl, const String& label, float confidence, const String& gpsCoords);

#endif