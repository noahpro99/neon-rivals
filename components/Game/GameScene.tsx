import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { OrbitControls, Stars } from '@react-three/drei';
import { Player } from './Player';
import { Projectile } from './Projectile';
import { PlayerStats, ProjectileData } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// The Floor
const Arena = () => {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -0.5, 0],
    // Low friction floor, restitution helps with bounces but projectiles handle their own bounce logic mostly
    material: { friction: 0.0, restitution: 0.5 },
    userData: { isGround: true }
  }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.6} />
      <gridHelper args={[60, 60, 0x4ade80, 0x444444]} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </mesh>
  );
};

// Boundary Walls to contain projectiles
const Boundaries = () => {
  // Four walls
  const walls = [
    { position: [0, 2, -25], args: [50, 5, 1] }, // North
    { position: [0, 2, 25], args: [50, 5, 1] },  // South
    { position: [-25, 2, 0], args: [1, 5, 50] }, // West
    { position: [25, 2, 0], args: [1, 5, 50] },  // East
  ];

  return (
    <>
      {walls.map((wall, i) => (
        <Wall key={i} position={wall.position as [number, number, number]} args={wall.args as [number, number, number]} />
      ))}
    </>
  );
};

const Wall = ({ position, args }: { position: [number, number, number], args: [number, number, number] }) => {
  const [ref] = useBox(() => ({
    position,
    args,
    type: 'Static',
    userData: { isWall: true },
    material: { friction: 0, restitution: 1.0 } // Perfectly elastic collision for bouncing
  }));

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={args} />
      <meshStandardMaterial 
        color="#000000" 
        emissive="#4ade80"
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

interface GameSceneProps {
  p1: PlayerStats;
  p2: PlayerStats;
  onP1Hit: (dmg: number) => void;
  onP2Hit: (dmg: number) => void;
}

export const GameScene: React.FC<GameSceneProps> = ({ p1, p2, onP1Hit, onP2Hit }) => {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);

  const handleShoot = useCallback((ownerId: number, pos: [number, number, number], vel: [number, number, number]) => {
    const stats = ownerId === 1 ? p1 : p2;
    setProjectiles(prev => [...prev, { 
        id: uuidv4(), 
        position: pos, 
        velocity: vel, 
        ownerId, 
        damage: stats.damage,
        maxBounces: stats.maxBounces 
    }]);
  }, [p1, p2]);

  const handleProjectileHit = useCallback((projectileId: string, targetId?: number, damage?: number) => {
    // Remove projectile
    setProjectiles(prev => prev.filter(p => p.id !== projectileId));
    
    // Apply damage if a player was hit
    if (targetId === 1 && damage) onP1Hit(damage);
    if (targetId === 2 && damage) onP2Hit(damage);
  }, [onP1Hit, onP2Hit]);

  return (
    <Canvas shadows camera={{ position: [0, 25, 15], fov: 45 }}>
      <color attach="background" args={['#111111']} />
      
      {/* Lighting Improvements */}
      <ambientLight intensity={2.0} />
      <hemisphereLight args={["#ffffff", "#444444", 1.5]} />
      <pointLight position={[10, 20, 10]} intensity={500} castShadow distance={60} decay={2} />
      <pointLight position={[-10, 20, -10]} intensity={500} color="#4ade80" distance={60} decay={2} />
      <spotLight position={[0, 40, 0]} angle={0.6} penumbra={0.5} intensity={800} castShadow decay={2} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Physics gravity={[0, -30, 0]} defaultContactMaterial={{ restitution: 0.7, friction: 0.0 }}>
        <Arena />
        <Boundaries />
        
        {p1.hp > 0 && (
          <Player 
            stats={p1} 
            position={[-8, 2, 0]} 
            controls={{ 
                up: 'KeyW', 
                down: 'KeyS', 
                left: 'KeyA', 
                right: 'KeyD', 
                jump: 'Space',
                shoot: 'ShiftLeft' // Changed from 'KeyF' to ShiftLeft for better ergonomics and anti-ghosting
            }}
            onShoot={(pos, vel) => handleShoot(1, pos, vel)}
            onHit={onP1Hit}
          />
        )}

        {p2.hp > 0 && (
          <Player 
            stats={p2} 
            position={[8, 2, 0]} 
            controls={{ 
                up: 'ArrowUp', 
                down: 'ArrowDown', 
                left: 'ArrowLeft', 
                right: 'ArrowRight', 
                jump: 'ShiftRight',
                shoot: 'Enter' 
            }}
            onShoot={(pos, vel) => handleShoot(2, pos, vel)}
            onHit={onP2Hit}
          />
        )}

        {projectiles.map(p => (
            <Projectile 
                key={p.id} 
                {...p} 
                onHit={handleProjectileHit}
            />
        ))}
      </Physics>
      
      <OrbitControls enableRotate={false} enableZoom={false} />
    </Canvas>
  );
};