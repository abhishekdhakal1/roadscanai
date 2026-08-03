#ifndef CAMERA_H
#define CAMERA_H

#include <Arduino.h>
#include "esp_camera.h"

bool initCamera();
camera_fb_t *captureFrame();
void releaseFrame(camera_fb_t *fb);

#endif // CAMERA_H