import ollama from "ollama";
import { io } from "../../server";

interface Document {
  metadata: any;
  properties: {
    title?: string;
    author?: string;
    text: string;
    page?: number;
    published_year?: number;
    language?: string;
  };
  uuid: string;
  vectors: any;
}

/**
 * Функция askQuestion принимает:
 * @param userQuery - вопрос пользователя
 * @param documents - массив документов с источниками
 * @param socketId - id сокета, которому отправлять данные (если не передан — всем)
 *
 * Если документов нет, промпт начинает ответ с "Я не смог найти информацию в достоверных источниках, но вот что я об этом думаю:"
 * Функция формирует промпт, отправляет его в Ollama с stream: true,
 * и по мере генерации отправляет накопленный ответ клиенту через событие "partial answer".
 */
export async function askQuestion(
  userQuery: string,
  documents: Document[],
  socketId?: string
): Promise<string> {
  let prompt: string;

  if (documents && documents.length > 0) {
    const context = documents
      .map((doc) => {
        const title = doc.properties.title || "Без названия";
        const page = doc.properties.page
          ? `страница ${doc.properties.page}`
          : "";
        const text = doc.properties.text;
        return `Документ: "${title}" ${page}\nТекст: ${text}`;
      })
      .join("\n\n");

    prompt = `Используя следующие документы, ответь на вопрос ниже. В ответе обязательно укажи прямой ответ и ссылки на источники (название книги и номера страниц), откуда была взята информация.

Документы:
${context}

Вопрос: ${userQuery}

Ответ:`;
  } else {
    prompt = `Я не смог найти информацию в достоверных источниках, но вот что я об этом думаю:

Вопрос: ${userQuery}

Ответ:`;
  }

  try {
    const responseStream = await ollama.chat({
      model: "owl/t-lite",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    let fullResponse = "";
    // При получении каждого чанка добавляем его к накопленному ответу
    // и отправляем клиенту накопленный ответ по событию "partial answer"
    for await (const part of responseStream) {
      const content = part.message.content;
      fullResponse += content;

      if (socketId) {
        io.to(socketId).emit("partial answer", { text: fullResponse });
      } else {
        io.emit("partial answer", { text: fullResponse });
      }
      process.stdout.write(content);
    }

    return fullResponse;
  } catch (error) {
    console.error("Ошибка при генерации ответа:", error);
    throw error;
  }
}
