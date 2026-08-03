#ifndef GPS_H
#define GPS_H

#include <Arduino.h>

struct GPSData
{
    bool fix_valid;
    double latitude;
    double longitude;
    float accuracy;
    int satellite_count;
};

bool initGPS(int rx_pin, int tx_pin, int baud_rate);
GPSData readGPS();
bool hasGPSFix();
String getGPSCoordinates();

#endif // GPS_H