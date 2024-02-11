import json

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import PathPatch
from matplotlib.path import Path
from sklearn.manifold import TSNE


def plot(embeddings, conversation_indices):
    plt.figure(figsize=(10, 6))
    # Use a colormap to generate unique colors for each conversation
    colors = plt.cm.rainbow(np.linspace(0, 1, len(conversation_indices)))
    for indices, color in zip(conversation_indices, colors):
        # Plot lines for each conversation if there are at least two points to connect
        if len(indices) > 1:
            for i in range(len(indices) - 1):
                plt.plot(embeddings[indices[i:i+2], 0],
                         embeddings[indices[i:i+2], 1], color=color)
        # Plot points for each conversation
        plt.scatter(embeddings[indices, 0],
                    embeddings[indices, 1], color=color)

    plt.show()


def plot_bezier(embeddings, conversation_indices):
    fig, ax = plt.subplots(figsize=(10, 6))
    # Generate a unique color for each conversation
    colors = plt.cm.rainbow(np.linspace(0, 1, len(conversation_indices)))

    for indices, color in zip(conversation_indices, colors):
        # Skip conversations with fewer than three points
        if len(indices) < 3:
            continue

        # Draw quadratic Bezier curve for each set of three points
        for i in range(len(indices) - 2):
            start = embeddings[indices[i]]
            control = embeddings[indices[i + 1]]
            end = embeddings[indices[i + 2]]

            # Define the vertices of the quadratic Bezier curve
            verts = [start, control, end]
            codes = [Path.MOVETO, Path.CURVE3,
                     Path.CURVE3]  # Define path codes

            # Create a Path object and add it as a PathPatch to the plot
            path = Path(verts, codes)
            patch = PathPatch(path, facecolor='none', lw=2, edgecolor=color)
            ax.add_patch(patch)

        # Plot the points for each conversation
        points = embeddings[indices]
        ax.scatter(points[:, 0], points[:, 1], color=color, zorder=3)

    plt.show()


def main():
    # Load the embeddings
    data = []
    for filename in [
        "processed_conversations-0-50.json",
        "processed_conversations-50-100.json",
        "processed_conversations-100-150.json",
        "processed_conversations-150-200.json",
    ]:
        with open(filename) as f:
            data.extend(json.load(f))
    # datafile_path = "processed_conversations-0-50.json"
    # with open(datafile_path) as f:
    #     data = json.load(f)

    matrix = []
    conversation_indices = []
    for convo in data:
        # For each conversation, keep track of the indices of its messages in the matrix
        indices = []
        for message in convo["message_embeddings"]:
            matrix.append(message["embedding"])
            # The current message's index in the matrix
            indices.append(len(matrix) - 1)
        conversation_indices.append(indices)

    print(len(matrix))

    # Convert list of embeddings into a NumPy array
    matrix_np = np.array(matrix)

    # Min of 15 and len(matrix) for perplexity
    perplexity = min(15, len(matrix_np) - 1)

    # Create a t-SNE model and transform the data
    tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42,
                init='random', learning_rate=200)
    reduced_embeddings = tsne.fit_transform(matrix_np)

    # Plot the reduced embeddings with lines connecting consecutive messages, each conversation in a different color
    # plot_bezier(reduced_embeddings, conversation_indices)

    with open("public/conversations.json", "w") as f:
        json.dump({
            "conversation_indices": conversation_indices,
            "embeddings": reduced_embeddings.tolist(),
        }, f, indent=2)


if __name__ == "__main__":
    main()
