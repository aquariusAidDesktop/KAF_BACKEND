import app from "./app";
import dotenv from "dotenv";
import logger from "./services/utils/logger";
import http from "http";
import { Server } from "socket.io";
import { searchHybrids, searchKeyword, searchSimilarity } from "./socket/crud";

dotenv.config();

const PORT = process.env.PORT || 5041;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Функция для создания задержки
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on(
    "chat message",
    async (payload: { text: string; searchType?: string }) => {
      logger.info(
        `Получено сообщение от ${socket.id}: ${payload.text} - ${payload.searchType}`
      );

      let data = { text: "Ищу похожую информацию" };
      io.emit("loading answer", data);
      await delay(3000);

      switch (payload.searchType) {
        case "1":
          const answer1 = await searchHybrids({ queryText: payload.text });
          data = { text: "Генерирую ответ" };
          io.emit("loading answer", data);
          await delay(4000);
          io.emit(
            "chat message",
            answer1 ? answer1[0].properties.text : "Не удалось найти информацию"
          );
          break;
        case "2":
          const answer2 = await searchSimilarity({ queryText: payload.text });
          data = { text: "Генерирую ответ" };
          io.emit("loading answer", data);
          await delay(4000);
          io.emit(
            "chat message",
            answer2 ? answer2[0].properties.text : "Не удалось найти информацию"
          );
          break;
        case "3":
          const answer3 = await searchKeyword({ queryText: payload.text });
          data = { text: "Генерирую ответ" };
          io.emit("loading answer", data);
          await delay(4000);
          io.emit(
            "chat message",
            answer3 ? answer3[0].properties.text : "Не удалось найти информацию"
          );
          break;
        default:
          io.emit(
            "chat message",
            "Что-то пошло не так. Перезагрузите страницу (CTRL + F5)."
          );
          break;
      }
    }
  );

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  logger.info(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
