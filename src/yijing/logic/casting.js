// Three-coin method: each coin is heads(3) or tails(2), sum of 3 coins
// Heads = yang side = 3, Tails = yin side = 2
// 6 = old yin (changing), 7 = young yang, 8 = young yin, 9 = old yang (changing)
export function castThreeCoins() {
  const coins = [0, 0, 0].map(() => Math.random() < 0.5 ? 3 : 2);
  const sum = coins[0] + coins[1] + coins[2];
  return { coins, sum, lineValue: sum };
}

// Yarrow stalk method: full 49-stalk, three-manipulation algorithm
// Probabilities: 6 ≈ 1/16, 7 ≈ 5/16, 8 ≈ 7/16, 9 ≈ 3/16
// 50 stalks total; 1 is set aside permanently (the "observer"), leaving 49.
// Each of 3 operations: divide the pile, take 1 from right, count both sides by 4s.
// First operation removes 5 (prob 3/4) or 9 (prob 1/4).
// Second and third each remove 4 (prob ~1/2) or 8 (prob ~1/2).
// Final remaining / 4 gives the line value: 6, 7, 8, or 9.
export function castYarrowStalk() {
  let stalks = 49;
  const remainders = [];

  for (let division = 0; division < 3; division++) {
    // Divide heap randomly into two piles
    const leftPile = Math.floor(Math.random() * (stalks - 1)) + 1;
    const rightPile = stalks - leftPile;

    // Take one from the right pile, place between fingers
    let right = rightPile - 1;
    let between = 1;

    // Count off left pile by fours
    const leftRemainder = leftPile % 4 || 4;
    between += leftRemainder;

    // Count off right pile by fours
    const rightRemainder = right % 4 || 4;
    between += rightRemainder;

    remainders.push(between);
    stalks -= between;
  }

  // The number of groups of 4 in the remaining stalks determines the line
  const groups = stalks / 4;
  // groups can be 6, 7, 8, or 9
  return { remainders, stalks, lineValue: groups };
}

export function castLine(method) {
  if (method === 'yarrow') {
    return castYarrowStalk();
  }
  return castThreeCoins();
}

export function castHexagram(method) {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    lines.push(castLine(method));
  }
  return lines;
}

export function lineValueToType(value) {
  switch (value) {
    case 6: return { yin: true, changing: true, label: 'Old Yin', symbol: '⚋', marker: '×' };
    case 7: return { yin: false, changing: false, label: 'Young Yang', symbol: '⚊', marker: '' };
    case 8: return { yin: true, changing: false, label: 'Young Yin', symbol: '⚋', marker: '' };
    case 9: return { yin: false, changing: true, label: 'Old Yang', symbol: '⚊', marker: '○' };
    default: return { yin: false, changing: false, label: 'Unknown', symbol: '?', marker: '' };
  }
}

export function linesToBinary(lines) {
  return lines.map(l => {
    const type = lineValueToType(l.lineValue);
    return type.yin ? '0' : '1';
  });
}

export function getTransformedLines(lines) {
  return lines.map(l => {
    const type = lineValueToType(l.lineValue);
    if (type.changing) {
      return { ...l, lineValue: type.yin ? 7 : 8 }; // flip: old yin→young yang, old yang→young yin
    }
    return l;
  });
}
