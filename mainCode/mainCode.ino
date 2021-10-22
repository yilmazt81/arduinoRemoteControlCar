#include <SPI.h>
#include <SD.h>
#include <Wire.h>
#include <IniFile.h>
#include "WiFiEsp.h" 
#include <WiFiEspClient.h>
#include "PubSubClient.h" 
#include <LiquidCrystal_I2C.h>
#include <WiFiEspUdp.h> 
#include <Stepper.h>


#define STEPS 100

// change this to match your SD shield or module;
const int chipSelect = 10;
char ssid[100] = "";// your network SSID (name)
char pass[100] = ""; 
char deviceName[100] = "";
byte mqttAdres[4] = "";
char mqttport[10] = "";
char mqttUserName[50] = "";
char mqttUserKey[50] = "";
byte byte_array[4]; 
char* lastCommand="";

LiquidCrystal_I2C lcd(0x27, 16, 2);
Stepper stepper(STEPS, 4, 5, 6, 7);

int status = WL_IDLE_STATUS;     // the Wifi radio's status


// Setup the MQTT client class by passing in the WiFi client and MQTT server and login details.
WiFiEspClient  espClient;
PubSubClient client(espClient);

void setup()
{
  // Open serial communications and wait for port to open:
  Serial.begin(115200);
  
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }
  lcd.begin(); 
  Serial.print("Initializing SD card...");
  WriteScreenMessage("SD Card Taniniyor","");
   
  if (!SD.begin(SPI_HALF_SPEED, chipSelect)) {
   
    WriteScreenMessage("SD Card Hatasi","");
   
    return;
  }
  Serial.println("initialization done.");
     
  OpenSettingFile();
  ConnectWF(); 
    
  
  IPAddress server(mqttAdres[0],mqttAdres[1],mqttAdres[2],mqttAdres[3]);
 
  client.setServer(server, 1883);
  client.setCallback(callback);
  MQTT_connect();
  
  stepper.setSpeed(30);
    
}

 
void MQTT_connect() { 
  
 
  while (!client.connected()) {
     
    if (client.connect((char*)deviceName)) {
      WriteScreenMessage("MQTT Servise","Baglandi");
      Serial.println("connected");
      // Once connected, publish an announcement...
      //client.publish("outTopic", "hello world");
      // ... and resubscribe

        boolean success = client.subscribe("/Command");
        Serial.print("Subscribe returned ");
        Serial.println(success);
            
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      WriteScreenMessage("MQTT Servise","Hata Aldi");
      // Wait 5 seconds before retrying
      delay(10000);
    }
  };
   
} 


 void callback(char* topic, char* payload, unsigned int length) {
  if ((char*)topic=="/Command")
  { 
     lastCommand=(char*)payload;
      
      Serial.print("Message arrived [");
      Serial.print(topic);
      Serial.print("] ");
      for (int i = 0; i < length; i++) {
      Serial.print((char)payload[i]);
      }
      Serial.println(); 
     WriteScreenMessage(topic,payload);
  }
}
 


void ConnectWF(){
  Serial3.begin(115200);
  //soft.begin(9600);
  
  // initialize ESP module
  WiFi.init(&Serial3);
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue
    while (true);
  }
   while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    WriteScreenMessage("WF  Baglaniyor",".....");
    status = WiFi.begin(ssid, pass);
    if (status != WL_CONNECTED)
    {
      WriteScreenMessage(ssid,"Baglanamadi");
    }
  }
  WriteScreenMessage("WF Adi",ssid);
  
  printWifiStatus();
}

void playSound()
{
    /*audioPlayer.speakerPin = 3; //5,6,11 or 46 on Mega, 9 on Uno, Nano, etc
    audioPlayer.setVolume(30);
  
    audioPlayer.play("alert.wav");
    int playState=audioPlayer.isPlaying();
    if (playState==1)
    {
      Serial.println("play.");
    }else
    {
      
        Serial.println("Not Playing.");
    }*/
}
 
 
void loop()
{

  MQTT_connect();

  
 if (!client.connected())
 {
        Serial.println("Mqtt servis bagli degil");
      if (WiFi.status()!= WL_CONNECTED){
 
        Serial.println("Wifi Bagli degil");
       // delay(500);
      } 
  
      delay(500);
      //
 }else{
    client.loop();

    if (lastCommand=="Up"){
      stepper.step(100);
    }
   // Serial.println("Mqtt servis bagli  ");
     delay(100);
 }
  
  delay(500);
}


void printWifiStatus()
{
  // print the SSID of the network you're attached to
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  char ipno2[26] ;
  sprintf(ipno2, "%d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3]);
   
   WriteScreenMessage("Ip Adres",ipno2);

  // print the received signal strength
  long rssi = WiFi.RSSI();
  Serial.print("Signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  
}
void WriteScreenMessage(String messageLine1,String messageLine2)
{
    lcd.noCursor();
    lcd.clear();
    //lcd.cursor();
    lcd.setCursor(0, 0);
    lcd.print(messageLine1);  
    lcd.setCursor(0 ,1);
    //lcd.clear();
    lcd.print(messageLine2);  
 
   // lcd.setCursor(0, 0);
    
}




void OpenSettingFile(){
   const char *filename = "setting.ini";
   IniFile ini(filename);

   const size_t bufferLen = 100;
   char buffer[bufferLen];

   if (!ini.open()) {
    Serial.print("Ini file ");
    Serial.print(filename);
    Serial.println(" does not exist");
    WriteScreenMessage("Ayar Dosyasi","Mevcut Degil");
      
    // Cannot do anything else
    while (1)
      ;
  }

   if (ini.getValue("Setting", "wfName", ssid, bufferLen)) {
     Serial.print("WF Name >");  
     
     //memset(ssid, 0, sizeof(ssid));
     Serial.println(ssid);
  }

   if (ini.getValue("Setting", "wfPassword", pass, bufferLen)) {
     Serial.print("wf Password  >");   
     //memset(pass, 0, sizeof(pass));
     Serial.println(pass);    
  }
  

  if (ini.getValue("Setting", "wfdeviceName", deviceName, bufferLen)) {
    Serial.print("Device Name >" );    
     //memset(deviceName, 0, sizeof(deviceName));
     Serial.println(deviceName);  
  }

 
  if (ini.getValue("Setting", "mqttAdres", buffer, bufferLen)) {
   Serial.print("mqtt Adres >");
   //memset(mqttAdres, 0, sizeof(mqttAdres));
   Serial.println(buffer);   
   Char2IP(buffer);
    for (int i = 0; i < 4; i++) {
      mqttAdres[i] = byte_array[i];
      
    }    
  }

  if (ini.getValue("Setting", "mqttPort", mqttport, bufferLen)) {
   Serial.print("mqtt port >");
   //memset(mqttAdres, 0, sizeof(mqttAdres));
   Serial.println(mqttport);   
  }
  if (ini.getValue("Setting", "mqttUserName", mqttUserName, bufferLen)) {
   Serial.print("mqtt User Name >");
   //memset(mqttAdres, 0, sizeof(mqttAdres));
   Serial.println(mqttUserName);   
  }
   if (ini.getValue("Setting", "mqttUserKey", mqttUserKey , bufferLen)) {
   Serial.print("mqtt User key >");
   //memset(mqttAdres, 0, sizeof(mqttAdres));
   Serial.println(mqttUserKey);   
  }
}


void Char2IP(char* str) {
  char *ptr;
  char delimiter[] = ".";
  ptr = strtok(str, delimiter);
  byte_array[0] = byte(atoi(ptr));
  ptr = strtok(NULL, delimiter);
  byte_array[1] = byte(atoi(ptr));
  ptr = strtok(NULL, delimiter);
  byte_array[2] = byte(atoi(ptr));
  ptr = strtok(NULL, delimiter);
  byte_array[3] = byte(atoi(ptr));
}
