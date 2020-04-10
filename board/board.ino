#include "WiFiManager/Network.h"
#include "MeasureTemperature.h"
#include <ESP8266WiFi.h>
#include <WiFiClient.h> 
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

Network network("ESP8266 WiFi Configuration");
String host="http://089f1ea9.ngrok.io/test";
StaticJsonDocument<200> doc;
HTTPClient http;
static int i;

float getTemp(){
  float temps;
  float max = 0;
  float min = 1000;
  float temp;
  for(int i = 0; i < 10; i++){
    temp = measureObjectTemp();
    if (temp > max)
      max = temp;
    if (temp < min)
      min = temp;
    temps += temp;
  }
  temps -= max;
  temps -= min;
  temps /= 8;
  return temps;
}

void PostTemp(float temp){
  doc["temp"] = temp;
  String s;
  serializeJson(doc, s);
  http.begin(host);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(s);
  if (httpCode != 200){
    Serial.println(httpCode);
    Serial.println("Failed to post\n");
  }
  http.end();
}

void setup() {
  Serial.begin(115200); // Set up the serial port
  network.setup();
  //analogReference(3);
  i = 0;
}

void loop() {
  network.loop();
  PostTemp( getTemp() ); 
  
  delay(1500);
  ++i;

}
