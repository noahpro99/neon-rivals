import React, { useEffect, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { Mesh } from 'three';

interface ProjectileProps {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  ownerId: number;
  damage: number;
  maxBounces: number;
  onHit: (id: string, targetId?: number, damage?: number) => void;
}

export const Projectile: React.FC<ProjectileProps> = ({ id, position, velocity, ownerId, damage, maxBounces, onHit }) => {
  const bouncesLeft = useRef(maxBounces);
  
  // Track current velocity manually to determine impact force
  const currentVelocity = useRef([0, 0, 0]);

  const [ref, api] = useSphere<Mesh>(() => ({
    mass: 0.6, 
    position,
    args: [0.25],
    linearDamping: 0.1, 
    angularDamping: 0.1,
    velocity,
    allowSleep: false, // CRITICAL: prevent freezing
    userData: { projectileId: id, ownerId },
    material: { friction: 0.1, restitution: 0.9 }, 
    onCollide: (e: any) => {
      // Ignore collision with owner
      if (e.body.userData?.playerId === ownerId) return;

      const hitPlayerId = e.body.userData?.playerId;
      const isWallOrGround = e.body.userData?.isGround || e.body.userData?.isWall;

      if (hitPlayerId) {
        // Direct hit on player - explode
        onHit(id, hitPlayerId, damage);
      } else if (isWallOrGround) {
        // Calculate approximate impact speed from current velocity
        const v = currentVelocity.current;
        const speed = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        
        // If speed is high enough (> 2.0), treat as a bounce.
        // If it's low, it's rolling/settled, so we don't consume a bounce.
        if (speed > 2.0) {
             if (bouncesLeft.current > 0) {
                bouncesLeft.current -= 1;
            } else {
                onHit(id);
            }
        }
      }
    }
  }));

  // Subscribe to velocity to track it for collision logic
  useEffect(() => {
    const unsub = api.velocity.subscribe((v) => (currentVelocity.current = v));
    return unsub;
  }, [api.velocity]);

  useEffect(() => {
    // Cleanup if it flies out of bounds
    const unsub = api.position.subscribe((p) => {
      if (Math.abs(p[0]) > 60 || Math.abs(p[2]) > 60 || p[1] < -5) {
        onHit(id);
      }
    });
    return unsub;
  }, [api.position, onHit, id]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial 
          color={ownerId === 1 ? "#60a5fa" : "#f87171"} 
          emissive={ownerId === 1 ? "#3b82f6" : "#ef4444"} 
          emissiveIntensity={4} 
          toneMapped={false}
          roughness={0}
      />
    </mesh>
  );
};