import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createRikinCharacter } from "./utils/character";
import setLighting from "./utils/lighting";
import { setupAnimations } from "./utils/animationUtils";
import { createMouseTracker } from "./utils/mouseUtils";
import handleResize from "./utils/resizeUtils";
import { useLoading } from "../../context/LoadingProvider";
import { setProgress } from "../Loading";
import { setCharTimeline, setAllTimeline } from "../utils/GsapScroll";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();
  const [chatThinking, setChatThinking] = useState(false);
  const chatThinkingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onChatLoading = (event: Event) => {
      const custom = event as CustomEvent<{ loading?: boolean }>;
      const isLoading = !!custom.detail?.loading;

      if (isLoading) {
        // Show instantly when a question is sent
        if (chatThinkingTimeoutRef.current !== null) {
          window.clearTimeout(chatThinkingTimeoutRef.current);
        }
        setChatThinking(true);
      } else {
        // Keep indicator for a short moment so it doesn't vanish too fast
        if (chatThinkingTimeoutRef.current !== null) {
          window.clearTimeout(chatThinkingTimeoutRef.current);
        }
        chatThinkingTimeoutRef.current = window.setTimeout(() => {
          setChatThinking(false);
          chatThinkingTimeoutRef.current = null;
        }, 650);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("rikin-chat-loading", onChatLoading);
    }
    if (!canvasDiv.current) {
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("rikin-chat-loading", onChatLoading);
        }
      };
    }

    const rect = canvasDiv.current.getBoundingClientRect();
    const container = {
      width: Math.max(rect.width, window.innerWidth),
      height: Math.max(rect.height, window.innerHeight),
    };
    const aspect = container.width / container.height;

    const scene = new THREE.Scene();

    const mobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (window.innerWidth <= 1024 && "ontouchstart" in window);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: mobile ? "default" : "high-performance",
    });
    renderer.setSize(container.width, container.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 100);
    camera.position.set(0, 0.15, mobile ? 4.3 : 4.8);
    camera.lookAt(0, 0.25, 0);

    // Loading progress — driven by real model download
    const progress = setProgress((value) => setLoading(value));

    // Lighting
    const light = setLighting(scene);

    // Build character with real loading progress
    const refs = createRikinCharacter(
      (pct) => {
        progress.setPercent(pct);
      },
      () => {
        // Model loaded — finish progress and turn on lights
        progress.loaded().then(() => {
          setTimeout(() => {
            light.turnOnLights();
          }, 2500);
        });
      }
    );
    scene.add(refs.character);

    // Animations
    const animations = setupAnimations(refs);

    // Mouse tracking (disabled on touch devices to avoid jitter)
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const mouseTracker = createMouseTracker({
      headGroup: refs.headGroup,
      leftPupil: refs.leftPupil,
      rightPupil: refs.rightPupil,
    });
    if (!isTouchDevice) {
      mouseTracker.attach(document);
    }

    // Eyebrow hover on character hover area (if we have brow refs)
    if (hoverDivRef.current && refs.leftBrow && refs.rightBrow) {
      const browRestL = refs.leftBrow.position.y;
      const browRestR = refs.rightBrow.position.y;
      const onHover = () => {
        refs.leftBrow!.position.y = browRestL + 0.02;
        refs.rightBrow!.position.y = browRestR + 0.02;
      };
      const onLeave = () => {
        refs.leftBrow!.position.y = browRestL;
        refs.rightBrow!.position.y = browRestR;
      };
      hoverDivRef.current.addEventListener("mouseenter", onHover);
      hoverDivRef.current.addEventListener("mouseleave", onLeave);
    }

    // GSAP scroll timelines
    setCharTimeline(refs.character, camera);
    setAllTimeline();

    // Resize
    const onResize = () =>
      handleResize(renderer, camera, canvasDiv, refs.character);
    window.addEventListener("resize", onResize);

    // Track scroll position via event instead of reading scrollY every frame
    let cachedScrollY = window.scrollY;
    const onScroll = () => { cachedScrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    let isPageVisible = document.visibilityState === "visible";
    const onVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const clock = new THREE.Clock();
    let animFrameId: number;
    const targetFps = mobile ? 30 : 48;
    const frameInterval = 1000 / targetFps;
    let lastFrameTime = 0;
    // Throttle render on mobile — every other frame
    const mobileSkip = mobile ? 2 : 1;
    let frameCount = 0;

    // Character is visible through landing + about + whatIDo sections.
    // Use the character-model element's visibility to determine rendering.
    const charEl = canvasDiv.current;
    const isCharVisible = () => {
      if (!charEl) return cachedScrollY < 500;
      const rect = charEl.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const animate = (now = 0) => {
      animFrameId = requestAnimationFrame(animate);
      if (!isPageVisible) return;
      if (now - lastFrameTime < frameInterval) return;
      lastFrameTime = now;
      if (!isCharVisible()) return;
      frameCount++;
      const elapsed = clock.getElapsedTime();
      animations.update(elapsed);
      if (cachedScrollY < 300) mouseTracker.update();
      if (frameCount % mobileSkip === 0) {
        renderer.render(scene, camera);
      }
    };
    animate(performance.now());

    // Handle WebGL context loss gracefully
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animFrameId);
    };
    const onContextRestored = () => {
      animate(performance.now());
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (chatThinkingTimeoutRef.current !== null) {
        window.clearTimeout(chatThinkingTimeoutRef.current);
      }
      animations.dispose();
      mouseTracker.detach();
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      scene.clear();
      renderer.dispose();
      if (canvasDiv.current) {
        canvasDiv.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("rikin-chat-loading", onChatLoading);
    };
  }, []);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div className="character-hover" ref={hoverDivRef}></div>
      </div>
      {chatThinking && (
        <div className="avatar-thinking">
          <div className="avatar-thinking-core">
            <div className="avatar-thinking-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="avatar-thinking-text">Thinking…</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scene;
