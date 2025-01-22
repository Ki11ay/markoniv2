#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <addons/TokenHelper.h>
#include <time.h>

// Firebase configuration
FirebaseConfig firebaseConfig;
FirebaseAuth firebaseAuth;

// WiFi credentials
const char* ssid = "SHABAB";
const char* password = "MOHAMED642019";

// Firebase paths
const char* sensor1Path = "/sensor1";
const char* sensor2Path = "/sensor2";
const char* dryFanPath = "/dry-fan";
const char* wetFanPath = "/wet-fan";

// Firebase data object
FirebaseData firebaseData;

// Temperature sensors setup
const int oneWireBus = 4;  // GPIO4 for DS18B20 sensors
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);
DeviceAddress sensor1Address, sensor2Address;

// LCD setup (0x27 is the default I2C address, might need to change to 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Timing constants
const unsigned long SENSOR_READ_DELAY = 2000;
const unsigned long FIREBASE_UPDATE_DELAY = 5000;
const unsigned long HEARTBEAT_DELAY = 10000;  // 10 seconds
unsigned long lastSensorRead = 0;
unsigned long lastFirebaseUpdate = 0;
unsigned long lastSensorUpdate = 0;
unsigned long lastHeartbeat = 0;

// Add these at the top with other variables
unsigned long connectionCounter = 0;  // Counter for connection status

void setupWiFi() {
  WiFi.begin(ssid, password);
  lcd.clear();
  lcd.print("Connecting WiFi..");
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    lcd.clear();
    lcd.print("WiFi Connected!");
  } else {
    Serial.println("\nWiFi Connection Failed!");
    lcd.clear();
    lcd.print("WiFi Failed!");
    ESP.restart();
  }
  delay(1000);
}

void setupFirebase() {
  firebaseConfig.host = "markoni-fc0f3-default-rtdb.firebaseio.com";
  firebaseConfig.signer.tokens.legacy_token = "bDjmqLQeNmuykKk44JQkGPD8W4pY7kjYe6SUqPQi";
  
  Firebase.begin(&firebaseConfig, &firebaseAuth);
  Firebase.reconnectWiFi(true);
  
  if (Firebase.ready()) {
    Serial.println("Firebase connected!");
    lcd.clear();
    lcd.print("Firebase Ready!");
  } else {
    Serial.println("Firebase failed!");
    lcd.clear();
    lcd.print("Firebase Error!");
    delay(2000);
    ESP.restart();
  }
  delay(1000);
}

void setupSensors() {
  sensors.begin();
  delay(1000);
  
  // Locate devices on the bus
  Serial.println("Locating temperature sensors...");
  Serial.print("Found ");
  Serial.print(sensors.getDeviceCount(), DEC);
  Serial.println(" devices.");

  // Get the first two sensor addresses
  if (!sensors.getAddress(sensor1Address, 0)) {
    Serial.println("Unable to find sensor 1!");
  }
  if (!sensors.getAddress(sensor2Address, 1)) {
    Serial.println("Unable to find sensor 2!");
  }

  // Set resolution to 12 bit (can be 9-12)
  sensors.setResolution(sensor1Address, 12);
  sensors.setResolution(sensor2Address, 12);

  // Print the addresses (useful for verification)
  Serial.print("Sensor 1 Address: ");
  for (uint8_t i = 0; i < 8; i++) {
    Serial.print(sensor1Address[i], HEX);
    Serial.print(" ");
  }
  Serial.println();

  Serial.print("Sensor 2 Address: ");
  for (uint8_t i = 0; i < 8; i++) {
    Serial.print(sensor2Address[i], HEX);
    Serial.print(" ");
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  
  // Initialize I2C LCD
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.print("Starting up...");
  
  setupSensors();
  setupWiFi();
  setupFirebase();
}

bool readSensors(float &temp1, float &temp2) {
  sensors.requestTemperatures();
  
  temp1 = sensors.getTempC(sensor1Address);
  temp2 = sensors.getTempC(sensor2Address);
  
  if (temp1 == DEVICE_DISCONNECTED_C || temp2 == DEVICE_DISCONNECTED_C) {
    Serial.println("Error reading temperature sensors!");
    lastSensorUpdate = 0;
    connectionCounter = 0;  // Reset counter on error
    return false;
  }
  
  lastSensorUpdate = millis();
  connectionCounter++;  // Increment counter on successful read
  return true;
}

void updateLCD(float temp1, float temp2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T1:");
  lcd.print(temp1, 1);
  lcd.print("C ");
  lcd.setCursor(0, 1);
  lcd.print("T2:");
  lcd.print(temp2, 1);
  lcd.print("C");
}

void updateFirebase(float temp1, float temp2) {
  if (Firebase.setFloat(firebaseData, sensor1Path, temp1)) {
    Serial.println("Sensor 1 data sent");
  } else {
    Serial.println("Failed to send sensor 1: " + firebaseData.errorReason());
  }
  
  if (Firebase.setFloat(firebaseData, sensor2Path, temp2)) {
    Serial.println("Sensor 2 data sent");
  } else {
    Serial.println("Failed to send sensor 2: " + firebaseData.errorReason());
  }

  // Send connection counter as status
  if (Firebase.setInt(firebaseData, "/lastUpdate", connectionCounter)) {
    Serial.println("Connection counter updated: " + String(connectionCounter));
  } else {
    Serial.println("Failed to update counter: " + firebaseData.errorReason());
  }
}

void readFanSpeeds() {
  if (Firebase.getInt(firebaseData, dryFanPath)) {
    int dryFanSpeed = firebaseData.intData();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Dry Fan: ");
    lcd.print(dryFanSpeed);
  }
  
  if (Firebase.getInt(firebaseData, wetFanPath)) {
    int wetFanSpeed = firebaseData.intData();
    lcd.setCursor(0, 1);
    lcd.print("Wet Fan: ");
    lcd.print(wetFanSpeed);
  }
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    setupWiFi();
  }
  
  // Update heartbeat
  if (currentMillis - lastHeartbeat >= HEARTBEAT_DELAY) {
    if (Firebase.setBool(firebaseData, "/isAlive", true)) {
      Serial.println("Heartbeat sent");
    } else {
      Serial.println("Failed to send heartbeat: " + firebaseData.errorReason());
    }
    lastHeartbeat = currentMillis;
  }
  
  // Read sensors
  if (currentMillis - lastSensorRead >= SENSOR_READ_DELAY) {
    float temp1, temp2;
    
    if (readSensors(temp1, temp2)) {
      Serial.printf("Temperatures - Sensor1: %.2f°C, Sensor2: %.2f°C\n", temp1, temp2);
      updateLCD(temp1, temp2);
      
      // Update Firebase
      if (currentMillis - lastFirebaseUpdate >= FIREBASE_UPDATE_DELAY) {
        updateFirebase(temp1, temp2);
        readFanSpeeds();
        lastFirebaseUpdate = currentMillis;
      }
    } else {
      lcd.clear();
      lcd.print("Sensor Error!");
      delay(2000);
    }
    
    lastSensorRead = currentMillis;
  }
  
  delay(100);
}