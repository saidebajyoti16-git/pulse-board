#!/usr/bin/env bash
# Cron-friendly watchdog. Restarts Chromium when the kiosk process disappears.
if ! pgrep -f "chromium.*kiosk" >/dev/null 2>&1; then
  export DISPLAY=:0
  chromium-browser --noerrdialogs --disable-infobars --kiosk "http://pulse-board-server/display/board-1" --autoplay-policy=no-user-gesture-required &
fi
