#include "gsm.h"
#include <HardwareSerial.h>

// GSM module serial connection
static HardwareSerial *gsmSerial = nullptr;

// Helper function to send AT command and wait for response
static String sendATCommand(String command, unsigned long timeout = 1000)
{
    if (!gsmSerial)
    {
        return "";
    }

    gsmSerial->println(command);
    String response = "";
    unsigned long start = millis();

    while (millis() - start < timeout)
    {
        if (gsmSerial->available())
        {
            char c = gsmSerial->read();
            response += c;
        }
    }

    return response;
}

// Helper function to check if response contains expected string
static bool waitForResponse(String response, String expected, unsigned long timeout = 3000)
{
    if (!gsmSerial)
    {
        return false;
    }

    unsigned long start = millis();
    String buffer = "";

    while (millis() - start < timeout)
    {
        if (gsmSerial->available())
        {
            char c = gsmSerial->read();
            buffer += c;

            if (buffer.indexOf(expected) != -1)
            {
                return true;
            }
        }
    }

    return false;
}

bool initGSM(int rx_pin, int tx_pin, uint32_t baud_rate)
{
    Serial.println("\n--- GSM Module Initialization ---");

    // Initialize serial connection for GSM
    // Using UART2 for GSM
    gsmSerial = new HardwareSerial(2);
    gsmSerial->begin(baud_rate, SERIAL_8N1, rx_pin, tx_pin);

    if (!gsmSerial)
    {
        Serial.println("GSM serial initialization failed");
        return false;
    }

    delay(1000);

    // Test AT command
    String response = sendATCommand("AT", 1000);
    if (response.indexOf("OK") == -1)
    {
        Serial.println("GSM module not responding to AT command");
        return false;
    }

    // Disable echo
    sendATCommand("ATE0", 1000);

    // Get module info
    response = sendATCommand("ATI", 1000);
    Serial.print("Module Info: ");
    Serial.println(response);

    // Set text mode for SMS
    sendATCommand("AT+CMGF=1", 1000);

    Serial.println("GSM module initialized on UART2");
    Serial.printf("RX: GPIO%d, TX: GPIO%d, Baud: %lu\n", rx_pin, tx_pin, baud_rate);

    return true;
}

GSMStatus getGSMStatus()
{
    GSMStatus status;
    status.initialized = false;
    status.network_registered = false;
    status.signal_strength = 0;
    status.operator_name = "Unknown";

    if (!gsmSerial)
    {
        return status;
    }

    status.initialized = true;

    // Check network registration
    String response = sendATCommand("AT+CREG?", 1000);

    // Parse network registration status
    // Response format: +CREG: <n>,<stat>[,<lac>,<ci>]
    if (response.indexOf("+CREG:") != -1)
    {
        // Check for values 1 (registered, home) or 5 (registered, roaming)
        if (response.indexOf(",1") != -1 || response.indexOf(",5") != -1)
        {
            status.network_registered = true;
        }
    }

    // Get signal strength
    response = sendATCommand("AT+CSQ", 1000);
    // Response format: +CSQ: <rssi>,<ber>
    if (response.indexOf("+CSQ:") != -1)
    {
        int start = response.indexOf(": ") + 2;
        int end = response.indexOf(",", start);
        if (start > 1 && end > start)
        {
            String rssi_str = response.substring(start, end);
            status.signal_strength = rssi_str.toInt();
        }
    }

    // Get operator name
    response = sendATCommand("AT+COPS?", 1000);
    if (response.indexOf("+COPS:") != -1)
    {
        int start = response.indexOf("\"") + 1;
        int end = response.indexOf("\"", start);
        if (start > 0 && end > start)
        {
            status.operator_name = response.substring(start, end);
        }
    }

    return status;
}

bool sendSMS(String phone_number, String message)
{
    if (!gsmSerial)
    {
        Serial.println("GSM module not initialized");
        return false;
    }

    Serial.printf("Sending SMS to %s: %s\n", phone_number.c_str(), message.c_str());

    // Set SMS recipient
    String cmd = "AT+CMGS=\"" + phone_number + "\"";
    gsmSerial->println(cmd);
    delay(500);

    // Send message
    gsmSerial->print(message);
    gsmSerial->write(0x1A); // Ctrl+Z to send

    // Wait for response
    unsigned long start = millis();
    while (millis() - start < 5000)
    {
        if (gsmSerial->available())
        {
            String response = "";
            while (gsmSerial->available())
            {
                response += (char)gsmSerial->read();
            }

            if (response.indexOf("+CMGS:") != -1 || response.indexOf("OK") != -1)
            {
                Serial.println("SMS sent successfully");
                return true;
            }
        }
    }

    Serial.println("SMS send failed or timed out");
    return false;
}

bool sendHTTPPost(String server_url, String post_data)
{
    if (!gsmSerial)
    {
        Serial.println("GSM module not initialized");
        return false;
    }

    Serial.printf("Sending HTTP POST to: %s\n", server_url.c_str());
    Serial.printf("Data: %s\n", post_data.c_str());

    // Enable GPRS connection
    sendATCommand("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", 2000);
    sendATCommand("AT+SAPBR=3,1,\"APN\",\"internet\"", 2000);
    sendATCommand("AT+SAPBR=1,1", 3000);

    delay(1000);

    // Initialize HTTP service
    sendATCommand("AT+HTTPINIT", 2000);

    // Set HTTP parameters
    String bearer_cmd = "AT+HTTPPARA=\"CID\",1";
    sendATCommand(bearer_cmd, 1000);

    // Set content type to JSON
    sendATCommand("AT+HTTPPARA=\"CONTENT\",\"application/json\"", 1000);

    // Set URL
    String url_cmd = "AT+HTTPPARA=\"URL\",\"" + server_url + "\"";
    sendATCommand(url_cmd, 2000);

    // Send POST data
    String data_len_cmd = "AT+HTTPDATA=" + String(post_data.length()) + ",10000";
    gsmSerial->println(data_len_cmd);
    delay(500);

    // Wait for DOWNLOAD response
    unsigned long start = millis();
    bool download_ready = false;
    while (millis() - start < 5000)
    {
        if (gsmSerial->available())
        {
            String response = "";
            while (gsmSerial->available())
            {
                response += (char)gsmSerial->read();
            }
            if (response.indexOf("DOWNLOAD") != -1)
            {
                download_ready = true;
                break;
            }
        }
    }

    if (!download_ready)
    {
        Serial.println("Failed to get DOWNLOAD prompt from GSM module");
        sendATCommand("AT+HTTPTERM", 1000);
        return false;
    }

    // Send POST data
    gsmSerial->print(post_data);
    delay(500);

    // Execute POST request
    String response = sendATCommand("AT+HTTPACTION=1", 5000);

    // Check response
    if (response.indexOf("+HTTPACTION: 1") != -1 && response.indexOf("200") != -1)
    {
        Serial.println("HTTP POST request successful (HTTP 200)");
        sendATCommand("AT+HTTPTERM", 1000);
        return true;
    }

    Serial.println("HTTP POST request failed");
    sendATCommand("AT+HTTPTERM", 1000);
    return false;
}

void closeGSM()
{
    if (gsmSerial)
    {
        sendATCommand("AT+HTTPTERM", 1000);
        sendATCommand("AT+SAPBR=0,1", 1000);
        Serial.println("GSM connection closed");
    }
}
