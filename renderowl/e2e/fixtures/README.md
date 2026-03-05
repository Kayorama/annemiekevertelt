# E2E Test Fixtures

This directory contains test fixtures for E2E testing.

## Files

- `test-video-1.mp4` - Sample video for upload testing
- `test-video-2.mp4` - Second sample video for timeline testing
- `corrupt-video.mp4` - Corrupted video for error testing
- `large-video.mp4` - Oversized video for validation testing

## Generating Test Videos

To generate test videos, you can use FFmpeg:

```bash
# Generate 5 second test video
ffmpeg -f lavfi -i testsrc=duration=5:size=1920x1080:rate=30 -pix_fmt yuv420p test-video-1.mp4

# Generate 10 second test video
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -pix_fmt yuv420p test-video-2.mp4
```
