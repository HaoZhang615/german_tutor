import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  audioContext?: AudioContext;
  sourceNode?: AudioNode | null;
  isActive: boolean;
  color?: string;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioContext,
  sourceNode,
  isActive,
  color = '#FFCC00',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  const pointsCount = 20;
  const pointsRef = useRef<number[]>(new Array(pointsCount).fill(0));

  useEffect(() => {
    if (!audioContext || !sourceNode || !isActive) {
      return;
    }

    try {
      if (!analyserRef.current || analyserRef.current.context !== audioContext) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.5;
      }

      sourceNode.connect(analyserRef.current);

      return () => {
        try {
          sourceNode.disconnect(analyserRef.current!);
        } catch (e) {
          console.warn('Error disconnecting visualizer node:', e);
        }
      };
    } catch (error) {
      console.error('Error setting up audio visualizer:', error);
    }
  }, [audioContext, sourceNode, isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const render = () => {
      const container = containerRef.current;
      if (container) {
        const { clientWidth, clientHeight } = container;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;

      let dataArray: Float32Array<ArrayBuffer> | null = null;
      
      if (isActive && analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const buffer = new ArrayBuffer(bufferLength * 4);
        dataArray = new Float32Array(buffer);
        analyserRef.current.getFloatTimeDomainData(dataArray);
      }

      const lerpFactor = 0.3;
      const amplitudeScale = 10.0;
      const points = pointsRef.current;

      for (let i = 0; i < pointsCount; i++) {
        let targetY = 0;

        if (dataArray) {
          const bufferIndex = Math.floor((i / (pointsCount - 1)) * dataArray.length);
          const val = dataArray[bufferIndex] || 0;

          // Window function: Sine window to pin ends (0 at i=0 and i=max, 1 at center)
          // This creates the "guitar string" effect where ends are fixed
          const normalization = i / (pointsCount - 1);
          const window = Math.sin(normalization * Math.PI);

          targetY = val * (height * 0.4) * amplitudeScale * window;
        }

        // Apply LERP for smoothing: current = current + (target - current) * factor
        points[i] += (targetY - points[i]) * lerpFactor;
      }

      ctx.beginPath();
      
      ctx.moveTo(0, centerY + points[0]);

      // Technique: Draw quadratic curve to the midpoint between current and next point
      // This ensures a smooth continuous curve through all control points
      for (let i = 0; i < pointsCount - 1; i++) {
        const x1 = (i / (pointsCount - 1)) * width;
        const y1 = centerY + points[i];
        
        const x2 = ((i + 1) / (pointsCount - 1)) * width;
        const y2 = centerY + points[i + 1];

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        if (i === 0) {
           ctx.lineTo(x1, y1);
        }
        
        ctx.quadraticCurveTo(x1, y1, midX, midY);
      }

      const lastX = width;
      const lastY = centerY + points[pointsCount - 1];
      ctx.lineTo(lastX, lastY);

      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, color]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full min-h-[60px] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
