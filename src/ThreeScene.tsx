import { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { BotControl, CameraMode, DroneFormation } from './types';
import { attachResize, buildStarfield, createScene, type SceneObjects } from './three/scene';
import {
  buildDroneRealm,
  buildGatewayRealm,
  buildRobowarsRealm,
  buildStageRealm,
} from './three/realms';
import { attachDragControls } from './three/input';
import { updateWorld } from './three/animation';
import { resolveRenderQuality } from './three/quality';

export interface ThreeSceneProps {
  scrollProgress: number;
  cameraMode: CameraMode;
  droneFormation: DroneFormation;
  djBeatTrigger: boolean;
  botControl: BotControl;
  onBotGoal: () => void;
}

function ThreeScene({
  scrollProgress,
  cameraMode,
  droneFormation,
  djBeatTrigger,
  botControl,
  onBotGoal,
}: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef(scrollProgress);
  const cameraModeRef = useRef(cameraMode);
  const droneFormationRef = useRef(droneFormation);
  const djBeatRef = useRef(djBeatTrigger);
  const botControlRef = useRef(botControl);
  const onBotGoalRef = useRef(onBotGoal);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);
  useEffect(() => {
    droneFormationRef.current = droneFormation;
  }, [droneFormation]);
  useEffect(() => {
    djBeatRef.current = djBeatTrigger;
  }, [djBeatTrigger]);
  useEffect(() => {
    botControlRef.current = botControl;
  }, [botControl]);
  useEffect(() => {
    onBotGoalRef.current = onBotGoal;
  }, [onBotGoal]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const deviceNavigator = navigator as Navigator & { deviceMemory?: number };
    const quality = resolveRenderQuality({
      devicePixelRatio: window.devicePixelRatio,
      deviceMemory: deviceNavigator.deviceMemory,
      hardwareConcurrency: deviceNavigator.hardwareConcurrency,
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    });
    const ctx = createScene(container, quality);
    const objects: SceneObjects = {};
    const loader = new THREE.TextureLoader();

    buildStarfield(ctx.scene, quality.starCount);
    buildGatewayRealm(ctx.scene, objects, loader);
    buildRobowarsRealm(ctx.scene, objects, loader);
    buildDroneRealm(ctx.scene, objects, loader);
    buildStageRealm(ctx.scene, objects, loader);

    const detachResize = attachResize(container, ctx);
    const drag = attachDragControls(ctx.renderer.domElement, ctx.camera, objects, cameraModeRef);

    let animationFrameId = 0;
    const frameInterval = 1000 / quality.maxFps;
    let lastFrameTime: number | null = null;
    let elapsedTime = 0;

    const stop = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
      lastFrameTime = null;
    };

    const start = () => {
      if (animationFrameId || document.hidden) return;
      lastFrameTime = null;
      animationFrameId = requestAnimationFrame(animate);
    };

    const animate = (time: number) => {
      animationFrameId = 0;
      if (document.hidden) return;
      if (lastFrameTime !== null && time - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      const dt = lastFrameTime === null ? 1 / 60 : Math.min((time - lastFrameTime) / 1000, 0.05);
      lastFrameTime = time;
      elapsedTime += dt;

      updateWorld(
        objects,
        ctx.camera,
        {
          scrollProgress: scrollRef.current,
          cameraMode: cameraModeRef.current,
          droneFormation: droneFormationRef.current,
          djBeat: djBeatRef.current,
          botControl: botControlRef.current,
          isDragging: drag.isDragging.current,
        },
        dt,
        elapsedTime,
        () => onBotGoalRef.current()
      );

      ctx.renderer.render(ctx.scene, ctx.camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      detachResize();
      drag.dispose();
      ctx.dispose();
    };
  }, []);

  const freeLook = cameraMode === 'orbit' || cameraMode === 'fpv';
  return <div ref={mountRef} className={`three-mount ${freeLook ? 'free-look' : ''}`} />;
}

export default memo(ThreeScene);
