import { HEXAGRAMS } from '../data/hexagrams.js';
import { getTrigramInfo } from '../data/trigrams.js';
import { lineValueToType, linesToBinary, getTransformedLines } from './casting.js';

// King Wen lookup: maps binary representation (bottom-to-top) to King Wen number
// Binary: each line is 0 (yin) or 1 (yang), index 0 = bottom line
const KING_WEN_MAP = {};
HEXAGRAMS.forEach(h => {
  KING_WEN_MAP[h.binary] = h.number;
});

export function binaryToKingWen(binary) {
  const key = binary.join('');
  return KING_WEN_MAP[key] || null;
}

export function getHexagramByNumber(num) {
  return HEXAGRAMS.find(h => h.number === num) || null;
}

export function getHexagramByBinary(binary) {
  const key = Array.isArray(binary) ? binary.join('') : binary;
  return HEXAGRAMS.find(h => h.binary === key) || null;
}

export function identifyHexagram(lines) {
  const binary = linesToBinary(lines);
  return getHexagramByBinary(binary);
}

export function getTransformedHexagram(lines) {
  const transformed = getTransformedLines(lines);
  const binary = linesToBinary(transformed);
  return getHexagramByBinary(binary);
}

export function getChangingLineIndices(lines) {
  return lines
    .map((l, i) => lineValueToType(l.lineValue).changing ? i : -1)
    .filter(i => i !== -1);
}

// Nuclear hexagram: lines 2-3-4 form lower trigram, lines 3-4-5 form upper trigram
export function getNuclearHexagram(lines) {
  const binary = linesToBinary(lines);
  const nuclearBinary = [
    binary[1], binary[2], binary[3], // lower nuclear trigram (lines 2,3,4)
    binary[2], binary[3], binary[4], // upper nuclear trigram (lines 3,4,5)
  ];
  return getHexagramByBinary(nuclearBinary);
}

export function getTrigramsForHexagram(hexagram) {
  if (!hexagram) return { lower: null, upper: null };
  const b = hexagram.binary;
  const lowerBits = b.slice(0, 3);
  const upperBits = b.slice(3, 6);
  return {
    lower: getTrigramInfo(lowerBits),
    upper: getTrigramInfo(upperBits),
  };
}
