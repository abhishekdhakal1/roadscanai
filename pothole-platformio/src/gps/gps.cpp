#include "gps.h"
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>

static HardwareSerial gpsSerial(1); // UART1
static TinyGPSPlus gps;
static bool gpsInitialized = false;

bool initGPS(int rx_pin, int tx_pin, int baud_rate)
{
    gpsSerial.setRxBufferSize(8192);
    gpsSerial.begin((uint32_t)baud_rate, SERIAL_8N1, rx_pin, tx_pin);
    delay(200);

    gpsInitialized = true;
    Serial.printf("GPS init OK (UART1) RX:%d TX:%d BAUD:%d\n", rx_pin, tx_pin, baud_rate);
    return true;
}

GPSData readGPS()
{
    GPSData data{};
    data.fix_valid = false;
    data.latitude = 0.0;
    data.longitude = 0.0;
    data.accuracy = -1.0f;
    data.satellite_count = 0;

    data.time_valid = false;
    data.year = 0;
    data.month = 0;
    data.day = 0;
    data.hour = 0;

    if (!gpsInitialized)
    {
        return data;
    }

    // Feed parser with all available UART bytes
    while (gpsSerial.available() > 0)
    {
        gps.encode(gpsSerial.read());
    }

    data.fix_valid = gps.location.isValid();
    if (data.fix_valid)
    {
        data.latitude = gps.location.lat();
        data.longitude = gps.location.lng();
    }

    if (gps.hdop.isValid())
    {
        data.accuracy = gps.hdop.hdop(); // lower is better
    }

    if (gps.satellites.isValid())
    {
        data.satellite_count = (int)gps.satellites.value();
    }

    if (gps.date.isValid() && gps.time.isValid())
    {
        data.time_valid = true;
        data.year = gps.date.year();
        data.month = gps.date.month();
        data.day = gps.date.day();
        data.hour = gps.time.hour();
        data.minute = gps.time.minute();
        data.second = gps.time.second();
    }

    return data;
}

bool hasGPSFix()
{
    return gps.location.isValid();
}

String getGPSCoordinates(GPSData d)
{
    if (!d.fix_valid)
    {
        return "NO_FIX";
    }

    String s = String(d.latitude, 6);
    s += ",";
    s += String(d.longitude, 6);
    return s;
}


