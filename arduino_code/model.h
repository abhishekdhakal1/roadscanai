#ifndef MODEL_H
#define MODEL_H

#include <Arduino.h>

struct InferenceResult
{
    int class_index;
    const char *class_name;
    float probability;
    unsigned long inference_time_ms;
};

bool initModel();
InferenceResult runInference(uint8_t *rgb_data, int width, int height);

#endif // MODEL_H