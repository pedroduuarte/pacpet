import mqttClient from "./mqttClient.js";
import FeedingRepository from "../repositories/FeedingRepository.js";

mqttClient.subscribe("pacpet/feeding/data", async payload => {
  try {
    const { commandId, weightGrams, openTimeMs, type, status } = payload;

    if (
      !commandId ||
      typeof commandId !== "string" ||
      typeof weightGrams !== "number" ||
      typeof openTimeMs !== "number" ||
      !["manual", "automatic"].includes(type) ||
      !["success", "error"].includes(status)
    ) {
      console.warn("⚠️ Payload inválido:", payload);
      return;
    }

    const updated = await FeedingRepository.updatedByCommandId(commandId, {
      weightGrams,
      openTimeMs,
      type,
      status
    });

    if (!updated) {
      console.warn("⚠️ Comando não encontrado para atualização:", commandId);
      return;
    }

    console.log("✅ Feeding atualizado:", commandId);
  } catch (err) {
    console.error("❌ Erro ao processar dados de feeding:", err);
  }
});
