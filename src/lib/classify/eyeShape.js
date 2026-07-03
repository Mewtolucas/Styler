export function classifyEyeShape(landmarks) {
  const leftInner = landmarks[133];
  const leftOuter = landmarks[33];
  const leftUpper = landmarks[159];
  const leftLower = landmarks[145];
  const leftUpperLid = landmarks[160];

  const rightInner = landmarks[362];
  const rightOuter = landmarks[263];
  const rightUpper = landmarks[386];
  const rightLower = landmarks[374];
  const rightUpperLid = landmarks[387];

  const results = [];

  for (const eye of [
    { inner: leftInner, outer: leftOuter, upper: leftUpper, lower: leftLower, lid: leftUpperLid },
    { inner: rightInner, outer: rightOuter, upper: rightUpper, lower: rightLower, lid: rightUpperLid },
  ]) {
    const width = Math.abs(eye.outer.x - eye.inner.x);
    const height = Math.abs(eye.upper.y - eye.lower.y);
    const aspect = width > 0.001 ? height / width : 0.3;

    const canthalTilt = eye.outer.y - eye.inner.y;
    const tiltNorm = width > 0.001 ? canthalTilt / width : 0;

    const creaseSpace = Math.abs(eye.lid.y - eye.upper.y);
    const creaseRatio = height > 0.001 ? creaseSpace / height : 0;

    let shape = "almond";

    if (creaseRatio < 0.15) {
      shape = "monolid";
    } else if (creaseRatio < 0.3 && aspect < 0.35) {
      shape = "hooded";
    } else if (aspect > 0.42) {
      shape = "round";
    } else if (tiltNorm < -0.08) {
      shape = "upturned";
    } else if (tiltNorm > 0.06) {
      shape = "downturned";
    }

    results.push({ shape, width, height, aspect, canthalTilt, tiltNorm, creaseSpace, creaseRatio });
  }

  const label = results[0].shape === results[1].shape
    ? results[0].shape
    : `${results[0].shape}-${results[1].shape}`;

  return {
    label,
    proportions: {
      leftEye: results[0],
      rightEye: results[1],
    },
  };
}
