#ifndef GSM_H
#define GSM_H

#include <Arduino.h>
#include "model.h"  // for InferenceResult

// Call once in setup(). rx_pin/tx_pin are ESP32 pins wired to SIM800's TX/RX
// (cross-connected: ESP32 RX <- SIM800 TX, ESP32 TX -> SIM800 RX).
// Returns true if the module responded and registered on the network.
bool initGSM(int rx_pin, int tx_pin, int baud_rate, const char* apn,
             const char* apn_user = "", const char* apn_pass = "");

// Quick check: module responsive + GPRS context still up.
bool isGSMConnected();

// Sends the same payload shape as sendInferenceData() over HTTP via the
// SIM800's internal TCP/IP+HTTP stack (AT+HTTPINIT etc.), not a socket you
// manage yourself.
bool sendInferenceDataGSM(const char* serverUrl,
                           const InferenceResult& result,
                           const String& gpsCoords);

#endif