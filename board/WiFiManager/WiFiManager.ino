#include "Network.h"

Network network("ESP8266 WiFi Configuration");

void setup() {
	Serial.begin(115200); // Set up the serial port
	network.setup();
}

void loop() {
	network.loop();
}
