# Video Control Guide

## Add Content

Selecting a video file automatically switches Content Type to `Video`. The API also validates the MIME type server-side.

Supported video formats include MP4, WebM, MOV and M4V when the browser and server receive a matching MIME/extension.

## Admin preview controls

The video preview provides native browser controls plus:

- Play / Pause
- Seek -10 seconds
- Seek +10 seconds
- Restart
- Volume slider
- Mute / Unmute
- Playback speed: 0.5×, 1×, 1.25×, 1.5× and 2×
- Current playback time

## Public board

The kiosk display does not show browser controls. It plays the scheduled video automatically when board autoplay is enabled, applies the board volume and per-content mute state, and advances to the next item when the video ends unless looping is enabled.

The title and description are rendered outside the video in the small caption bar below it.
