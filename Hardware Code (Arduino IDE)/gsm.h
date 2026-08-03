#ifndef GSM_H
#define GSM_H

#include <Arduino.h>

// Structure to hold GSM module status
struct GSMStatus
{
    bool initialized;
    bool network_registered;
    int signal_strength; // 0-31 (31 is strongest)
    String operator_name;
};

// Initialize GSM module
// Parameters:
//   - rx_pin: RX pin for UART connection
//   - tx_pin: TX pin for UART connection
//   - baud_rate: Serial baud rate (typically 9600 for SIM800L)
bool initGSM(int rx_pin, int tx_pin, uint32_t baud_rate);

// Get GSM module status
// Returns: GSMStatus structure with current module information
GSMStatus getGSMStatus();

// Send SMS message via GSM module
// Parameters:
//   - phone_number: Destination phone number (e.g., "+1234567890")
//   - message: SMS message content (max 160 characters)
// Returns: true if SMS sent successfully, false otherwise
bool sendSMS(String phone_number, String message);

// Send HTTP POST request with pothole alert data
// Parameters:
//   - server_url: Full URL including protocol (e.g., "http://example.com/alert")
//   - post_data: JSON data to send
// Returns: true if request sent successfully, false otherwise
bool sendHTTPPost(String server_url, String post_data);

// Close GSM connection
void closeGSM();

#endif // GSM_H
