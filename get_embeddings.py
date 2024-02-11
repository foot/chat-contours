from openai import OpenAI
import json
import tiktoken
import os

client = OpenAI()


# Function to count the number of tokens using tiktoken
def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens


# Truncate text to a specified max token count using tiktoken
def truncate_text_to_max_tokens(text: str, max_tokens: int = 8000, encoding_name: str = "cl100k_base") -> str:
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(text)
    if len(tokens) > max_tokens:
        # Truncate to the first max_tokens tokens
        truncated_tokens = tokens[:max_tokens]
        return encoding.decode(truncated_tokens)
    return text


# Load data from JSON fil
def load_data(file_path: str):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data


# Function to generate embeddings using the OpenAI API
def generate_embedding(text: str):
    truncated_text = truncate_text_to_max_tokens(text)
    if not truncated_text:
        truncated_text = " "
    return client.embeddings.create(input=[truncated_text], model="text-embedding-3-small").data[0].embedding


# Function to process conversations and generate embeddings
def process_conversations(conversations):
    processed_data = []

    for i, conv in enumerate(conversations):
        print(i)
        message_embeddings = []
        # cumulative_text = ""
        # cumulative_embeddings = []

        for message in conv['conversations']:
            text = message['value']
            embedding = generate_embedding(text)
            message_embeddings.append({"embedding": embedding})

            # cumulative_text += (" " + text) if cumulative_text else text
            # cumulative_text = truncate_text_to_max_tokens(cumulative_text)
            # cumulative_embedding = generate_embedding(cumulative_text)
            # cumulative_embeddings.append(cumulative_embedding)

        # whole_conversation_text = " ".join(
        #     [msg['value'] for msg in conv['conversations']])
        # whole_conversation_embedding = generate_embedding(
        #     whole_conversation_text)

        processed_data.append({
            # "embedding": whole_conversation_embedding,
            "message_embeddings": [
                {
                    "embedding": emb['embedding'],
                    # "cumulative_embedding": cum_emb
                }
                # for emb, cum_emb in zip(message_embeddings, cumulative_embeddings)
                for emb in message_embeddings
            ]
        })

    return processed_data


def gen_embedding(conversation_data, output_file_path):

    # Process the loaded conversation data
    processed_conversations = process_conversations(conversation_data)

    with open(output_file_path, 'w') as f:
        json.dump(processed_conversations, f, indent=2)

    print(f"Processed data written to {output_file_path}")


if __name__ == "__main__":
    # Load the conversation data from the JSON file
    file_path = 'data/chats_data2023-09-27.json'
    conversation_data = load_data(file_path)

    sample_conversations = conversation_data[150:200]
    # Write the processed data to a JSON file
    output_file_path = 'processed_conversations-150-200.json'

    gen_embedding(sample_conversations, output_file_path)
