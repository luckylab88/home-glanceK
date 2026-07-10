# Home Glance v1.1 — Official Data

Data sources:
- Weather, UV, sunrise and sunset: Open-Meteo using the public Rugby Clock Tower reference point.
- Lunar date and 24 solar terms: Hong Kong Observatory annual Gregorian–Lunar conversion table.
- Official UK severe-weather warnings: Met Office NSWWS public beta on Esri UK.
- Daily quotes: local JSON.

The page keeps fallbacks:
- If the HKO annual file cannot be reached, the browser's Chinese calendar is used for the lunar date.
- If the Met Office public beta cannot be reached, local Open-Meteo-based notices or the daily quote are shown.

No API keys or private account data are stored in the public page.
