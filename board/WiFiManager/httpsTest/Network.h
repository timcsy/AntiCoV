#ifndef NETWORK_H
#define NETWORK_H

#include <ESP8266WiFi.h>          // ESP8266 Core WiFi Library (you most likely already have this in your sketch)

#include <DNSServer.h>            // Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>     // Local WebServer used to serve the configuration portal
#include <WiFiManager.h>          // https://github.com/tzapu/WiFiManager WiFi Configuration Magic

class Network {
	public:
		Network(const char* ssid = "ESP8266 WiFi Configuration", const char* password = NULL):
			ssid(ssid), password(password) {}
		
		void setup() { // This should be put in the beginning of the setup()
			connect(ssid, password);
		}

		void loop() { // This should be put in the beginning of the loop()
			// To check if the connection is still valid
			while (WiFi.status() != WL_CONNECTED) {
				connect(ssid, password);
			}
		}

		static void connect(const char* ssid = "ESP8266 WiFi Configuration", const char* password = NULL) {
			// To start WiFi Manager

			//WiFiManager
			//Local intialization. Once its business is done, there is no need to keep it around
			WiFiManager wifiManager;
			//reset saved settings
			//wifiManager.resetSettings();
			
			//set custom ip for portal
			//wifiManager.setAPStaticIPConfig(IPAddress(10,0,1,1), IPAddress(10,0,1,1), IPAddress(255,255,255,0));

			//fetches ssid and pass from eeprom and tries to connect
			//if it does not connect it starts an access point with the specified name
			//here  "AutoConnectAP"
			//and goes into a blocking loop awaiting configuration
			
			wifiManager.autoConnect(ssid, password);
			//or use this for auto generated name ESP + ChipID
			//wifiManager.autoConnect();

			
			//if you get here you have connected to the WiFi
			Serial.println("Network connected successfully :)");
		}
	
	private:
		const char * ssid;
		const char * password;
};

#endif
