#ifndef CAMERA_H
#define CAMERA_H

#include <Arduino.h>
#include "esp_camera.h"

// Initialized Camera by assigning pins and all other configs
bool initCamera();

// From camera, captures a frame and stores it in frame buffer
camera_fb_t *captureFrame();

// Release the frame buffer from the memory
void releaseFrame(camera_fb_t *fb);

#endif // CAMERA_H