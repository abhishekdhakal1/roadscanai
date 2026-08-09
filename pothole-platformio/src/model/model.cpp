#include "model.h"
#include "../configs/config.h"
#include "model_data.h"  // generated from model.tflite
#include <MicroTFLite.h> // library for tflite model inference
#include <cmath>         // for expf() used in softmax

// 1 mb allocated in psram for tensor arena
// model in flash as const array
constexpr size_t TENSOR_ARENA_SIZE = 1024 * 1024;
uint8_t *tensor_arena = nullptr;

// pixel size for model training
constexpr int MODEL_INPUT_WIDTH = 128;  // width of pixel
constexpr int MODEL_INPUT_HEIGHT = 128; // height of pizel
constexpr int MODEL_CHANNELS = 3;

bool initModel()
{
    Serial.println("\n--- TensorFlow Lite Micro Init (via MicroTFLite) ---");

    // PSRAM was already verified in setup() before initModel() is called.

    Serial.printf("Model size (compiled in): %u bytes\n", model_tflite_len);

    tensor_arena = (uint8_t *)ps_malloc(TENSOR_ARENA_SIZE);
    if (!tensor_arena)
    {
        Serial.println("Tensor arena allocation failed");
        return false;
    }

    // Initialize environment via standard abstraction layer.
    // model_tflite is const and lives in flash — MicroTFLite reads
    // straight from the memory-mapped flash, no copy needed.
    if (!ModelInit(model_tflite, tensor_arena, TENSOR_ARENA_SIZE))
    {
        Serial.println("ModelInit failed");
        return false;
    }

    Serial.println("TensorFlow Lite Micro initialized");
    ModelPrintMetadata();   //
    ModelPrintTensorInfo(); //

    return true;
}

InferenceResult runInference(uint8_t *rgb_buffer, int src_w, int src_h)
{
    InferenceResult result;
    result.class_index = 0;
    result.class_name = LABELS[0];
    result.probability = 0.0f;
    result.inference_time_ms = 0;

    int index = 0;

    // Direct Nearest-Neighbor Resize and Stream mapping into MicroTFLite input buffer
    for (int y = 0; y < MODEL_INPUT_HEIGHT; y++)
    {
        int src_y = (y * src_h) / MODEL_INPUT_HEIGHT;
        for (int x = 0; x < MODEL_INPUT_WIDTH; x++)
        {
            int src_x = (x * src_w) / MODEL_INPUT_WIDTH;
            int src_idx = (src_y * src_w + src_x) * 3;

            // ImageNet mean and std per channel (R, G, B) — must match
            // the Normalize() transform used during training in Colab.
            static const float MEAN[3] = {0.485f, 0.456f, 0.406f};
            static const float STD[3] = {0.229f, 0.224f, 0.225f};

            for (int c = 0; c < MODEL_CHANNELS; c++)
            {
                float pixel_val = (float)rgb_buffer[src_idx + c];

                // Match training preprocessing: (pixel/255 - mean) / std
                float normalized = (pixel_val / 255.0f - MEAN[c]) / STD[c];

                // ModelSetInput handles INT8/Float32 quantization behind the scenes
                ModelSetInput(normalized, index++);
            }
        }
    }

    unsigned long start_time = millis();
    // Invoke interpretation runner cleanly via explicit API definition
    if (!ModelRunInference())
    {
        Serial.println("Model invocation failed");
        return result;
    }
    result.inference_time_ms = millis() - start_time;

    // ModelGetOutput dequantizes the int8 tensor back to float, but that only
    // recovers the model's raw logits -- this model was exported without a
    // softmax layer (common when training uses from_logits=True), so the
    // dequantized values are unbounded and can be negative. Softmax them here
    // to get an actual 0-1 probability distribution that sums to 1.
    float logits[NUM_CLASSES];
    for (int i = 0; i < NUM_CLASSES; i++)
    {
        logits[i] = ModelGetOutput(i);
    }

    float max_logit = logits[0];
    for (int i = 1; i < NUM_CLASSES; i++)
    {
        if (logits[i] > max_logit)
            max_logit = logits[i];
    }

    float exp_sum = 0.0f;
    float probs[NUM_CLASSES];
    for (int i = 0; i < NUM_CLASSES; i++)
    {
        probs[i] = expf(logits[i] - max_logit); // subtract max for numerical stability
        exp_sum += probs[i];
    }

    int max_idx = 0;
    float max_prob = -1.0f;

    Serial.println("\n--- Classification Probability Breakdown ---");
    for (int i = 0; i < NUM_CLASSES; i++)
    {
        float probability = probs[i] / exp_sum;
        Serial.printf("Class %s: %.2f%%\n", LABELS[i], probability * 100.0f);

        if (probability > max_prob)
        {
            max_prob = probability;
            max_idx = i;
        }
    }

    // Store results in return structure
    result.class_index = max_idx;
    result.class_name = LABELS[max_idx];
    result.probability = max_prob;

    Serial.printf("\n>> Top Match: %s (Probability: %.2f%%, Inference Time: %lu ms)\n",
                  result.class_name, result.probability * 100.0f, result.inference_time_ms);

    return result;
}