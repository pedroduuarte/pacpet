# PacPet

Comedouro automático para pets com controle por frontend, API REST, comunicação MQTT e um dispositivo ESP32. O sistema permite cadastrar usuários, solicitar uma alimentação manual e acompanhar o histórico e o status das porções liberadas.

## Como funciona

```text
Frontend -> API -> MQTT (pacpet/command) -> ESP32
                                      ESP32 -> MQTT (pacpet/feeding/data) -> API -> MongoDB
```

Ao solicitar uma porção, a API cria um comando com status `pending` e publica o alvo em MQTT. O ESP32 abre o servo em pulsos até atingir o peso informado na célula de carga. Em seguida, publica o resultado e a API atualiza o registro.

## Tecnologias

- **Frontend:** React, React Router, Vite e Recharts
- **API:** Node.js, Express, Mongoose, JWT e bcrypt
- **Persistência:** MongoDB
- **Mensageria:** MQTT
- **Hardware:** ESP32, servo motor e célula de carga HX711

## Requisitos

- Node.js 18 ou superior
- MongoDB local ou hospedado
- Broker MQTT acessível pela API e pelo ESP32
- Arduino IDE ou PlatformIO com suporte ao ESP32, `HX711` e `cJSON`

## Configuração e execução

### API

```bash
cd api-pacpet
npm install
```

Crie `api-pacpet/.env`:

```env
MONGO_URI=mongodb://localhost:27017/pacpet
PORT=3000
MQTT_BROKER_URL=mqtt://broker.hivemq.com
JWT_SECRET=troque-por-um-segredo-forte
```

Inicie o servidor:

```bash
npm start
```

A API ficará disponível em `http://localhost:3000`. O comando `npm run dev` também inicia o servidor atualmente.

### Frontend principal

```bash
cd front-pacpet
npm install
npm run dev
```

O Vite exibirá a URL local, normalmente `http://localhost:5173`. A URL da API está definida em `front-pacpet/comedouro-automatico/src/api/index.js` e, por padrão, aponta para `http://localhost:3000`.

O diretório `front-pacpet/comedouro-automatico` contém um segundo projeto Vite independente, com seus próprios scripts:

```bash
cd front-pacpet/comedouro-automatico
npm install
npm run dev
```

### ESP32

1. Abra `firmware/esp32/pacpet_firmware.cpp` na Arduino IDE ou importe o código no ambiente de desenvolvimento do ESP32.
2. Altere `WIFI_SSID` e `WIFI_PASS` para a rede do dispositivo.
3. Confira `MQTT_BROKER_URL` e os pinos do servo e do HX711.
4. Compile e grave o firmware no ESP32.
5. Abra o monitor serial em `115200` baud para acompanhar a conexão e as alimentações.

As credenciais Wi-Fi estão atualmente no código-fonte. Não use os valores versionados em produção; substitua-os antes de gravar o firmware.

## API

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/auth/register` | Cadastra usuário, pet, e-mail e senha |
| `POST` | `/auth/login` | Autentica e retorna um JWT válido por 7 dias |

Exemplo de cadastro:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","petName":"Luna","email":"ana@example.com","password":"senha-forte"}'
```

### Alimentações

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/feedings` | Solicita alimentação manual |
| `GET` | `/api/feedings` | Lista o histórico mais recente primeiro |
| `GET` | `/api/feedings/:commandId` | Consulta o resultado de um comando |
| `DELETE` | `/api/feedings/:id` | Exclui um registro pelo `_id` do MongoDB |

Solicitação de alimentação:

```bash
curl -X POST http://localhost:3000/api/feedings \
  -H "Content-Type: application/json" \
  -d '{"weightGrams":50}'
```

A resposta é `202 Accepted` e contém o `commandId`. Use esse identificador para consultar o processamento:

```bash
curl http://localhost:3000/api/feedings/COMMAND_ID
```

Um registro de alimentação possui `commandId`, `weightTarget`, `weightGrams`, `openTimeMs`, `type`, `status` e `createdAt`. Os status possíveis são `pending`, `success` e `error`.

## MQTT

| Tópico | Direção | Payload principal |
| --- | --- | --- |
| `pacpet/command` | API -> ESP32 | `commandId`, `command`, `weightGrams`, `type` |
| `pacpet/feeding/data` | ESP32 -> API | `commandId`, `weightGrams`, `openTimeMs`, `type`, `status` |

O ESP32 usa a balança para medir a porção e possui timeout de segurança de 50 segundos. O subscriber da API só atualiza comandos existentes e rejeita payloads inválidos.

## Estrutura

```text
api-pacpet/
  src/controllers/   # Regras de autenticação e alimentação
  src/models/        # Schemas MongoDB
  src/mqtt/          # Cliente e subscriber MQTT
  src/repositories/  # Acesso aos dados
  src/routes/        # Rotas Express
front-pacpet/        # Frontend React principal
  components/ pages/ css/
  comedouro-automatico/ # Segundo frontend Vite independente
firmware/esp32/      # Código do dispositivo
```

## Observações

- O MongoDB e o broker MQTT precisam estar acessíveis antes de iniciar a API e o ESP32.
- O CORS está habilitado na API para permitir o acesso do frontend durante o desenvolvimento.
- A autenticação gera JWT, mas as rotas de alimentação ainda não possuem middleware de autorização no backend.
