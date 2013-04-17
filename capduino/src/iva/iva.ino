#define NUMSENSORS 3
#define BAUDRATE   115200

#define INIT       "00"
#define ERROR      "01"
#define PING       "02"
#define PONG       "03"
#define GET        "04"
#define SET        "05"
#define WATCH      "06"
#define UNWATCH    "07"
#define WATCHCAP   "08"
#define OK         "23"

#define MAX_BUFFER 1024
#define MAX_ARGS   10

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
  //Serial.begin(BAUDRATE);
  //Serial.println();
  bt.begin(BAUDRATE);
  bt.println();
  write(INIT, NULL, 0, "");
}

void loop () {
  // serial read and command processing loop
  read();

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

    write(WATCHCAP, data, 2, NULL);
  }
}

// read any packets waiting, yielding every 10 characters
void read () {
  static char buffer[MAX_BUFFER];
  static int index = 0;
  static int count = 0;

  while (bt.available() > 0 && count < 10) {
    if (index >= MAX_BUFFER) {
      char *data[1];

      data[0] = "Maximum Buffer Size Exceeded";
      write(ERROR, data, 1, NULL);

      index = 0;
      count = 0;

      return;
    }

    buffer[index] = bt.read();

    if (buffer[index] == '\n') {
      buffer[index] = '\0';
      execute(buffer);

      index = 0;

      return;
    }

    index++;
    count++;
  }

  count = 0;
}

// build the packet and send via serial
void write (char *command, char *args[], int count, char *comment) {
  int i;

  /*Serial.write(command);

  if (args && count) {
    for (i = 0; i < count; i++) {
      Serial.write(":");
      Serial.print(strlen(args[i]));
      Serial.write(":");
      Serial.write(args[i]);
    }
  }

  if (comment) {
    Serial.write("#");
    Serial.write(comment);
  }

  Serial.write("\n");*/

  bt.write(command);

  if (args && count) {
    for (i = 0; i < count; i++) {
      bt.write(":");
      bt.print(strlen(args[i]));
      bt.write(":");
      bt.write(args[i]);
    }
  }

  if (comment) {
    bt.write("#");
    bt.write(comment);
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

  /*Serial.println("Args:");
  Serial.println(args[0]);
  Serial.println(args[1]);
  Serial.println("Done");*/

  /*bt.println("Args:");
  bt.println(args[0]);
  bt.println(args[1]);
  bt.println("Done");*/

  sensor.isActivated = 1;
  sensor.sendPin = atoi(args[0]); //31
  sensor.receivePin = atoi(args[1]); //33

  CapacitiveSensor s = CapacitiveSensor(sensor.sendPin, sensor.receivePin);
  sensor.sensor = &s;

  sensors[sensorsSet] = sensor;
  sensorsSet = sensorsSet + 1;

  write(OK, NULL, 0, NULL);
}

void cmd_ping (char *args[], int count) {
  write(PONG, NULL, 0, NULL);
}

// parse the packet and execute the commands
void execute (char *buffer) {
  char command[3];
  char *args[MAX_ARGS];
  int count = 0;

  if (strlen(buffer) < 2) {
    char *data[2];

    data[0] = "Malformed Command";
    data[1] = buffer;
    write(ERROR, data, 2, NULL);
  } else {
    command[0] = buffer[0];
    command[1] = buffer[1];
    command[2] = '\0';

    int pos = 2;
    int length = strlen(buffer);

    while (count < MAX_ARGS && pos < length) {
      // comment
      if (buffer[pos] == '#') {
        break;
      }

      // delimiter
      else if (buffer[pos] == ':') {
        char ssize[5];
        int scount = 0;

        pos++;

        // read the length of the argument
        while (buffer[pos] != ':') {
          ssize[scount] = buffer[pos];
          scount++;
          pos++;

          if (scount == 5) {
            char *data[2];

            data[0] = "Argument Too Long";
            data[1] = buffer;

            write(ERROR, data, 2, NULL);
            cleanup(args, count);

            return;
          }
        }

        if (scount) {
          if (atoi(ssize) >= MAX_BUFFER) {
            char *data[2];

            data[0] = "Argument Too Long";
            data[1] = buffer;

            write(ERROR, data, 2, NULL);
            cleanup(args, count);

            return;
          }

          pos++;
          int i;

          ssize[scount] = '\0';

          // allocate and copy the argument now that we have the size
          args[count] = (char *) malloc(sizeof(char) * (atoi(ssize) + 1));
          for (i = pos; i < pos + atoi(ssize); i++) {
            args[count][i - pos] = buffer[i];
          }

          args[count][i - pos] = '\0';
          count++;
          pos += atoi(ssize) - 1;
        }
      } else {
        char *data[2];

        data[0] = "Invalid Argument";
        //data[1] = p("%d", count);

        write(ERROR, data, 2, NULL);

        cleanup(args, count);
        free(data[1]);

        return;
      }

      pos++;
    }

    if (strcmp(command, WATCHCAP) == 0) {
      cmd_watch_cap(args, count);
    } else if (strcmp(command, PING) == 0) {
      cmd_ping(args, count);
    } else {
      char *data[2];

      data[0] = "Unknown Command";
      data[1] = command;

      write(ERROR, data, 2, NULL);
    }

    cleanup(args, count);
  }
}

// free up any memory allocated from the packet
void cleanup (char **args, int count) {
  int i;
  for (i = 0; i < count; i++) {
    if (args[i] != NULL) {
      free(args[i]);
    }
  }
}
