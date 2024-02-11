import { useEffect, useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { curveCatmullRom, line } from "d3-shape";
import * as d3 from "d3";

const SmoothLineChart = ({ embeddings, conversation_indices }) => {
  const width = 800;
  const height = 600;

  // Define the domain of your data (min and max values for x and y)
  const xExtent = [
    Math.min(...embeddings.map((d) => d.x)),
    Math.max(...embeddings.map((d) => d.x)),
  ];
  const yExtent = [
    Math.min(...embeddings.map((d) => d.y)),
    Math.max(...embeddings.map((d) => d.y)),
  ];

  // Define the scales for x and y dimensions
  const xScale = d3.scaleLinear().domain(xExtent).range([0, width]);
  const yScale = d3.scaleLinear().domain(yExtent).range([height, 0]); // SVG y starts at the top

  const lineGenerator = line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(curveCatmullRom.alpha(1));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {conversation_indices.map((indices, conversationIndex) => {
        const points = indices.map((index) => ({
          x: embeddings[index].x,
          y: embeddings[index].y,
        }));
        const pathData = lineGenerator(points);
        const color = d3.scaleSequential(
          [0, conversation_indices.length],
          d3.interpolateTurbo
        );

        const strokeColor = `hsl(${
          (conversationIndex * 360) / conversation_indices.length
        }, 100%, 50%)`;

        return (
          <path
            key={conversationIndex}
            d={pathData}
            fill="none"
            stroke={color(conversationIndex)}
            strokeWidth={1} // Adjust stroke width as needed
          />
        );
      })}
      {/* Optionally, render scaled embeddings as circles */}
      {embeddings.map((point, index) => (
        <circle
          key={index}
          cx={xScale(point.x)}
          cy={yScale(point.y)}
          r={1}
          fill="red"
        />
      ))}
    </svg>
  );
};

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    window
      .fetch("./conversations.json")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        return console.log(data);
      });
  }, []);

  if (!data) {
    return <p>Loading...</p>;
  }

  console.log({ data });

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <SmoothLineChart
        embeddings={data.embeddings.map((d) => ({ x: d[0], y: d[1] }))}
        conversation_indices={data.conversation_indices}
      />
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
