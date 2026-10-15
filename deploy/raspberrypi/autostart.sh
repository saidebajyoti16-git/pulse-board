#!/usr/bin/env bash
set -e
# Example Openbox autostart for the Pulse Board kiosk.
# Replace the URL with the production server hostname.
export PULSE_BOARD_URL="http://pulse-board-server/display/board-1"
xset s off
xset -dpms
xset s noblank
unclutter -idle 0.2 &
chromium-browser --noerrdialogs --disable-infobars --kiosk "$PULSE_BOARD_URL" --autoplay-policy=no-user-gesture-required &
