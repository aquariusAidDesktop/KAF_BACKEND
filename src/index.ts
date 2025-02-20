import logger from "./services/utils/logger";
import "./server";
import { createCollection, deleteAllCollections } from "./services/weaviate";
import { startLocalProcess } from "./services/utils/fragmentTextServer";

async function main() {
  //   logger.info("🚀 Запуск основного процесса...");
  // await deleteAllCollections()
  // await createCollection()
  //   logger.info(
  //     await searchBySimilarity("Очередной дневальный по роте")
  //   );
  //   logger.info(
  //     await searchByKeyword("Очередной дневальный по роте")
  //   );
  //   logger.info(await searchHybrid("Очередной дневальный по роте"));
  //   logger.info("✅ Все операции успешно завершены.");
}

main().catch((err) => {
  logger.error(err);
});
