import mqtt from "mqtt";

class MqttClient {
  constructor() {
    if (!MqttClient.instance) {

      this.client = mqtt.connect(process.env.MQTT_BROKER_URL, {
        reconnectPeriod: 1000
      });

      this.client.on("connect", () => {
        console.log("✅ MQTT conectado");
      });

      this.client.on("reconnect", () => {
        console.log("🔄 Reconectando ao MQTT...");
      });

      this.client.on("error", err => {
        console.error("❌ MQTT erro:", err);
      });

      MqttClient.instance = this;
    }
    return MqttClient.instance;
  }

  publish(topic, payload) {
    this.client.publish(topic, JSON.stringify(payload));
  }

  subscribe(topic, callback) {
    this.client.subscribe(topic);
    this.client.on("message", (t, msg) => {
      if (t === topic) {
        callback(JSON.parse(msg.toString()));
      }
    });
  }
}

export default new MqttClient();
