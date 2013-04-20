#define NUMSENSORS 3
#define BAUDRATE   115200
#define WATCHCAP   "08"
#define MAX_BUFFER 1024

#include <stdarg.h>
#include <cstring>
#include <CapacitiveSensor.h>

HardwareSerial bt = HardwareSerial();

struct capsensor {
  int isActivated;
  int sendPin;
  int receivePin;
  long currentVal;
  CapacitiveSensor *sensor;
};

int sensorsSet = 0;
capsensor sensors[NUMSENSORS];

void setup () {
  bt.begin(BAUDRATE);
  bt.println();
  char *args[2];
  args[0] = "31";
  args[1] = "32";
  cmd_watch_cap(args, 2);

  args[0] = "33";
  args[1] = "34";
  cmd_watch_cap(args, 2);

  args[0] = "35";
  args[1] = "36";
  cmd_watch_cap(args, 2);
}

void loop () {

  int i;

  // check for the watchers, write any changes
  for (i = 0; i < sensorsSet; i++) {
    CapacitiveSensor sensor = *sensors[i].sensor;
    long c = sensor.capacitiveSensor(30);

    sensors[i].currentVal = c;

    String cv = String(sensors[i].currentVal);
    char currentVal[20];
    cv.toCharArray(currentVal, 20);

    String t;
    String sendPin = String(sensors[i].sendPin);
    String receivePin = String(sensors[i].receivePin);
    String delimeter = String('/');
    t += sendPin;
    t += delimeter;
    t += receivePin;

    char tag[40];
    t.toCharArray(tag, 40);

    char *data[] = {
      currentVal,
      tag
    };

    write(WATCHCAP, data, 2);
  }
}

// build the packet and send via serial
void write (char *command, char *args[], int count) {
  int i;

  bt.write(command);

  if (args && count) {
    bt.write("");
    for (i = 0; i < count; i++) {
      bt.write(":");
      bt.print(strlen(args[i]));
      bt.write(":");
      bt.write(args[i]);
    }
  }

  bt.write("\n");
}

/*
 * Args:
 * sendPin
 * receivPin
 */
void cmd_watch_cap (char *args[], int count) {
  capsensor sensor;

  sensor.isActivated = 1;
  sensor.sendPin = atoi(args[0]); //31
  sensor.receivePin = atoi(args[1]); //33

  CapacitiveSensor s = CapacitiveSensor(sensor.sendPin, sensor.receivePin);
  sensor.sensor = &s;

  sensors[sensorsSet] = sensor;
  sensorsSet = sensorsSet + 1;
}
