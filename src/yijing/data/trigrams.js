export const TRIGRAMS = {
  '111': { name: '乾', pinyin: 'Qián', english: 'Heaven', symbol: '☰', element: 'Metal/Heaven', direction: 'Northwest', family: 'Father', keywords: 'Creative, strong, initiating', image: 'Heaven, sky' },
  '000': { name: '坤', pinyin: 'Kūn', english: 'Earth', symbol: '☷', element: 'Earth', direction: 'Southwest', family: 'Mother', keywords: 'Receptive, yielding, devoted', image: 'Earth, ground' },
  '100': { name: '震', pinyin: 'Zhèn', english: 'Thunder', symbol: '☳', element: 'Wood', direction: 'East', family: 'Eldest Son', keywords: 'Arousing, movement, initiative', image: 'Thunder, lightning' },
  '010': { name: '坎', pinyin: 'Kǎn', english: 'Water', symbol: '☵', element: 'Water', direction: 'North', family: 'Middle Son', keywords: 'Abysmal, danger, flowing', image: 'Water, rain, moon' },
  '001': { name: '艮', pinyin: 'Gèn', english: 'Mountain', symbol: '☶', element: 'Earth', direction: 'Northeast', family: 'Youngest Son', keywords: 'Stillness, stopping, meditation', image: 'Mountain, gate' },
  '011': { name: '巽', pinyin: 'Xùn', english: 'Wind', symbol: '☴', element: 'Wood', direction: 'Southeast', family: 'Eldest Daughter', keywords: 'Gentle, penetrating, following', image: 'Wind, wood' },
  '101': { name: '離', pinyin: 'Lí', english: 'Fire', symbol: '☲', element: 'Fire', direction: 'South', family: 'Middle Daughter', keywords: 'Clinging, clarity, brightness', image: 'Fire, sun, lightning' },
  '110': { name: '兌', pinyin: 'Duì', english: 'Lake', symbol: '☱', element: 'Metal', direction: 'West', family: 'Youngest Daughter', keywords: 'Joyous, open, pleasure', image: 'Lake, marsh, mist' },
};

export const TRIGRAM_ORDER = ['111', '000', '100', '010', '001', '011', '101', '110'];

export function getTrigramInfo(bits) {
  return TRIGRAMS[bits] || null;
}
