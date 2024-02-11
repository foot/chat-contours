// example.ts
import fs from "fs/promises";
import {
  Document,
  VectorStoreIndex,
  serviceContextFromDefaults,
  SimpleNodeParser,
} from "llamaindex";

async function main() {
  // Load essay from abramov.txt in Node
  const converstationsRaw = await fs.readFile(
    "data/chats_data2023-09-27.json",
    "utf-8"
  );
  const conversations = JSON.parse(converstationsRaw);
  const firstConvo = conversations[0];

  // Create Document object with essay
  let documents = [];
  for (const convo of firstConvo.conversations) {
    const document = new Document({ text: convo });
    documents.push(document);
  }

  const serviceContext = serviceContextFromDefaults({
    nodeParser: new SimpleNodeParser({
      chunkSize: 100000,
      chunkOverlap: 0,
    }),
  });

  //   // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  //   // Query the index
  //   const queryEngine = index.asQueryEngine();
  //   const response = await queryEngine.query({
  //     query: "What did the author do in college?",
  //   });

  //   // Output response
  //   console.log(response.toString());
}

main();
