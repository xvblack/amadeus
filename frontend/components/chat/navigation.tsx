"use client";

import { useMemo } from "react";
// import { ReactMarkdown } from "react-markdown/lib/react-markdown";
// import "github-markdown-css/github-markdown-light.css";
import ReactFlow, { Position, useEdgesState, useNodesState } from "reactflow";

import "reactflow/dist/style.css";
import dagre from "dagre";
import { ChatStateAtomColl } from "../../components/chat/chat";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 120;
const nodeHeight = 40;
const getLayoutedElements = (atoms: ChatStateAtomColl[]) => {
  dagreGraph.setGraph({
    // rankdir: "TB"
    rankdir: "LR",
  });

  atoms.forEach((a) => {
    dagreGraph.setNode(a.character, { width: nodeWidth, height: nodeHeight });
  });

  atoms.forEach((a) => {
    for (const dependent of a.dependentCharacters) {
      dagreGraph.setEdge(dependent, a.character);
    }
  });

  dagre.layout(dagreGraph);

  const nodes = atoms.map((a) => {
    const nodeWithPosition = dagreGraph.node(a.character);
    // node.targetPosition = isHorizontal ? "left" : "top";
    // node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    return {
      id: a.character,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: {
        label: a.character,
      },
    };
  });

  const edges = atoms.flatMap((a) =>
    a.dependentCharacters.map((dependent) => ({
      id: `${dependent}->${a.character}`,
      source: dependent,
      target: a.character,
    }))
  );

  return { nodes, edges };
};

export const Navigation = ({ allAtoms }: { allAtoms: ChatStateAtomColl[] }) => {
  const graph = useMemo(() => getLayoutedElements(allAtoms), [allAtoms]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        {/* <Background variant="dots" gap={12} size={1} /> */}
      </ReactFlow>
    </div>
  );
};
