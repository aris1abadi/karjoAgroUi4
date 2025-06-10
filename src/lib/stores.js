import { writable, get } from "svelte/store";
import { persisted } from 'svelte-persisted-store'
import mqtt from "mqtt";
import { dev } from "$app/environment";
import { json } from "@sveltejs/kit";
import { transpileModule } from "typescript";


export const networkSelect = {
  MODE_OFF: 'Offline',
  MODE_LOCAL: 'Local',
  MODE_BT: 'Bluethooth',
  MODE_MQTT: 'Online'
}
//let setupMode = 0; //0 mode set task,1 mode set device,3 mode alert
export const modalMode = writable({

  SET_TASK: 0,
  SET_DEVICE: 1,
  ALERT: 2,

})


export const taskMode = {
  MODE_TEMPERATURE: 0,
  MODE_HUMIDITY: 1,
  MODE_LENGAS: 2,
  MODE_INTERMITTEN: 3,
  MODE_MIX: 4,
}

export const display = {
  MODE_KONTROL: 0,
  MODE_AKTUATOR: 1,
  MODE_SENSOR: 2,
}

export const dispMode =
{
  MODE_BAR1: 0,
  MODE_BAR2: 1,
  MODE_BAR3: 2,
  MODE_ANGKA: 3,

};

export const dispType =
{
  TYPE_INTERMITTENT: 0,
  TYPE_LENGAS: 1
};


export const msgType = {
  KONTROL: 0,
  TASK: 1,
  AKTUATOR: 2,
  SENSOR: 3,
};

export const nodeType = {
  NODE_GATEWAY: 0,
  NODE_TEMPERATURE: 1,
  NODE_HUMIDITY: 2,
  NODE_SOIL_MOISTURE: 3,
  NODE_DISTANCE: 4,
  NODE_RELAY1: 5,
  NODE_RELAY2: 6,
  NODE_RELAY3: 7,
  NODE_RELAY4: 8,
  NODE_RELAY5: 9,
  NODE_RELAY6: 10,
  NODE_RELAY7: 11,
  NODE_RELAY8: 12,
  NODE_DISPLAY: 13
}

export let flowAPersen = writable(50);
export let flowBPersen = writable(0);
export let flowCPersen = writable(0);
export let mixOutPersen = writable(0);

export const mqttClient = writable(null);
export const mqttData = writable({});

let bleConnected = false;
export let bleIsConnected = writable(false);
//export let logDisplay = writable("log console\n");
export let mqttIsConnected = writable(false);

export let networkMode = writable(networkSelect.MODE_OFF);
//export let networkMode = writable(networkSelect.MODE_LOCAL);
export let displayMode = writable(display.MODE_KONTROL);
export let isDemo = writable(false);
export let demoWait = writable(false);
export let connectionStatus = writable(false);
let connectionStatusCount = 0;

export const kontrolID = persisted('kontrolID', 'KA-E8C9')
export let networkSetup = writable({ mode: false, ssid: "", password: "", mqttBroker: "mqtt.eclipseprojects.io", mqttPort: 1883 })

export let spinnerShow = writable([false, false, false, false]);

export let intermittentList = writable([]);

export let isStarted = writable(false);
export let loginWait = writable(false)
export let aktuatorList = [{
  nodeId: "0001",
  nomerAktuator: nodeType.NODE_RELAY1,
  val: 0,
  isActive: false
}, {
  nodeId: "0001",
  nomerAktuator: nodeType.NODE_RELAY2,
  val: 0,
  isActive: false
}
]

export let sensorLengasList = [{
  nodeId: "----",
  sensorType: nodeType.NODE_SOIL_MOISTURE,
  battLevel: 100,
  rssi: 0,
  snr: 0,
  lastSeen: "",
  val: 0,
  rawVal: 0,
  isActive: false,
  isConfig: false,
  minValue: 0,
  maxValue: 0
}, {
  nodeId: "----",
  sensorType: nodeType.NODE_SOIL_MOISTURE,
  battLevel: 100,
  rssi: 0,
  snr: 0,
  val: 0,
  rawVal: 0,
  lastSeen: "",
  isActive: false,
  isConfig: false,
  minValue: 0,
  maxValue: 0
}];

export let sensorTemperatureList = [{
  nodeId: "0002",
  sensorType: nodeType.NODE_TEMPERATURE,
  battLevel: 100,
  rssi: 0,
  snr: 0,
  val: 0,
  rawVal: 0,
  lastSeen: "",
  isActive: false,
  isConfig: false,
  minValue: 0,
  maxValue: 0
}, {
  nodeId: "0002",
  sensorType: nodeType.NODE_TEMPERATURE,
  rssi: 0,
  snr: 0,
  val: 0,
  rawVal: 0,
  lastSeen: "",
  isActive: false,
  isConfig: false,
  minValue: 0,
  maxValue: 0
}];
export let sensorHumidityList = [{
  nodeId: "0002",
  sensorType: nodeType.NODE_HUMIDITY,
  battLevel: 100,
  rssi: 0,
  snr: 0,
  val: 0,
  rawVal: 0,
  lastSeen: "",
  isActive: false,
  isConfig: false,
  minValue: 0,
  maxValue: 0
}, {
  nodeId: "0002",
  sensorType: nodeType.NODE_HUMIDITY,
  battLevel: 100,
  rssi: 0,
  snr: 0,
  val: 0,
  rawVal: 0,
  lastSeen: "",
  isActive: false,
  isConfig: false,
  minValue: 0,
  maxValue: 0
}];

export let sensorIntermittentList = writable([])
/*
export let sensorIntermittentList =[{
  nodeId: "----",
  sensorType: nodeType.NODE_DISTANCE,
  battLevel: 0,
  rssi:0,
  snr:0,
  val: 0,
  rawVal:0,
  lastSeen:0,
  isActive: false,
  isConfig: false,
  minValue : 0,
  maxValue:0
}, {
  nodeId: "----",
  sensorType: nodeType.NODE_DISTANCE,
  battLevel: 0,
  rssi:0,
  snr:0,
  val: 0,
  rawVal:0,
  lastSeen:0,
  isActive: false,
  isConfig: false,
  minValue : 0,
  maxValue:0

}];
*/

export let waterLevel = 0;
export let myTask = writable([{
  nama: 'Lengas',
  aktuator1: 1,
  aktuator2: 2,
  aktuator1Val: 0,
  aktuator2Val: 0,
  aktuatorMixA: 3,
  aktuatorMixB: 4,
  aktuatorMixC: 5,
  aktuatorMixOut: 6,
  aktuatorAduk: 7,
  sensorUse: 1,
  sensorVal: 0,
  flowSensorA: 1,
  flowSensorB: 2,
  flowSensorC: 3,
  flowMixOut: 4,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  mode: taskMode.MODE_LENGAS,//task mode
  batasBawah: -1,
  batasAtas: 5,
  timer1: '0,0,0',//format HH,MM,durasi
  timer2: '0,0,0',//format HH:MM,durasi
  timer3: '0,0,0',//format HH:MM,durasi
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air',
  lastSeen: "",
  useDisplay: true,
  displayMode: dispMode.MODE_BAR2,
  enable: 0,
}, {
  nama: 'Intermitten',
  aktuator1: 1,
  aktuator2: 2,
  aktuator1Val: 0,
  aktuator2Val: 0,
  aktuatorMixA: 3,
  aktuatorMixB: 4,
  aktuatorMixC: 5,
  aktuatorMixOut: 6,
  aktuatorAduk: 7,
  sensorUse: 1,
  sensorVal: 0,
  flowSensorA: 1,
  flowSensorB: 2,
  flowSensorC: 3,
  flowMixOut: 4,
  targetMixA: 0,
  targetMixB: 0,
  targetMixC: 0,
  mixingTarget: 0,
  mode: taskMode.MODE_INTERMITTEN,//task mode
  batasBawah: -1,
  batasAtas: 5,
  timer1: '0,0,0',//format HH,MM,durasi
  timer2: '0,0,0',//format HH:MM,durasi
  timer3: '0,0,0',//format HH:MM,durasi
  mixAnama: 'Pupuk1',
  mixBnama: 'Pupuk2',
  mixCnama: 'Air',
  lastSeen: "",
  useDisplay: false,
  displayMode: dispMode.MODE_BAR2,
  enable: 0,
}]);



const subMqtt = "abadinet-out/" + get(kontrolID) + "/#";
const pubMqtt = "abadinet-in/" + get(kontrolID) + "/";
let clientId = "CL" + Math.random().toString(16).substr(2, 4).toUpperCase();
//const host = 'ws://abadinet.my.id:2020'
//const host = 'wss://node-red.balingtansmart.my.id/ws'
//const host =  'ws://'+ get(brokerUseStore) + '/mqtt:' + get(brokerPortUseStore);
const brokerUrl = "wss://mqtt.eclipseprojects.io/mqtt:443";
//const brokerUrl = "ws://mqtt.eclipseprojects.io/mqtt:80";

let lastMsg = "";
let myTaskNow = myTask;
let mqttConnected = false
let client = null;

function cekConnectionTimeout() {
  if (connectionStatus) {
    if (++connectionStatusCount > 3) {
      connectionStatus.set(false);
      connectionStatusCount = 0;
    }
  }

}


const options = {
  keepalive: 30,
  clientId,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
};

const dtSub = myTask.subscribe((data) => {
  myTaskNow = data; // Panggil fungsi untuk memperbarui sensorData
});

const mqttSub = mqttIsConnected.subscribe((data) => {
  mqttConnected = data; // Panggil fungsi untuk memperbarui sensorData
});

let error = null;    // Untuk menangani error jika EventSource tidak didukung


// Fungsi untuk menginisialisasi MQTT Client (hanya sekali)
// @ts-ignore
export function initMqtt(sts= false,loginPass) {
  client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    mqttConnected = true
    mqttIsConnected.set(true)
    console.log("Try connect to network");
    client.subscribe(subMqtt, { qos: 0 });
    let pubStatus = pubMqtt + "kontrol/0/status";
    console.log("Online");
    let getmyTask = pubMqtt + "0/0/getAllStatus";
    mqttClient.set(client); // Set mqttClient di davalue=""lam store
    networkMode.set(networkSelect.MODE_MQTT)
    //isStarted.set(true)
    if (bleConnected) {
      bleConnectionToggle();
    }
    setInterval(() => {
      if (connectionStatus) {
        if (++connectionStatusCount > 3) {
          connectionStatus.set(false);
          connectionStatusCount = 0;
        }
      }
    }, 30000);

    //cekClientId();

    client.publish(pubStatus, clientId, { qos: 0, retain: false });

    if(sts){//login jika true
      kirimMsg(msgType.KONTROL, 0, 'loginRequest', loginPass);
    }
    //client.publish(getmyTask, "1", { qos: 0, retain: false });
    //kirimMsg("kontrol", 0, "getAllTask", "1")
  });

  client.on("message", (topic, payload) => {
    cekMqttMsg(topic, payload.toString())
    mqttData.update((data) => ({
      ...data,
      topic,
      msg: payload.toString(), // Update data berdasarkan topik
    }));
  });

  client.on('close', () => {
    mqttConnected = false;
    mqttIsConnected.set(false)
    console.log('Disconnected from network');
    networkMode.set(networkSelect.MODE_OFF)
    isStarted.set(false)
  });


}

export function mqttDisconnect() {
  if (mqttConnected && client) {
    client.end();
    mqttConnected = false;
  }
}

export function getLocalStatus() {
  const net = get(networkMode);
  if (net === networkSelect.MODE_LOCAL) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/cmd", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        //console.log("Response from kontrol:", xhttp.responseText);
        let resp = xhttp.responseText.split('@');
        cekMqttMsg(resp[0], resp[1]);
      }
    };

    // Kirim data dengan dua parameter
    var data = "topic=abadinet-in/KA-E8C9/0/1/getAllStatus&msg=1"
    xhttp.send(data);
  }

}

export function kirimMsg(type, num, cmd, msg) {

  const ms = pubMqtt + type + "/" + num + "/" + cmd;
  const bleMsg = ms + ";" + msg + ";";
  const net = get(networkMode);
  //console.log(bleMsg);

  if (net === networkSelect.MODE_MQTT) {

    mqttClient.subscribe((client) => {
      if (client) {
        client.publish(ms, msg, { qos: 0, retain: false });
        return true
      } else {
        console.error("MQTT client is not connected");
        alert("!!! Tidak terhubung ke Server !!!")
        return false
      }
    });
  } else if (net === networkSelect.MODE_BT) {
    if (bleConnected) {
      nusSendString(bleMsg)
      return true

    } else {
      alert("!!! Tidak terhubung ke Bluethoooth !!!")
      return false
    }
  } else if (net === networkSelect.MODE_LOCAL) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/cmd", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //text/html
    //xhttp.setRequestHeader("Content-Type", "text/html");

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        //console.log("Response from kontrol:", xhttp.responseText);
        let resp = xhttp.responseText.split('@');
        cekMqttMsg(resp[0], resp[1]);
        return true;
      } else {
        console.error("Tidak dapat terhubung ke server, status:", xhttp.status);
        return false
      }

    };


    // Menangani kesalahan koneksi
    xhttp.onerror = function () {
      console.error("Terjadi kesalahan koneksi. Tidak dapat terhubung ke server.");
      return false
    };

    // Kirim data dengan dua parameter
    var data = "topic=" + ms + "&msg=" + msg;
    xhttp.send(data);
    //console.log("kirim via local " + ms + " msg:" + msg)
    return true
  } else {
    alert("!!! Tidak terhubung ke Kontroller !!!")
    return false
  }
}

function unixToLocalString(timestamp) {
  const dateUTC = new Date(timestamp * 1000);

  // Format tanggal dan waktu saja

  return dateUTC.toISOString()
    .replace('T', ' ')
    .replace(/\..+/, '');
}

function debugESP32Time(unixTimestamp) {
  const dateUTC = new Date(unixTimestamp * 1000);
  const dateLocal = new Date(unixTimestamp * 1000 + (7 * 3600 * 1000));

  console.log('UTC Time:', dateUTC.toISOString());
  console.log('WIB Time (Manual):', dateLocal.toISOString());
  console.log('Browser Local Time:', new Date().toString());
}

// Hasil: "29-04-2025 14:00:00" (WIB)

function cekMqttMsg(topic, msg_payload) {

  const topicMqtt = topic ? topic.split("/") : [];
  if (topicMqtt.length > 0) {
    const serverId = topicMqtt[1];

    const typeTask = parseInt(topicMqtt[2]);
    const numberTask = topicMqtt[3];
    const msg_cmd = topicMqtt[4];

    //update status connectionn
    connectionStatus.set(true);
    connectionStatusCount = 0;
    //console.log("connected " + connectionStatus)

    if (typeTask === msgType.KONTROL) {
      if (msg_cmd === "infoAllTask") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          const newArray = JSON.parse(msg_payload).task;
          for (let i = 0; i < newArray.length; i++) {
            if( newArray[i].lastSeen === 0){
              newArray[i].lastSeen = '-';
            }else{
              newArray[i].lastSeen = unixToLocalString(newArray[i].lastSeen);
            }
            
            //newArray[i].lastSeen = newArray[i].lastSeen.toLocaleString('id-ID')

          }
          myTask.set(newArray); // Update store sekali setelah loop selesai
          //console.log(newArray)
          isStarted.set(true);
          loginWait.set(false)

        }
      } else if (msg_cmd === "infoAllNode") {


      } else if (msg_cmd === "InfoAllAktuator") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          const newAktuator = JSON.parse(msg_payload).aktuator;
          if (newAktuator.length > 0) {
            aktuatorList = newAktuator

          }
          //console.log(aktuatorList)
        }
      } else if (msg_cmd === "InfoAllTemperatureSensor") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          const newTemperatureSensor = JSON.parse(msg_payload).TemperatureSensor;
          if (newTemperatureSensor.length > 0) {
            sensorTemperatureList = newTemperatureSensor
          }
        }

      } else if (msg_cmd === "InfoAllHumiditySensor") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          const newHumiditySensor = JSON.parse(msg_payload).HumiditySensor;
          if (newHumiditySensor.length > 0) {
            sensorHumidityList = newHumiditySensor;

          }
          //console.log(sensorHumidityList)
        }
      } else if (msg_cmd === "InfoAllSoilSensor") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          const newSoilSensor = JSON.parse(msg_payload).SoilSensor;
          if (newSoilSensor.length > 0) {
            sensorLengasList = newSoilSensor;
          }
          //console.log(sensorLengasList)
        }
      } else if (msg_cmd === "InfoAllDistanceSensor") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          const newDistanceSensor = JSON.parse(msg_payload).DistanceSensor;
          if (newDistanceSensor.length > 0) {
            sensorIntermittentList.set(newDistanceSensor);


          }
          //console.log(sensorIntermittentList)
        }
      } else if (msg_cmd === "getNetwork") {
        const net = JSON.parse(msg_payload)
        if (net.mode === 0) {
          //networkSetup.mode = false
        } else {
          //networkSetup.mode = true
        }        

        //networkSetup.ssid = net.ssid
        //networkSetup.password = net.password
        //networkSetup.mqttBroker = net.mqttBroker
        //networkSetup.mqttPort = net.mqttPort
        //console.log(JSON.stringify(networkSetup))
      } else if (msg_cmd === 'demoMode') {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          demoWait.set(false);
          if (parseInt(msg_payload) === 1) {
            isDemo.set(true)
          } else {
            isDemo.set(false)
          }

        }
      } else if (msg_cmd === "infoExtDisplay") {
        //format info display
        let exkDisplay = msg_payload.split(',');


      }else if(msg_cmd === 'loginResponse'){
        ////format response login_remoteId_OK
        //response demo/tes login_demoRemoteId_OK
        if(msg_payload === "login_0000_OK"){
          kirimMsg(msgType.KONTROL,0,"getAllStatus",'1',)
        }
      }
    } else if (typeTask === msgType.TASK) {
      if (msg_cmd === "infoTask") {
        //console.log("mqtt msg: " + msg_payload)
        //msg  {"enable":0,"aktuator1":1,"aktuator2":2,"nodeSensor":1,"batasBawah":31,"batasAtas":81,"mode":2,"nama":"Lengas","sensorVal":80}

        const jsonData = JSON.parse(msg_payload); // Parse JSON 
        //console.log("mqtt msg: " + JSON.stringify(jsonData))  
        //console.log('LastSeen: ' + jsonData.lastSeen);
        //debugESP32Time(jsonData.lastSeen)
        //const lastSeenNow = unixToLocalString(jsonData.lastSeen);
        const lastSeenNow = unixToLocalString(jsonData.lastSeen)

        myTask.update(task => {
          // Ubah nilai `a` pada elemen pertama
          task[numberTask] = { ...task[numberTask], enable: jsonData.enable, aktuator1: jsonData.aktuator1, aktuator2: jsonData.aktuator2, sensorUse: jsonData.sensorUse, sensorVal: jsonData.sensorVal, batasBawah: jsonData.batasBawah, batasAtas: jsonData.batasAtas, mode: jsonData.mode, nama: jsonData.nama, lastSeen: lastSeenNow }; // Ganti nilai a
          return task; // Kembalikan array yang telah dimodifikasi
        });


      } else if (msg_cmd === "enable") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], enable: parseInt(msg_payload) };
          return task;
        });
        spinnerShow.update(spin => {
          spin[numberTask] = false;
          return spin;
        });

      } else if (msg_cmd === "aktuator1") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], aktuator1: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "aktuator2") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], aktuator2: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "jadwal") {
        // myTaskNow[numberTask].aktuatorUse2 = parseInt(msg_payload);
      } else if (msg_cmd === "sensorUse") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], nodeSensor: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "batasBawah") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], batasBawah: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "batasAtas") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], batasAtas: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "targetMixA") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], targetMixA: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "targetMixB") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], targetMixB: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "targetMixC") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], targetMixC: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "mixingTarget") {
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], mixingTarget: parseInt(msg_payload) };
          return task;
        });
      } else if (msg_cmd === "sensorVal") {
        /*
        doc["NodeId"] = msg.senderNodeId;
        doc["payload"] = msg.payload;
        doc["sensorVal"] = newValue;
        doc["type"]=msg.type;
        doc["rssi"] = rssi;
        doc["snr"] = snr;
        doc["battLevel"] = nodes[nodeIndex].battLevel;
        doc["lastSeen"] = nodes[nodeIndex].lastSeen;

        */
        const newMsg = JSON.parse(msg_payload)
        const sekarang = new Date();
        const n_sensor = newMsg.nomerSensor
        //update sensor
        if (newMsg.type === nodeType.NODE_DISTANCE) {

          sensorIntermittentList.update(sensor => {
            sensor[n_sensor] = { ...sensor[n_sensor], battLevel: newMsg.battLevel, rssi: newMsg.rssi, snr: newMsg.snr, val: newMsg.sensorVal, rawVal: newMsg.payload, minValue: newMsg.minValue, maxValue: newMsg.maxValue, isActive: newMsg.isActive, lastSeen: unixToLocalString(newMsg.lastSeen) };
            return sensor;
          });


        } else if (newMsg.type == nodeType.NODE_SOIL_MOISTURE) {
          for (let i = 0; i < sensorLengasList.length; i++) {
            if (newMsg.nodeId == sensorLengasList[i].nodeId) {
              sensorLengasList[i].battLevel = newMsg.battLevel
              sensorLengasList[i].rssi = newMsg.rssi
              sensorLengasList[i].snr = newMsg.snr
              sensorLengasList[i].lastSeen = unixToLocalString(newMsg.lastSeen)
              sensorLengasList[i].isActive = true;
              sensorLengasList[i].val = newMsg.sensorVal
              sensorLengasList[i].rawVal = newMsg.payload
              sensorLengasList[i].minValue = newMsg.minValue
              sensorLengasList[i].maxValue = newMsg.maxValue
            }
          }
        } else if (newMsg.type == nodeType.NODE_TEMPERATURE) {
          for (let i = 0; i < sensorTemperatureList.length; i++) {
            if (newMsg.nodeId == sensorTemperatureList[i].nodeId) {
              sensorTemperatureList[i].battLevel = newMsg.battLevel
              sensorTemperatureList[i].rssi = newMsg.rssi
              sensorTemperatureList[i].snr = newMsg.snr
              sensorTemperatureList[i].lastSeen = unixToLocalString(newMsg.lastSeen)
              sensorTemperatureList[i].isActive = true;
              sensorTemperatureList[i].val = newMsg.sensorVal
              sensorTemperatureList[i].rawVal = newMsg.payload
              sensorTemperatureList[i].minValue = newMsg.minValue
              sensorTemperatureList[i].maxValue = newMsg.maxValue
            }
          }
        } else if (newMsg.type == nodeType.NODE_HUMIDITY) {
          for (let i = 0; i < sensorHumidityList.length; i++) {
            if (newMsg.nodeId == sensorHumidityList[i].nodeId) {
              sensorHumidityList[i].battLevel = newMsg.battLevel
              sensorHumidityList[i].rssi = newMsg.rssi
              sensorHumidityList[i].snr = newMsg.snr
              sensorHumidityList[i].lastSeen = unixToLocalString(newMsg.lastSeen)
              sensorHumidityList[i].isActive = true;
              sensorHumidityList[i].val = newMsg.sensorVal
              sensorHumidityList[i].rawVal = newMsg.payload
              sensorHumidityList[i].minValue = newMsg.minValue
              sensorHumidityList[i].maxValue = newMsg.maxValue
            }
          }
        }
        myTask.update(task => {
          task[numberTask] = { ...task[numberTask], sensorVal: parseInt(newMsg.sensorVal), lastSeen: unixToLocalString(newMsg.lastSeen) };
          return task;
        });
      }

    }

  }
}



//bluethoot
const bleNusServiceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const bleNusCharRXUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const bleNusCharTXUUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const MTU = 20;

var bleDevice;
var bleServer;
var nusService;
var rxCharacteristic;
var txCharacteristic;
let sendCount = 0;
let btBuff = "";


export function loginStart(pass="demoPass"){
  let formatedPass = "0000," + pass + ',-;'
  if(mqttConnected){
    
    kirimMsg(msgType.KONTROL, 0, 'loginRequest', formatedPass);
  }else{

    initMqtt(true,formatedPass)
  }
}


export function mqttConnectionToggle() {
  if (mqttConnected) {
    mqttDisconnect()
    console.log("disconect mqtt")
  } else {
    console.log("connect mqtt")
    initMqtt()

  }
}

export function bleConnectionToggle() {
  if (bleConnected) {
    bleDisconnect();
  } else {
    bleConnect();
  }
}

async function bleConnect() {
  if (!navigator.bluetooth) {
    ////logDisplay += "WebBluetooth API is not available.\r\n";
    return;
  }
  ////logDisplay += "Requesting Bluetooth Device...\n";
  navigator.bluetooth
    .requestDevice({
      //filters: [{services: []}]
      optionalServices: [bleNusServiceUUID],
      acceptAllDevices: true,
    })
    .then((device) => {
      bleDevice = device;
      //logDisplay += "Found " + device.name;
      //logDisplay += "Connecting to GATT Server...\n";
      bleDevice.addEventListener(
        "gattserverdisconnected",
        onDisconnected,
      );
      return device.gatt.connect();
    })
    .then((server) => {
      //logDisplay += "Locate NUS service\n";
      return server.getPrimaryService(bleNusServiceUUID);
    })
    .then((service) => {
      nusService = service;
      //logDisplay += "Found NUS service: " + service.uuid;
    })
    .then(() => {
      //logDisplay += "Locate RX characteristic\n";
      return nusService.getCharacteristic(bleNusCharRXUUID);
    })
    .then((characteristic) => {
      rxCharacteristic = characteristic;
      //logDisplay += "Found RX characteristic\n";
    })
    .then(() => {
      //logDisplay += "Locate TX characteristic\n";
      return nusService.getCharacteristic(bleNusCharTXUUID);
    })
    .then((characteristic) => {
      txCharacteristic = characteristic;
      //logDisplay += "Found TX characteristic\n";
    })
    .then(() => {
      //logDisplay += "Enable notifications\n";
      return txCharacteristic.startNotifications();
    })
    .then(() => {
      //logDisplay += "Notifications started\n";
      txCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleNotifications,
      );
      bleConnected = true;
      bleIsConnected.set(true)
      networkMode.set(networkSelect.MODE_BT)
      //simpan deviceID

      isStarted.set(true)
      ////window.term_.io.println('\r\n' + bleDevice.name + ' Connected.\n'
      tes();
      //setConnButtonState(true);
    })
    .catch((error) => {
      //logDisplay += error;
      //window.term_.io.println('' + error);
      if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
      }
    });
}

export function bleDisconnect() {
  if (!bleDevice) {
    //logDisplay += "No Bluetooth Device connected...\n";
    return;
  }
  //logDisplay += "Disconnecting from Bluetooth Device...\n";
  if (bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect();
    bleConnected = false;
    bleIsConnected.set(false)
    networkMode.set(networkSelect.MODE_OFF)
    isStarted.set(false)
    //setConnButtonState(false);
    //logDisplay +=
    "Bluetooth Device connected: " + bleDevice.gatt.connected;
  } else {
    //logDisplay += "> Bluetooth Device is already disconnected\n";
  }
}

function onDisconnected() {
  bleConnected = false;
  bleIsConnected.set(false)
  networkMode.set(networkSelect.MODE_OFF)
  isStarted.set(false)
  //logDisplay += "\r\n" + bleDevice.name + " Disconnected.";
}

function handleNotifications(event) {
  //logDisplay += "btMsg:\n";
  let value = event.target.value;
  // Convert raw data bytes to character values and use these to
  // construct a string.
  let chr = "";
  let endMsg = false;
  for (let i = 0; i < value.byteLength; i++) {
    chr = String.fromCharCode(value.getUint8(i));
    btBuff += chr;
    if (chr == "\n") {
      endMsg = true;

      break;
    }
  }
  if (endMsg) {
    if (btBuff.length > 20) {
      //logDisplay += btBuff;

      let btMsgSplit = btBuff.split('@')
      const topic = btMsgSplit[0]
      const msg = btMsgSplit[1]

      const topicSplit = topic.split('-')
      if (topicSplit[0] === 'abadinet') {
        cekMqttMsg(topic, msg)

      } else {
        debugMsgReceive(btBuff)
      }
    } else {
      debugMsgReceive(btBuff)
    }
    btBuff = "";
  }
}

function debugMsgReceive(msg) {
  console.log(msg)
}

function nusSendString(s) {
  if (bleDevice && bleDevice.gatt.connected) {
    ////logDisplay += 'send: ' + s;
    s += "\n";
    let val_arr = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) {
      let val = s[i].charCodeAt(0);
      val_arr[i] = val;
    }
    sendNextChunk(val_arr);
  } else {
    //logDisplay += "Not connected to a device yet.";
  }
}

function sendNextChunk(a) {
  let chunk = a.slice(0, MTU);
  rxCharacteristic.writeValue(chunk).then(function () {
    if (a.length > MTU) {
      sendNextChunk(a.slice(MTU));
    }
  });
}

export function tes() {
  let st = "abadinet-in/AB5578/kontrol/0/getAllTask;1;";
  nusSendString(st);
  sendCount++;
}
/*

export function kirimMsg(type, num, cmd, msg) {
    let ms = pubMqtt + type + '/' + num + '/' + cmd
    const bleMsg = ms + ';' + msg + '\n'

    mqttClient.publish(ms, msg, { qos: 0, retain: false })

}
    */
