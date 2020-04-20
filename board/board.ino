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

String websocketsServerHost = "wss://anticov.tew.tw/data?token="; //Enter server adress
const char * host = "https://anticov.tew.tw/api/v1/login";
String authToken;
const char SSL_FINGER_PRINT[] PROGMEM = "EB 65 CB 24 B4 0A 75 54 6C BD B2 89 61 06 BC 94 FF 10 FF 86";
const uint8_t LOGIN_FINGER_PRINT[20] = {0xeb, 0x65, 0xcb, 0x24, 0xb4, 0x0a, 0x75, 0x54, 0x6c, 0xbd, 0xb2, 0x89, 0x61, 0x06, 0xbc, 0x94, 0xff, 0x10, 0xff, 0x86};


LiquidCrystal_I2C lcd(0x27, 16, 2);
StaticJsonDocument<200> doc;
WebsocketsClient client;

void(* resetFunc) (void) = 0;//declare reset function at address 0
int isOn;

String getAuthorizedToken(std::unique_ptr<BearSSL::WiFiClientSecure>& loginClient){
  HTTPClient https;
  String payload;
  ESP8266network.loop();
  Serial.print("[HTTPS] begin...\n");
  if(https.begin(*loginClient, host)){
    https.addHeader("Content-Type", "application/json");
    int httpsCode = https.POST("{\"username\":\"admin\", \"password\":\"AntiCoV\"}");
    payload = https.getString();
    if (httpsCode == HTTP_CODE_OK) {
     Serial.println("Authorized Successful");  
    }
    else{
     Serial.println(httpsCode);
     Serial.printf("Failed to post %s\n", https.errorToString(httpsCode).c_str());

    }
    
    https.end();
  }
  Serial.print("[HTTPS] end...\n");
  return payload;
}

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Got Message: ");
    Serial.println(message.data());
    DynamicJsonDocument serverReturnData(1024);
    deserializeJson(serverReturnData, message.data());
    JsonObject obj = serverReturnData.as<JsonObject>();
    String result = obj["alarm"].as<String>();
    if(result == "bad"){
      sound(10);
    }else if(result == "fever"){
      sound(5);
    }else if(result == "null"){
      sound(2);
    }
    
}

void onEventsCallback(WebsocketsEvent event, String data) {
    if(event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");
    } else if(event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");
        resetFunc();
        
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
  doc["temperature"] = temp;
  String s;
  serializeJson(doc, s);
  Serial.println(s.c_str());
  client.send(s.c_str());
  isOn = 0;
}

void test() {
  

    

    float temp = getTemp();
    delay(500);
    temp += getTemp();
    temp /= 2;
    lcd.setCursor(0, 1);


    lcd.print(temp);
    PostTemp(temp);
    delay(1500);
  
}

void websocketConnecting(){
  std::unique_ptr<BearSSL::WiFiClientSecure>loginClient(new BearSSL::WiFiClientSecure);
  loginClient->setFingerprint(LOGIN_FINGER_PRINT);
  authToken = getAuthorizedToken(loginClient);

  String url = (websocketsServerHost + authToken);
  
  
  Serial.printf("We are now connecting to %s\n" , url.c_str());
  //socket initialize
  // run callback when messages are received
  

  client.onMessage(onMessageCallback);
    
  // run callback when events are occuring
  client.onEvent(onEventsCallback);

  client.setFingerprint(SSL_FINGER_PRINT);

  // Connect to server
  //client.connect(anticov_host, anticov_port, anticov_path);
  client.connect(url.c_str());
  
  doc["cmd"] = "temperature";
  doc["device"] = "board";
  doc["temperature"] = 0;
  String s;
  serializeJson(doc, s);
  Serial.println(s.c_str());
 
  client.send(s.c_str());
}


void setup() {
  // Serial pinMode and object initialize
  Serial.begin(115200); // Set up the serial port
  ESP8266network.setup();
  // initialize the LCD
  lcd.begin();
  // lcd initialization
  
  lcd.setBacklight((uint8_t)1);// Turn on the blacklight
  lcd.print("Hello, This is Temerature Sensor!");
  delay(1000);
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
  pinMode(BUTTON, INPUT);
  pinMode(SOUND, OUTPUT);

  // authorization
  // websockets connecting
  websocketConnecting();


  // doc initialize 
  // json : 
  // {
  //   "cmd": "temperature"
  //   “device": "board"
  //   "temperature": Number
  // }

  Serial.println("Finish initialization");
}

void loop() {
  ESP8266network.loop();
  if(client.available()){
    client.poll();
  }
  isOn = digitalRead(BUTTON);
  if(isOn){
    sound(1);
    test();
    sound(2);
  }
}
