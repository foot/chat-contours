import { Fragment, useEffect, useState } from "react";
import "./App.css";

import * as d3 from "d3";

interface SmoothLineChartProps {
  embeddings: { x: number; y: number }[];
  conversation_indices: number[][];
}

const SmoothLineChart = ({
  embeddings,
  conversation_indices,
}: SmoothLineChartProps) => {
  const width = 800;
  const height = 800;

  const xExtent = d3.extent(embeddings, (d) => d.x) as [number, number];
  const yExtent = d3.extent(embeddings, (d) => d.y) as [number, number];

  const xScale = d3.scaleLinear().domain(xExtent).range([0, width]);
  const yScale = d3.scaleLinear().domain(yExtent).range([height, 0]);

  const lineGenerator = d3
    .line<{ x: number; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(d3.curveCatmullRom.alpha(1));

  const color = d3.scaleSequential(
    [0, conversation_indices.length],
    d3.interpolateTurbo
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {conversation_indices.map((indices, conversationIndex) => {
        const points = indices.map((index) => embeddings[index]);
        const pathData = lineGenerator(points);
        if (!pathData) {
          console.warn("No path data for conversation", conversationIndex);
          return null;
        }

        const pointsComponents = points.map((point, index) => (
          <circle
            key={index}
            cx={xScale(point.x)}
            cy={yScale(point.y)}
            r={1}
            // red actually looks kind of fun
            fill="red"
            // fill={color(conversationIndex)}
          />
        ));

        return (
          <Fragment key={conversationIndex}>
            <path
              key={conversationIndex}
              d={pathData}
              fill="none"
              stroke={color(conversationIndex)}
              strokeWidth={1}
            />
            {pointsComponents}
          </Fragment>
        );
      })}
    </svg>
  );
};

interface Data {
  embeddings: number[][];
  conversation_indices: number[][];
}

function App() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    window
      .fetch("./conversations.json")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <SmoothLineChart
        embeddings={data.embeddings.map((d) => ({ x: d[0], y: d[1] }))}
        conversation_indices={data.conversation_indices}
      />
    </>
  );
}

export default App;
