const SAME_PERSON_THRESHOLD = 0.55;

export function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += (desc1[i] - desc2[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function verifySamePerson(descriptors) {
  const keys = Object.keys(descriptors).filter((k) => descriptors[k] != null);

  if (keys.length < 2) {
    return { same: true, pairs: [], message: "Need at least 2 photos to verify." };
  }

  const pairs = [];
  let worstDistance = 0;
  let worstPair = null;

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const dist = euclideanDistance(descriptors[keys[i]], descriptors[keys[j]]);
      const match = dist < SAME_PERSON_THRESHOLD;
      pairs.push({
        slotA: keys[i],
        slotB: keys[j],
        distance: dist,
        match,
      });
      if (dist > worstDistance) {
        worstDistance = dist;
        worstPair = [keys[i], keys[j]];
      }
    }
  }

  const failedPairs = pairs.filter((p) => !p.match);
  const same = failedPairs.length === 0;

  let message = null;
  if (!same && worstPair) {
    const slotLabels = {
      front: "Front",
      leftThreeQuarter: "Left 3/4",
      rightThreeQuarter: "Right 3/4",
      leftProfile: "Left Profile",
      rightProfile: "Right Profile",
      chinUp: "Chin Up",
    };
    const a = slotLabels[worstPair[0]] || worstPair[0];
    const b = slotLabels[worstPair[1]] || worstPair[1];
    message = `The ${a} and ${b} photos don't appear to be the same person. Please use photos of the same face.`;
  }

  return { same, pairs, failedPairs, message };
}

export function addDescriptor(existing, slot, descriptor) {
  const updated = { ...existing, [slot]: descriptor };
  return updated;
}
