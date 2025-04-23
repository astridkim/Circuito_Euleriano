const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let vertices = [];
let edges = [];

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (addingEdge) {
    selectVertexForEdge(x, y);
  } else if (deletingVertex) {
    deleteVertexAt(x, y);
  } else {
    vertices.push({ x, y, id: vertices.length });
    drawGraph();
  }
});

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibuja aristas
  for (let { from, to } of edges) {
    const v1 = vertices[from];
    const v2 = vertices[to];
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.strokeStyle = "#415b61";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Dibuja vértices
  for (let v of vertices) {
    ctx.beginPath();
    ctx.arc(v.x, v.y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "#5f8792";
    ctx.fill();
    ctx.strokeStyle = "#1e1e1e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(v.id, v.x, v.y);
  }
}

let addingEdge = false;
let deletingVertex = false;
let edgeStart = null;

function addVertex() {
  addingEdge = false;
  deletingVertex = false;
}

function addEdge() {
  addingEdge = true;
  deletingVertex = false;
  edgeStart = null;
}

function deleteVertex() {
  deletingVertex = true;
  addingEdge = false;
}

function selectVertexForEdge(x, y) {
  const vertex = findVertexAt(x, y);
  if (!vertex) return;

  if (!edgeStart) {
    edgeStart = vertex;
  } else {
    if (edgeStart.id !== vertex.id) {
      edges.push({ from: edgeStart.id, to: vertex.id });
    }
    edgeStart = null;
    drawGraph();
  }
}

function deleteVertexAt(x, y) {
  const vertex = findVertexAt(x, y);
  if (!vertex) return;
  vertices = vertices.filter(v => v !== vertex);
  edges = edges.filter(e => e.from !== vertex.id && e.to !== vertex.id);
  // Actualizar IDs
  vertices.forEach((v, i) => v.id = i);
  drawGraph();
}

function findVertexAt(x, y) {
  return vertices.find(v => {
    const dx = v.x - x;
    const dy = v.y - y;
    return dx * dx + dy * dy < 20 * 20;
  });
}

function checkEulerian() {
  if (vertices.length === 0) return;

  let degree = new Array(vertices.length).fill(0);
  for (let edge of edges) {
    degree[edge.from]++;
    degree[edge.to]++;
  }

  // Verifica si todos los grados son pares
  const allEven = degree.every(d => d % 2 === 0);
  const isConnected = checkConnectivity();

  const output = document.getElementById("output");
  if (allEven && isConnected) {
    output.textContent = "El grafo es Euleriano.";
  } else {
    output.textContent = " El grafo NO es Euleriano.";
  }
}

function checkConnectivity() {
  if (vertices.length === 0) return false;
  const visited = new Set();
  const stack = [0];

  while (stack.length) {
    const current = stack.pop();
    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = edges
        .filter(e => e.from === current || e.to === current)
        .map(e => (e.from === current ? e.to : e.from));
      neighbors.forEach(n => stack.push(n));
    }
  }

  return visited.size === vertices.length;
}
