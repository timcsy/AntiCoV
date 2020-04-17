#include "WiFiManager/Network.h"
#include "MeasureTemperature.h"
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoWebsockets.h>

#define BUTTON D5
#define SOUND D6

using namespace websockets;

Network ESP8266network("ESP8266 WiFi Configuration");

const char* websockets_server_host = "192.168.50.134"; //Enter server adress
const uint16_t websockets_server_port = 9001; // Enter server port

const char * host = "http://192.158.50.134:9002/test";


LiquidCrystal_I2C lcd(0x27, 16, 2);
StaticJsonDocument<200> doc;
HTTPClient http;
WebsocketsClient client;

int isOn;

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Got Message: ");
    Serial.println(message.data());
    if(message.data() == "on"){
      Serial.println("Sound On");
      sound(3);
    }
}

void onEventsCallback(WebsocketsEvent event, String data) {
    if(event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");
    } else if(event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");
    } else if(event == WebsocketsEvent::GotPing) {
        Serial.println("Got a Ping!");
    } else if(event == WebsocketsEvent::GotPong) {
        Serial.println("Got a Pong!");
    }
}

void sound(int times){
  for(int i = 0; i < times; ++i){
    digitalWrite(D6, HIGH);
    delay(100);
    digitalWrite(D6, LOW);
    delay(100);
  }
}

void PostTemp(float temp) {
  doc["temp"] = temp;
  String s;
  serializeJson(doc, s);
  http.begin(host);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(s);
  if (httpCode != 200) {
    Serial.println(httpCode);
    Serial.println("Failed to post\n");
  }
  http.end();
  isOn = 0;
}

void test() {
  isOn = digitalRead(BUTTON);
  if (isOn) {
    ESP8266network.loop();
    sound(1);
    float temp = getTemp();
    delay(500);
    temp += getTemp();
    temp /= 2;
    lcd.setCursor(0, 1);
    sound(2);

    lcd.print(temp);
    PostTemp(temp);
    delay(1500);
  } else {
    digitalWrite(SOUND, LOW);
  }
}



void setup() {
  // Serial pinMode and object initialize
  Serial.begin(115200); // Set up the serial port
  ESP8266network.setup();
  // initialize the LCD
  lcd.begin();
  pinMode(BUTTON, INPUT);
  pinMode(SOUND, OUTPUT);

  
  // Turn on the blacklight
  lcd.setBacklight((uint8_t)1);

  //socket initialize
  // run callback when messages are received
  client.onMessage(onMessageCallback);
    
  // run callback when events are occuring
  client.onEvent(onEventsCallback);

  // Connect to server
  client.connect(websockets_server_host, websockets_server_port, "/");

  // Send a message
  client.send("Hello Server");

  
  lcd.print("Hello, This is Temerature Sensor!");
  delay(500);
  lcd.clear();
  lcd.print("Please Wait...");
  lcd.setCursor(0, 1);
  for (int i = 9; i > 0 ; i--) {
    lcd.print(i);
    delay(500);
  }
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temperture = ");
  
}

void loop() {
  client.poll();
  test();
}
