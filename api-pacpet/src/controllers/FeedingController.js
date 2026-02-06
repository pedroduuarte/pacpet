import FeedingRepository from "../repositories/FeedingRepository.js";
import mqttClient from "../mqtt/mqttClient.js";
import { randomUUID } from "crypto";

class FeedingController {

  // FRONT → API → MQTT → ESP
  async manualFeed(req, res) {
    try {
      const { weightGrams } = req.body;
      const commandId = randomUUID();

      if (
        weightGrams == null ||
        typeof weightGrams !== "number" ||
        weightGrams <= 0
      ) {
        return res.status(400).json({ error: "Peso inválido" });
      }

      // Salva comando no banco como pending
      await FeedingRepository.create({
        commandId,
        weightTarget: weightGrams,
        type: "manual",
        status: "pending"
      });

      // Envia comando ao ESP via MQTT
      mqttClient.publish("pacpet/command",
        JSON.stringify({
          commandId,
          command: "FEED",
          weightGrams,
          type: "manual"
        })
      );

      return res.status(202).json({
        message: "Comando enviado ao ESP",
        commandId
      });
    } catch (err) {
      console.error("Erro ao enviar comando manual:", err);
      return res.status(500).json({ error: "Erro ao enviar comando" });
    }
  }

  // Histórico
  async list(req, res) {
    try {
      const data = await FeedingRepository.findAll();
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar histórico" });
    }
  }

  async getByCommandId(req, res) {
    try {
      const { commandId } = req.params;

      const feeding = await FeedingRepository.findByCommandId(commandId);

      if (!feeding) {
        return res.status(404).json({ error: "Feeding não encontrado" });
      }

      return res.json({
        status: feeding.status,
        weightGrams: feeding.weightGrams,
        openTimeMs: feeding.openTimeMs
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar feeding" });
    }
  }


  async delete(req, res) {
    try {
      await FeedingRepository.deleteById(req.params.id);
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao deletar feeding" });
    }
  }
}

export default new FeedingController();
