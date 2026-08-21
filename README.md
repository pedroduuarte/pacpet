# API Comedouro Automático

API REST para registrar e consultar alimentações de um comedouro automático para pets. O projeto foi desenvolvido em Node.js com Express e utiliza MongoDB para persistir o histórico de alimentações, podendo receber registros de um ESP32 e disponibilizá-los para um frontend.

## Tecnologias

- Node.js com ES Modules
- Express 5
- MongoDB com Mongoose
- CORS
- dotenv

## Requisitos

- Node.js instalado
- Uma instância do MongoDB local ou hospedada

## Instalação

Na pasta da API, instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz da API:

```env
MONGO_URI=mongodb://localhost:27017/pet-feeder
PORT=3000
```

`PORT` é opcional e assume `3000` quando não for informado.

## Execução

Para iniciar a API:

```bash
npm start
```

O projeto também possui o script `dev`, que atualmente executa o servidor da mesma forma:

```bash
npm run dev
```

Quando iniciado, o servidor fica disponível em `http://localhost:3000` (ou na porta definida em `PORT`).

## Endpoints

Todas as rotas usam o prefixo `/api`.

### Criar alimentação

`POST /api/feedings`

Usado pelo dispositivo para registrar uma alimentação. O corpo deve ser JSON e conter:

| Campo | Tipo | Valores aceitos |
| --- | --- | --- |
| `weightGrams` | number | Peso liberado em gramas |
| `openTimeMs` | number | Tempo de abertura em milissegundos |
| `type` | string | `automatic` ou `manual` |
| `status` | string | `success` ou `error` |

Exemplo:

```bash
curl -X POST http://localhost:3000/api/feedings \
  -H "Content-Type: application/json" \
  -d '{"weightGrams":50,"openTimeMs":1200,"type":"automatic","status":"success"}'
```

Resposta de sucesso: `201 Created`, com o registro criado.

### Listar histórico

`GET /api/feedings`

Retorna todos os registros, ordenados do mais recente para o mais antigo.

```bash
curl http://localhost:3000/api/feedings
```

Resposta de sucesso: `200 OK`.

### Excluir alimentação

`DELETE /api/feedings/:id`

Remove um registro pelo `_id` do MongoDB.

```bash
curl -X DELETE http://localhost:3000/api/feedings/65a123456789012345678901
```

Resposta de sucesso: `204 No Content`.

## Modelo de dados

Cada alimentação contém os campos `weightGrams`, `openTimeMs`, `type`, `status` e `createdAt`. O campo `createdAt` é preenchido automaticamente quando o registro é criado.

## Estrutura do projeto

```text
src/
├── app.js                         # Configuração do Express e das rotas
├── server.js                      # Inicialização do servidor
├── config/database.js             # Conexão com o MongoDB
├── controllers/FeedingController.js
├── models/Feeding.js              # Schema da alimentação
├── repositories/FeedingRepository.js
├── routes/feedingRoutes.js
└── strategies/                    # Estratégias manual e automática
```

## Validações e erros

- Requisições de criação com campos ausentes ou valores inválidos retornam `400 Bad Request`.
- Falhas ao salvar, consultar ou excluir dados retornam `500 Internal Server Error`.
- O CORS está habilitado para permitir o consumo da API por aplicações frontend e dispositivos autorizados pela rede.
