#include "WiFiManager/Network.h"

#include <ESP8266WiFi.h>
#include <WiFiClient.h> 
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

Network network("ESP8266 WiFi Configuration");
String host="http://b4bb7915.ngrok.io/test";
StaticJsonDocument<200> doc;
HTTPClient http;
static int i;

void PostTemp(int temp){
  doc["temp"] = temp;
  String s;
  serializeJson(doc, s);
  http.begin(host);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(s);
  if (httpCode != 200)
    Serial.println("Failed to post");
  http.end();
}

void setup() {
  Serial.begin(115200); // Set up the serial port
  network.setup();
  i = 0;
}

void loop() {
  network.loop();
  PostTemp(i);
  
  delay(1500);
  ++i;

}
