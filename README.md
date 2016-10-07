# Qubino

This app adds support for the following Qubino devices in Homey:

* ZMNHVD1 Flush Dimmer 0-10V (Z-Wave Plus)
* ZMNHDD1 Flush Dimmer (Z-Wave Plus)
* ZMNHDA2 Flush Dimmer
* ZMNHSD1 DIN RAIL Dimmer (untested)

Not all settings are implemented. Feel free to contribute!
Temperature sensor only working for ZMNHDA2.

Version 1.04

* Icons for devices changed.
* Power measurement in kWh and Watt added.
* Moved to mobile device cards. Be aware, not al values are visible because at this moment there is no scrollbar and items in Chrome are limited to 4 and in IOS to 3.
* ZMNHDA2 Flush Dimmer: if no temperature sensor connected, -999,90 °C is shown as value.
* ZMNHVD1, ZMNHDD1 & ZMNHDA2: flow trigger added for temperature changed.
* Added option in capability in case there is no temperature sensor connected to prevent crash
* ZMNHTD1 DIN Smart Meter (untested)
* ZMNHND1 Flush 1D Relay
