#ifndef PLATFORM_H
#define PLATFORM_H

#include <stdint.h>

#ifdef _WIN32
#  define API __declspec(dllexport)
#else
#  define API __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

enum log_level : uint8_t { LOG_DEBUG, LOG_INFO, LOG_ERROR };

API int platform_init(const char *name) __attribute__((nonnull(1)));
API void platform_log(enum log_level level, const char *fmt, ...);

static inline uint32_t rotl32(uint32_t x, int k) {
  return (x << k) | (x >> (32 - k));
}

#ifdef __cplusplus
}
#endif

#endif /* PLATFORM_H */
