/// <reference lib="dom" />
import React, { useRef, useEffect, useState } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { Vector3, TextureLoader, Texture, Mesh } from 'three';
import { PlayerStats } from '../../types';

interface PlayerProps {
  stats: PlayerStats;
  position: [number, number, number];
  controls: { up: string; down: string; left: string; right: string; shoot: string; jump: string };
  onShoot: (pos: [number, number, number], vel: [number, number, number]) => void;
  onHit: (damage: number) => void;
}

export const Player: React.FC<PlayerProps> = ({ stats, position, controls, onShoot, onHit }) => {
  const { id, speed, size, color, textureUrl, maxHp, hp } = stats;
  
  const [ref, api] = useBox<Mesh>(() => ({
    mass: 50 * size,
    position,
    args: [size, size, size],
    fixedRotation: true,
    linearDamping: 0, // We handle damping manually for snappier controls
    allowSleep: false, // CRITICAL: Prevents physics body from sleeping (which disables controls)
    userData: { playerId: id },
    material: { friction: 0.0, restitution: 0.0 } // Zero friction to ensure manual velocity control works perfectly
  }));

  // Movement Logic
  const keys = useRef<{ [key: string]: boolean }>({});
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Shooting cooldown
  const lastShootTime = useRef(0);
  
  // Persistent facing direction
  const facing = useRef(new Vector3(id === 1 ? 1 : -1, 0, 0));

  // Texture loading
  const [activeTexture, setActiveTexture] = useState<Texture | null>(null);
  
  useEffect(() => {
      if (textureUrl) {
          new TextureLoader().load(textureUrl, (tex) => {
              setActiveTexture(tex);
          });
      }
  }, [textureUrl]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((v) => (pos.current = v)), [api.position]);

  const vel = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (vel.current = v)), [api.velocity]);

  useFrame(() => {
    if (hp <= 0) return;

    // 1. Determine intended horizontal movement
    const moveDir = new Vector3(0, 0, 0);
    if (keys.current[controls.up]) moveDir.z -= 1;
    if (keys.current[controls.down]) moveDir.z += 1;
    if (keys.current[controls.left]) moveDir.x -= 1;
    if (keys.current[controls.right]) moveDir.x += 1;

    let vx = vel.current[0];
    let vy = vel.current[1];
    let vz = vel.current[2];

    if (moveDir.length() > 0) {
      // Moving
      moveDir.normalize();
      facing.current.copy(moveDir);
      moveDir.multiplyScalar(speed);
      
      vx = moveDir.x;
      vz = moveDir.z;

      const angle = Math.atan2(moveDir.x, moveDir.z);
      api.rotation.set(0, angle, 0);
    } else {
      // Stopped - apply manual friction (instant stop for snappy feel)
      vx = 0;
      vz = 0;
      
      const angle = Math.atan2(facing.current.x, facing.current.z);
      api.rotation.set(0, angle, 0);
    }

    // 2. Ground Detection
    // Player center Y is pos[1]. Bottom is pos[1] - size/2.
    // Floor is at Y = -0.5.
    const isGrounded = pos.current[1] <= (-0.5 + size / 2 + 0.1);
    
    // 3. Handle Jump
    // Using a wider tolerance (5) for vertical velocity to allow jumping even if slightly sliding down a ramp/uneven mesh
    if (keys.current[controls.jump] && isGrounded && Math.abs(vy) < 5) {
        vy = 18; // Jump impulse
    }

    // 4. Apply combined velocity
    // We set this every frame to ensure complete control over character movement
    api.velocity.set(vx, vy, vz);

    // 5. Shooting Logic
    if (keys.current[controls.shoot]) {
        const now = Date.now();
        if (now - lastShootTime.current > 300) { 
            lastShootTime.current = now;
            
            const shootDir = facing.current.clone().normalize();
            
            // Spawn bullet further away to avoid self-collision
            const spawnDist = (size * 0.7) + 0.8; 

            const bulletPos: [number, number, number] = [
                pos.current[0] + shootDir.x * spawnDist, 
                pos.current[1], // Keep vertically aligned
                pos.current[2] + shootDir.z * spawnDist
            ];
            
            const bulletVel: [number, number, number] = [
                shootDir.x * 40, 
                0, 
                shootDir.z * 40
            ];
            onShoot(bulletPos, bulletVel);
        }
    }

    // 6. Void check
    if (pos.current[1] < -5) {
        onHit(9999); 
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        color={activeTexture ? 'white' : color} 
        map={activeTexture} 
        roughness={0.4}
        metalness={0.6}
      />
      
      {/* Direction Indicator / Weapon */}
      <mesh position={[0, 0, size * 0.6]}>
         <boxGeometry args={[size * 0.2, size * 0.2, size * 0.8]} />
         <meshStandardMaterial color="#222" />
      </mesh>

      {/* Health Bar */}
      <mesh position={[0, size + 0.5, 0]}>
          <planeGeometry args={[1.5, 0.2]} />
          <meshBasicMaterial color="black" />
          <mesh position={[-0.75 + (1.5 * (hp / maxHp)) / 2, 0, 0.01]}>
             <planeGeometry args={[1.5 * (hp / maxHp), 0.15]} />
             <meshBasicMaterial color={hp < maxHp * 0.3 ? "red" : "green"} />
          </mesh>
      </mesh>
    </mesh>
  );
};