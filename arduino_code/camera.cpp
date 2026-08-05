#include "camera.h"
#include "config.h"
#include "board_config.h"

bool initCamera() {
  camera_config_t config;

  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;

  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;

  config.pin_xclk = XCLK_GPIO_NUM;

  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;

  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;

  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;
  config.pixel_format = CAMERA_PIXEL_FORMAT;
  config.frame_size = CAMERA_FRAME_SIZE;
  config.jpeg_quality = CAMERA_JPEG_QUALITY;
  config.fb_count = 2;
  config.grab_mode = CAMERA_GRAB_LATEST;
  config.fb_location = CAMERA_FB_IN_PSRAM;

  if (!psramFound()) {
    Serial.println("PSRAM NOT FOUND");
    config.fb_location = CAMERA_FB_IN_DRAM;
    config.fb_count = 1;
  } else {
    Serial.println("PSRAM OK");
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera Init Failed : 0x%x\n", err);
    return false;
  }

  sensor_t *sensor = esp_camera_sensor_get();
  sensor->set_framesize(sensor, CAMERA_FRAME_SIZE);

  Serial.println("Camera Initialized");
  return true;
}

camera_fb_t *captureFrame() {
  return esp_camera_fb_get();
}

void releaseFrame(camera_fb_t *fb) {
  if (fb != nullptr) {
    esp_camera_fb_return(fb);
  }
}