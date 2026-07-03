export function mapLandmarks68to468(landmarks68, imgWidth, imgHeight) {
  const positions = landmarks68.positions || landmarks68._positions;
  if (!positions || positions.length < 68) return null;

  const norm = (p) => ({ x: p.x / imgWidth, y: p.y / imgHeight, z: 0 });
  const mid = (a, b) => ({
    x: (a.x + b.x) / 2 / imgWidth,
    y: (a.y + b.y) / 2 / imgHeight,
    z: 0,
  });

  const sparse = [];

  // Nose tip: MP 1 → FA 30
  sparse[1] = norm(positions[30]);

  // Nose side: MP 2 → FA 31
  sparse[2] = norm(positions[31]);

  // Forehead between brows: MP 9 → FA 27
  sparse[9] = norm(positions[27]);

  // Top of head/hairline: MP 10 → extrapolate above brow center
  const browMidY = (positions[19].y + positions[24].y) / 2;
  const chinY = positions[8].y;
  const faceH = chinY - browMidY;
  sparse[10] = {
    x: ((positions[19].x + positions[24].x) / 2) / imgWidth,
    y: Math.max(0, (browMidY - faceH * 0.35)) / imgHeight,
    z: 0,
  };

  // Lower lip bottom: MP 17 → FA 57
  sparse[17] = norm(positions[57]);

  // Right forehead/eyebrow area: MP 21 → FA 19
  sparse[21] = norm(positions[19]);

  // Left eye outer: MP 33 → FA 36
  sparse[33] = norm(positions[36]);

  // Forehead/hairline right area: MP 54 → approximate from brow
  sparse[54] = norm(positions[17]);

  // Jaw contour left side of image (person's right)
  sparse[58] = norm(positions[4]);
  sparse[93] = norm(positions[2]);
  sparse[98] = norm(positions[31]);
  sparse[103] = norm(positions[17]);
  sparse[107] = norm(positions[21]);
  sparse[109] = norm(positions[21]);
  sparse[127] = norm(positions[0]);
  sparse[132] = norm(positions[3]);
  sparse[136] = norm(positions[6]);
  sparse[150] = norm(positions[7]);
  sparse[162] = norm(positions[0]);
  sparse[172] = norm(positions[5]);
  sparse[176] = mid(positions[7], positions[8]);

  // Chin: MP 152 → FA 8
  sparse[152] = norm(positions[8]);
  sparse[148] = norm(positions[7]);

  // Left eye (left side of image = FA 36-41)
  sparse[133] = norm(positions[39]);  // inner
  sparse[159] = mid(positions[37], positions[38]); // upper
  sparse[145] = mid(positions[40], positions[41]); // lower
  sparse[160] = norm(positions[37]);  // upper lid

  // Right cheekbone: MP 234 → FA 1
  sparse[234] = norm(positions[1]);

  // Left forehead: MP 251 → FA 24
  sparse[251] = norm(positions[24]);

  // Right eye (right side of image = FA 42-47)
  sparse[263] = norm(positions[45]); // outer
  sparse[362] = norm(positions[42]); // inner
  sparse[386] = mid(positions[43], positions[44]); // upper
  sparse[374] = mid(positions[46], positions[47]); // lower
  sparse[387] = norm(positions[44]); // upper lid

  // Forehead area left side
  sparse[251] = norm(positions[24]);

  // Jaw contour right side of image (person's left)
  sparse[284] = norm(positions[24]);
  sparse[288] = norm(positions[12]);
  sparse[293] = norm(positions[22]);
  sparse[296] = norm(positions[25]);
  sparse[297] = norm(positions[25]);
  sparse[300] = norm(positions[26]);
  sparse[323] = norm(positions[14]);
  sparse[327] = norm(positions[35]);
  sparse[332] = norm(positions[25]);
  sparse[334] = norm(positions[23]);
  sparse[336] = norm(positions[23]);
  sparse[338] = norm(positions[24]);
  sparse[356] = norm(positions[15]);
  sparse[361] = norm(positions[13]);
  sparse[365] = norm(positions[10]);
  sparse[379] = norm(positions[9]);
  sparse[389] = norm(positions[15]);
  sparse[397] = norm(positions[11]);
  sparse[400] = mid(positions[9], positions[8]);

  // Left cheekbone: MP 454 → FA 15
  sparse[454] = norm(positions[15]);

  // Cheek sample points for skin analysis
  sparse[205] = {
    x: (positions[3].x * 0.6 + positions[30].x * 0.4) / imgWidth,
    y: (positions[3].y * 0.5 + positions[30].y * 0.5) / imgHeight,
    z: 0,
  };
  sparse[425] = {
    x: (positions[13].x * 0.6 + positions[30].x * 0.4) / imgWidth,
    y: (positions[13].y * 0.5 + positions[30].y * 0.5) / imgHeight,
    z: 0,
  };

  // Nose bottom: MP 98 → FA 31, MP 327 → FA 35
  sparse[98] = norm(positions[31]);
  sparse[327] = norm(positions[35]);

  // Mouth area for LandmarkOverlay connections
  sparse[61] = norm(positions[48]);
  sparse[91] = norm(positions[50]);
  sparse[146] = norm(positions[49]);
  sparse[181] = norm(positions[51]);
  sparse[84] = norm(positions[52]);
  sparse[291] = norm(positions[54]);
  sparse[314] = norm(positions[52]);
  sparse[321] = norm(positions[55]);
  sparse[375] = norm(positions[55]);
  sparse[405] = norm(positions[53]);

  // Eye contour connections for overlay
  sparse[63] = norm(positions[37]);
  sparse[66] = norm(positions[38]);
  sparse[67] = norm(positions[17]);
  sparse[70] = norm(positions[36]);
  sparse[105] = norm(positions[38]);
  sparse[377] = norm(positions[8]);
  sparse[378] = mid(positions[8], positions[9]);

  return sparse;
}

export function convertLandmarks68ForOverlay(landmarks68, imgWidth, imgHeight) {
  const positions = landmarks68.positions || landmarks68._positions;
  if (!positions || positions.length < 68) return null;

  return positions.map((p) => ({
    x: p.x / imgWidth,
    y: p.y / imgHeight,
    z: 0,
  }));
}
