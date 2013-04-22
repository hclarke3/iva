#define NUMSENSORS 3
#define BAUDRATE   115200
#define WATCHCAP   "08"
#define MAX_BUFFER 1024

#include <stdarg.h>
#include <cstring>
#include <CapacitiveSensor.h>

HardwareSerial bt = HardwareSerial();

struct capsensor {
  int sendPin;
  int receivePin;
  CapacitiveSensor *sensor;
};

CapacitiveSensor s1 = CapacitiveSensor(PIN_F4, PIN_F1);
CapacitiveSensor s2 = CapacitiveSensor(PIN_F7, PIN_F6);
CapacitiveSensor s3 = CapacitiveSensor(PIN_B4, PIN_B5);


int sensorsSet = 0;
capsensor sensors[NUMSENSORS];

void setup () {
  bt.begin(BAUDRATE);
  bt.println();
}

void loop () {
  long c1 = s1.capacitiveSensor(30);
  write(WATCHCAP, c1 , "s1");
  
  long c2 = s2.capacitiveSensor(30);
  write(WATCHCAP, c2, "s2");
  
  long c3 = s3.capacitiveSensor(30);
  write(WATCHCAP, c3, "s3");
  
  delay(20);
}

// build the packet and send via serial
void write (char *command, long value, char *tag) {
  bt.write(command);
  bt.write(":");
  bt.print(value);
  bt.write(":");
  bt.write(tag);
  
  bt.write("\n");
}
