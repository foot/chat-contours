import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

async function main() {
  const chatCompletion = await openai.embeddings.create({
    input: "foo",
    model: "text-embedding-3-small",
    dimensions: 2,
  });

  console.log(chatCompletion);
}

main();
