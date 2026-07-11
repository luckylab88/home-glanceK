# Home Glance v1.1 Stable

Designed for Amazon Fire HD with Silk Browser.

## Data sources
- Weather, UV, sunrise and sunset: Open-Meteo using Rugby Clock Tower as a public reference point.
- Lunar date and 24 solar terms: Hong Kong Observatory annual Gregorian–Lunar conversion table.
- Official UK severe-weather warnings: Met Office NSWWS public beta on Esri UK.
- Daily quotes: local JSON.

## Reliability
- HKO annual data is cached in the browser.
- If HKO cannot be reached, the browser Chinese calendar is used for the lunar date.
- If Met Office warning data cannot be reached, Home Glance falls back to local weather notices or a daily quote.
- Returning from YouTube, waking the tablet, reconnecting Wi-Fi, or reopening the tab triggers an immediate refresh.

## Debug mode
Add `?debug=1` to the page URL to show the active data-source status.

No API keys or private account data are stored in the page.
