#include "gsm.h"
#include <HardwareSerial.h>
#include "../configs/config.h"  // for DEVICE_ID

static HardwareSerial gsmSerial(2); // UART2 - keep UART1 free for GPS
static bool gprsAttached = false;
static String savedApn, savedApnUser, savedApnPass;

// ---------- low-level AT helper ----------

// Sends a command, waits up to timeout_ms for one of the expected tokens
// to appear in the response. Returns the full response via 'response' if
// non-null. Returns true if any expected token was found.
static bool sendAT(const String& cmd, const char* expect1 = "OK",
                    const char* expect2 = nullptr,
                    unsigned long timeout_ms = 3000,
                    String* response = nullptr)
{
    while (gsmSerial.available()) gsmSerial.read(); // flush stale bytes

    if (cmd.length()) {
        gsmSerial.print(cmd);
        gsmSerial.print("\r\n");
    }

    String buf;
    unsigned long start = millis();
    bool found = false;

    while (millis() - start < timeout_ms) {
        while (gsmSerial.available()) {
            char c = (char)gsmSerial.read();
            buf += c;
            if (expect1 && buf.indexOf(expect1) != -1) { found = true; }
            if (expect2 && buf.indexOf(expect2) != -1) { found = true; }
        }
        if (found) break;
        delay(10);
    }

    if (response) *response = buf;
    return found;
}

// ---------- init ----------

bool initGSM(int rx_pin, int tx_pin, int baud_rate, const char* apn,
             const char* apn_user, const char* apn_pass)
{
    savedApn = apn;
    savedApnUser = apn_user ? apn_user : "";
    savedApnPass = apn_pass ? apn_pass : "";

    gsmSerial.begin((uint32_t)baud_rate, SERIAL_8N1, rx_pin, tx_pin);
    delay(3000); // SIM800 boot settle time

    Serial.println("[GSM] Handshaking...");
    bool ok = false;
    for (int i = 0; i < 5 && !ok; i++) {
        ok = sendAT("AT", "OK", nullptr, 1000);
        if (!ok) delay(500);
    }
    if (!ok) {
        Serial.println("[GSM] Module not responding.");
        return false;
    }

    sendAT("ATE0");                  // echo off, keeps parsing simple
    sendAT("AT+CFUN=1", "OK", nullptr, 5000);

    // Wait for network registration (home or roaming)
    Serial.println("[GSM] Waiting for network registration...");
    bool registered = false;
    unsigned long regStart = millis();
    while (millis() - regStart < 20000) {
        String resp;
        sendAT("AT+CREG?", "OK", nullptr, 2000, &resp);
        if (resp.indexOf(",1") != -1 || resp.indexOf(",5") != -1) {
            registered = true;
            break;
        }
        delay(1000);
    }
    if (!registered) {
        Serial.println("[GSM] Network registration failed.");
        return false;
    }
    Serial.println("[GSM] Registered on network.");

    // Tear down any stale bearer/GPRS context before reattaching
    sendAT("AT+CIPSHUT", "SHUT OK", nullptr, 5000);
    sendAT("AT+CGATT=1", "OK", nullptr, 10000);

    sendAT("AT+SAPBR=3,1,\"Contype\",\"GPRS\"");
    sendAT("AT+SAPBR=3,1,\"APN\",\"" + savedApn + "\"");
    if (savedApnUser.length()) sendAT("AT+SAPBR=3,1,\"USER\",\"" + savedApnUser + "\"");
    if (savedApnPass.length()) sendAT("AT+SAPBR=3,1,\"PWD\",\""  + savedApnPass + "\"");

    bool bearerOk = sendAT("AT+SAPBR=1,1", "OK", "ERROR", 10000); // open GPRS bearer
    if (!bearerOk) {
        Serial.println("[GSM] Failed to open GPRS bearer.");
        return false;
    }

    String ipResp;
    sendAT("AT+SAPBR=2,1", "OK", nullptr, 5000, &ipResp); // query, prints assigned IP
    Serial.print("[GSM] Bearer status: ");
    Serial.println(ipResp);

    gprsAttached = true;
    Serial.println("[GSM] GPRS attached.");
    return true;
}

bool isGSMConnected()
{
    if (!gprsAttached) return false;
    String resp;
    sendAT("AT+SAPBR=2,1", "OK", nullptr, 3000, &resp);
    // Response like: +SAPBR: 1,1,"10.x.x.x"  -> state 1 = connected
    int stateIdx = resp.indexOf("+SAPBR:");
    if (stateIdx == -1) return false;
    return resp.indexOf(",1,\"") != -1;
}

// ---------- HTTP POST via SIM800's internal HTTP stack ----------

bool sendInferenceDataGSM(const char* serverUrl,
                           const InferenceResult& result,
                           const GPSData& gpsData)
{
    if (!gprsAttached) {
        Serial.println("[GSM] Cannot send data: GPRS not attached.");
        return false;
    }

  String jsonPayload = "{";

jsonPayload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";

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
sendAT("AT+HTTPTERM"); // clear any leftover session, ignore result

if (!sendAT("AT+HTTPINIT", "OK", "ERROR", 3000))
{
    Serial.println("[GSM] HTTPINIT failed.");
    return false;
}

    sendAT("AT+HTTPPARA=\"CID\",1");
    sendAT("AT+HTTPPARA=\"URL\",\"" + String(serverUrl) + "\"");
    sendAT("AT+HTTPPARA=\"CONTENT\",\"application/json\"");

    // Push the payload into the module's internal buffer
    String dataCmd = "AT+HTTPDATA=" + String(jsonPayload.length()) + ",10000";
    if (!sendAT(dataCmd, "DOWNLOAD", nullptr, 3000)) {
        Serial.println("[GSM] HTTPDATA prompt not received.");
        sendAT("AT+HTTPTERM");
        return false;
    }
    sendAT(jsonPayload, "OK", nullptr, 10000);

    // Fire the POST (method 1 = POST)
    String actionResp;
    bool actionOk = sendAT("AT+HTTPACTION=1", "+HTTPACTION:", nullptr, 15000, &actionResp);
    if (!actionOk) {
        Serial.println("[GSM] HTTPACTION did not return in time.");
        sendAT("AT+HTTPTERM");
        return false;
    }

    // actionResp contains a line like: +HTTPACTION: 1,200,123
    // fields: method, http_status_code, response_data_length
    int statusCode = -1;
    int idx = actionResp.indexOf("+HTTPACTION:");
    if (idx != -1) {
        int firstComma = actionResp.indexOf(',', idx);
        int secondComma = actionResp.indexOf(',', firstComma + 1);
        if (firstComma != -1 && secondComma != -1) {
            statusCode = actionResp.substring(firstComma + 1, secondComma).toInt();
        }
    }

    bool success = (statusCode >= 200 && statusCode < 300);

    if (success) {
        Serial.printf("[GSM] POST success, HTTP status: %d\n", statusCode);
        Serial.println("[GSM] Payload:");
        Serial.println(jsonPayload);
    } else {
        Serial.printf("[GSM] POST failed, HTTP status: %d\n", statusCode);
    }

    sendAT("AT+HTTPTERM"); // always release the HTTP session
    return success;
}