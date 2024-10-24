import * as THREE from 'three';
import { Line, OrbitControls, PerspectiveCamera, TrackballControls, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { read, utils } from 'xlsx'
import { useEffect, useState } from 'react';


function App() {
  const [members, setMembers] = useState([]);
  const [nodes, setNodes] = useState({});


  const fetchMemberData = (workbook) => {
    const sheetName = workbook.SheetNames[0];
    const workSheet = workbook.Sheets[sheetName];

    const jsonData = utils.sheet_to_json(workSheet, { header: 1 });

    const memberData = jsonData.slice(1) 
    .filter((row) => row[1] !== undefined && row[2] !== undefined)
    .map((row) => ({
      start: row[1],
      end: row[2],
    }));

    setMembers(memberData);
  }

  const fetchNodeData = (workbook) => {

    const sheetName = workbook.SheetNames[1];
    const workSheet = workbook.Sheets[sheetName];

    const jsonData = utils.sheet_to_json(workSheet, { header: 1 });

      const nodeData = {};

      jsonData.slice(1) 
      .filter((row) => row[0] !== undefined && row[1] !== undefined && row[2] !== undefined && row[3] !== undefined)
      .forEach((row) => {
      const nodeId = row[0];
      const x = row[1];
      const y = row[2];
      const z = row[3];

      nodeData[nodeId] = [x, y, z];
    });

      setNodes(nodeData);
  }


  async function loadData(){
    const response = await fetch('data.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });

    fetchMemberData(workbook);
    fetchNodeData(workbook);
  }

  useEffect(() => {
    loadData();
    console.log('member', members);
    console.log('node', nodes);
  }, []);

  return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[100, 100, 100]} fov={75} />
          <OrbitControls />
          <TransformControls />
          <TrackballControls />
          {members.map((member) => {
              const startNode = nodes[member.start];
              const endNode = nodes[member.end];

              if (startNode && endNode) {
                const points = [new THREE.Vector3(...startNode), new THREE.Vector3(...endNode)];
                return (
                  <Line
                    key={`${member.start}-${member.end}`}
                    points={points}
                    color="black"
                    lineWidth={1}
                  />
                );
              } else {
                return null;
              }
            }
          )}
        </Canvas>
      </div>
  )
}

export default App
