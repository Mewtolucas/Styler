import { useRef, useEffect } from "react";

const JAWLINE_68 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
const LEFT_BROW_68 = [17,18,19,20,21];
const RIGHT_BROW_68 = [22,23,24,25,26];
const NOSE_BRIDGE_68 = [27,28,29,30];
const NOSE_BOTTOM_68 = [31,32,33,34,35];
const LEFT_EYE_68 = [36,37,38,39,40,41,36];
const RIGHT_EYE_68 = [42,43,44,45,46,47,42];
const OUTER_LIPS_68 = [48,49,50,51,52,53,54,55,56,57,58,59,48];

const GROUPS_68 = [
  JAWLINE_68, LEFT_BROW_68, RIGHT_BROW_68, NOSE_BRIDGE_68,
  NOSE_BOTTOM_68, LEFT_EYE_68, RIGHT_EYE_68, OUTER_LIPS_68,
];

export default function LandmarkOverlay({ landmarks, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    const is68 = landmarks.length <= 68;

    ctx.strokeStyle = "rgba(122, 138, 110, 0.35)";
    ctx.lineWidth = 1;

    if (is68) {
      for (const group of GROUPS_68) {
        ctx.beginPath();
        for (let i = 0; i < group.length; i++) {
          const pt = landmarks[group[i]];
          if (!pt) continue;
          if (i === 0) ctx.moveTo(pt.x * width, pt.y * height);
          else ctx.lineTo(pt.x * width, pt.y * height);
        }
        ctx.stroke();
      }
    }

    ctx.fillStyle = "rgba(122, 138, 110, 0.5)";
    const count = is68 ? 68 : landmarks.length;
    for (let i = 0; i < count; i++) {
      const pt = landmarks[i];
      if (!pt) continue;
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
