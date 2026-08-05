#ifndef GPS_H
#define GPS_H

#include <Arduino.h>

// A struct to store GPS Data
struct GPSData
{
    bool fix_valid;
    double latitude;
    double longitude;
    float accuracy;
    int satellite_count;
};

// Initialize GPS module with configuration pins and baud rate
bool initGPS(int rx_pin, int tx_pin, int baud_rate);

// Function that reads GPS data and returns the information in GPSData struct
GPSData readGPS();

// Check for the validity of GPS's location
bool hasGPSFix();

// Simply returns latitude and longitude upto 6 decimal places as a comma separated string
String getGPSCoordinates();

#endif // GPS_H