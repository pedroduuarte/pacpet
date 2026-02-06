#include <stdio.h>
#include <string.h>

/* FreeRTOS */
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

/* ESP Core */
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"

/* MQTT & JSON */
#include "mqtt_client.h"
#include "cJSON.h"

/* Hardware */
#include "driver/ledc.h"
#include "HX711.h"

/* ================= CONFIG ================= */
#define WIFI_SSID       "natto.posto"
#define WIFI_PASS       "postonatto"

#define MQTT_BROKER_URL "mqtt://broker.hivemq.com"
#define TOPIC_DATA       "pacpet/feeding/data"
#define TOPIC_COMMAND   "pacpet/command"

#define PIN_DT    27
#define PIN_SCK   26
#define SERVO_PIN 14

#define SERVO_FREQ     50
#define LEDC_TIMER     LEDC_TIMER_0
#define LEDC_MODE      LEDC_LOW_SPEED_MODE
#define LEDC_CHANNEL   LEDC_CHANNEL_0
#define LEDC_RES       LEDC_TIMER_13_BIT

#define FEEDING_TIMEOUT_MS 50000  // 50 segundos

// Variável com volatile para garantir thread-safety no estado
volatile const char* feeding_status = "success";

// 🔁 CONFIGURAÇÃO DO SEU DISPENSER
#define SERVO_FECHADO 180  
#define SERVO_ABERTO    0  

/* ================= ESTADO GLOBAL ================= */
volatile float peso_atual = 0.0;
volatile float peso_alvo_gramas = 0.0;
volatile bool alimentando = false;
volatile bool feeding_finalizado = false;
volatile int tempo_aberto_ms = 0;
volatile TickType_t inicio_tick;
volatile bool wifi_conectado = false;

const char* feeding_type = "manual";
char current_command_id[64];

HX711 scale;
float fator_calibracao = 678.91; 
esp_mqtt_client_handle_t mqtt_client;

/* ================= SERVO ================= */
uint32_t angle_to_duty(int angle) {
    return 410 + ((820 - 410) * angle) / 180;
}

void servo_move(int angle) {
    ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, angle_to_duty(angle));
    ledc_update_duty(LEDC_MODE, LEDC_CHANNEL);
}

void servo_init() {
    ledc_timer_config_t timer = {
        .speed_mode = LEDC_MODE,
        .duty_resolution = LEDC_RES,
        .timer_num = LEDC_TIMER,
        .freq_hz = SERVO_FREQ,
        .clk_cfg = LEDC_AUTO_CLK
    };
    ledc_timer_config(&timer);

    ledc_channel_config_t channel = {
        .gpio_num = SERVO_PIN,
        .speed_mode = LEDC_MODE,
        .channel = LEDC_CHANNEL,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER,
        .duty = angle_to_duty(SERVO_FECHADO),
        .hpoint = 0
    };
    ledc_channel_config(&channel);
}

/* ================= MQTT HANDLER ================= */
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    esp_mqtt_event_handle_t event = (esp_mqtt_event_handle_t)event_data;

    switch ((esp_mqtt_event_id_t)event_id) {
        case MQTT_EVENT_CONNECTED:
            Serial.println("\n>>> MQTT Conectado!");
            esp_mqtt_client_subscribe(mqtt_client, TOPIC_COMMAND, 0);
            break;

        case MQTT_EVENT_DATA:
            if (strncmp(event->topic, TOPIC_COMMAND, event->topic_len) == 0) {
                char msg[128];
                int len = event->data_len > 127 ? 127 : event->data_len;
                memcpy(msg, event->data, len);
                msg[len] = '\0';

                cJSON *json = cJSON_Parse(msg);
                if (!json) break;
                // 🔥 SE VIER COMO STRING, parse de novo
                if (cJSON_IsString(json)) {
                    cJSON *inner = cJSON_Parse(json->valuestring);
                    cJSON_Delete(json);
                    json = inner;
                }

                if (!json) {
                    Serial.println("❌ JSON inválido após parse duplo");
                    break;
                }
                Serial.println("Payload recebido:");
                Serial.println(msg);

                cJSON *cmdId = cJSON_GetObjectItem(json, "commandId");
                if (cmdId && cJSON_IsString(cmdId)) {
                    strncpy(current_command_id, cmdId->valuestring, sizeof(current_command_id) - 1);
                    current_command_id[sizeof(current_command_id) - 1] = '\0';
                } else {
                    Serial.println("⚠️ Comando sem commandId ignorado");
                    cJSON_Delete(json);
                    break;
                }

                cJSON *cmd = cJSON_GetObjectItem(json, "command");
                cJSON *wg  = cJSON_GetObjectItem(json, "weightGrams");

                if (cmd && strcmp(cmd->valuestring, "FEED") == 0 && wg) {
                    peso_alvo_gramas = (float)wg->valuedouble;
                    alimentando = true;
                    feeding_finalizado = false;
                    feeding_status = "success";
                    inicio_tick = xTaskGetTickCount();

                    Serial.printf(">>> Comando MANUAL: Alvo %.2f g\n", peso_alvo_gramas);
                }
                cJSON_Delete(json);
            }
            break;
        default: break;
    }
}

void mqtt_init() {
    esp_mqtt_client_config_t mqtt_cfg = {};
    mqtt_cfg.broker.address.uri = MQTT_BROKER_URL;
    mqtt_cfg.broker.address.port = 1883;

    mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(mqtt_client, (esp_mqtt_event_id_t)ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(mqtt_client);
}

/* ================= WIFI ================= */
static void wifi_event_handler(void *arg, esp_event_base_t base, int32_t event_id, void *event_data) {
    if (event_id == WIFI_EVENT_STA_START) esp_wifi_connect();
    else if (event_id == WIFI_EVENT_STA_DISCONNECTED) {
        wifi_conectado = false;
        esp_wifi_connect();
    } else if (event_id == IP_EVENT_STA_GOT_IP) {
        wifi_conectado = true;
    }
}

void wifi_init() {
    esp_netif_init();
    esp_event_loop_create_default();
    esp_netif_create_default_wifi_sta();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);
    esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL);
    esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL);
    
    wifi_config_t wifi_config = {};
    strcpy((char*)wifi_config.sta.ssid, WIFI_SSID);
    strcpy((char*)wifi_config.sta.password, WIFI_PASS);
    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
    esp_wifi_start();
}

/* ================= TASKS ================= */
void task_scale(void *pvParameters) {
    while (1) {
        if (scale.is_ready()) {
            peso_atual = scale.get_units(5);
            Serial.printf("Peso: %.2f g\n", peso_atual);
        }
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

void task_feeding_logic(void *pvParameters) {
    while (1) {
        if (alimentando) {
            TickType_t agora = xTaskGetTickCount();
            // CORREÇÃO: uint32_t (era unit32_t)
            uint32_t elapsed_ms = (agora - inicio_tick) * portTICK_PERIOD_MS;

            // timeout de segurança
            if (elapsed_ms >= FEEDING_TIMEOUT_MS) {
                Serial.println("TIMEOUT! Alimentação excedeu 50s");

                alimentando = false;
                feeding_finalizado = true;
                feeding_status = "error";
                tempo_aberto_ms = elapsed_ms;
                continue;
            }
            // Se o peso atual for menor que o alvo, libera um pulso de ração
            if (peso_atual < peso_alvo_gramas) {
                
                Serial.println(">>> Pulso de ração: ABRINDO...");
                servo_move(SERVO_ABERTO);
                vTaskDelay(pdMS_TO_TICKS(150)); // Tempo bocal aberto
                
                servo_move(SERVO_FECHADO);
                Serial.println(">>> FECHADO. Aguardando ração descer pelo cano (1.5s)...");

                // DELAY DE 1.5s: Tempo para a ração cair no pote e a balança estabilizar
                vTaskDelay(pdMS_TO_TICKS(1500)); 

            } else {
                // Peso atingido ou ultrapassado
                tempo_aberto_ms = (xTaskGetTickCount() - inicio_tick) * portTICK_PERIOD_MS;
                alimentando = false;
                feeding_finalizado = true;
                feeding_status = "success";

                Serial.printf(">>> ALVO ATINGIDO! Final: %.2f g\n", peso_atual);
            }
        }
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

void task_mqtt_publisher(void *pvParameters) {
    while (1) {
        if (feeding_finalizado) {
            feeding_finalizado = false;
            
            cJSON *root = cJSON_CreateObject();
            cJSON_AddStringToObject(root, "commandId", current_command_id);
            cJSON_AddNumberToObject(root, "weightGrams", peso_atual);
            cJSON_AddNumberToObject(root, "openTimeMs", tempo_aberto_ms);
            cJSON_AddStringToObject(root, "type", feeding_type);
            // CORREÇÃO: Cast para (const char*) para evitar erro com volatile
            cJSON_AddStringToObject(root, "status", (const char*)feeding_status);
            char *json = cJSON_PrintUnformatted(root);

            esp_mqtt_client_publish(mqtt_client, TOPIC_DATA, json, 0, 1, 0);
            Serial.println(">>> Relatório enviado para a API");

            free(json);
            cJSON_Delete(root);
        }
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

/* ================= MAIN ================= */
void setup() {
    Serial.begin(115200);
    vTaskDelay(pdMS_TO_TICKS(1000));
    Serial.println("\n\n>>> PACPET INICIANDO...");

    nvs_flash_init();
    wifi_init();
    servo_init();
    servo_move(SERVO_FECHADO);

    scale.begin(PIN_DT, PIN_SCK);
    scale.set_scale(fator_calibracao);
    scale.tare();

    while (!wifi_conectado) {
        Serial.print(".");
        vTaskDelay(pdMS_TO_TICKS(1000));
    }

    mqtt_init();

    xTaskCreate(task_scale, "scale", 4096, NULL, 5, NULL);
    xTaskCreate(task_feeding_logic, "feed_logic", 4096, NULL, 6, NULL);
    xTaskCreate(task_mqtt_publisher, "mqtt_pub", 8192, NULL, 4, NULL);
    
    Serial.println("\n>>> SISTEMA PRONTO.");
}

void loop() {
    // Loop vazio, o trabalho é feito pelas Tasks
    vTaskDelay(pdMS_TO_TICKS(1000));
}