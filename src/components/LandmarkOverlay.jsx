import { useRef, useEffect } from "react";

const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
  378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
  162, 21, 54, 103, 67, 109, 10,
];

const CONNECTIONS = [
  [33, 133], [133, 362], [362, 263],
  [70, 63], [63, 105], [105, 66], [66, 107],
  [336, 296], [296, 334], [334, 293], [293, 300],
  [1, 2], [2, 98], [98, 327],
  [61, 146], [146, 91], [91, 181], [181, 84],
  [291, 375], [375, 321], [321, 405], [405, 314],
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

    ctx.strokeStyle = "rgba(122, 138, 110, 0.35)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let i = 0; i < FACE_OVAL.length - 1; i++) {
      const a = landmarks[FACE_OVAL[i]];
      const b = landmarks[FACE_OVAL[i + 1]];
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(122, 138, 110, 0.2)";
    for (const [i, j] of CONNECTIONS) {
      const a = landmarks[i];
      const b = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(122, 138, 110, 0.5)";
    for (const pt of landmarks) {
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
