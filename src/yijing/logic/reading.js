import { getChangingLineIndices } from './hexagram.js';
import { lineValueToType } from './casting.js';

export function getReadingRules(lines, primary, transformed) {
  const changingIndices = getChangingLineIndices(lines);
  const count = changingIndices.length;

  const rules = {
    changingCount: count,
    changingLines: changingIndices,
    primary,
    transformed,
    instruction: '',
    governingTexts: [],
  };

  if (count === 0) {
    rules.instruction = 'No changing lines. Read the Judgment of the primary hexagram for your answer.';
    rules.governingTexts.push({
      source: 'primary',
      type: 'judgment',
      text: primary.judgment,
      label: `${primary.chinese} ${primary.pinyin} — Judgment`,
    });
  } else if (count === 1) {
    const idx = changingIndices[0];
    rules.instruction = `One changing line (line ${idx + 1}). This line's statement is the key to your reading.`;
    rules.governingTexts.push({
      source: 'primary',
      type: 'line',
      lineIndex: idx,
      text: primary.lines[idx],
      label: `${primary.chinese} — Line ${idx + 1}`,
    });
  } else if (count === 2) {
    rules.instruction = `Two changing lines (lines ${changingIndices.map(i => i + 1).join(' and ')}). Read both line statements; the upper line carries more weight.`;
    changingIndices.forEach(idx => {
      rules.governingTexts.push({
        source: 'primary',
        type: 'line',
        lineIndex: idx,
        text: primary.lines[idx],
        label: `${primary.chinese} — Line ${idx + 1}${idx === Math.max(...changingIndices) ? ' (primary)' : ''}`,
      });
    });
  } else if (count === 3) {
    rules.instruction = 'Three changing lines. Read the Judgments of both hexagrams; the primary hexagram carries more weight as the present situation.';
    rules.governingTexts.push({
      source: 'primary',
      type: 'judgment',
      text: primary.judgment,
      label: `${primary.chinese} ${primary.pinyin} — Judgment (primary weight)`,
    });
    if (transformed) {
      rules.governingTexts.push({
        source: 'transformed',
        type: 'judgment',
        text: transformed.judgment,
        label: `${transformed.chinese} ${transformed.pinyin} — Judgment (secondary weight)`,
      });
    }
  } else if (count === 4) {
    const unchangedIndices = lines
      .map((_, i) => !lineValueToType(lines[i].lineValue).changing ? i : -1)
      .filter(i => i !== -1);
    rules.instruction = `Four changing lines. Read the two unchanged lines of the transformed hexagram; the lower unchanged line carries more weight.`;
    if (transformed) {
      unchangedIndices.forEach(idx => {
        rules.governingTexts.push({
          source: 'transformed',
          type: 'line',
          lineIndex: idx,
          text: transformed.lines[idx],
          label: `${transformed.chinese} — Line ${idx + 1}${idx === Math.min(...unchangedIndices) ? ' (primary weight)' : ''}`,
        });
      });
    }
  } else if (count === 5) {
    const unchangedIdx = lines
      .map((_, i) => !lineValueToType(lines[i].lineValue).changing ? i : -1)
      .filter(i => i !== -1)[0];
    rules.instruction = `Five changing lines. Read the single unchanged line of the transformed hexagram.`;
    if (transformed) {
      rules.governingTexts.push({
        source: 'transformed',
        type: 'line',
        lineIndex: unchangedIdx,
        text: transformed.lines[unchangedIdx],
        label: `${transformed.chinese} — Line ${unchangedIdx + 1}`,
      });
    }
  } else if (count === 6) {
    if (primary.number === 1) {
      rules.instruction = 'All six lines are changing. For Hexagram 1 (Qián), the special "all nines" text applies: "There appears a flight of dragons without heads. Good fortune."';
      rules.governingTexts.push({
        source: 'primary',
        type: 'special',
        text: 'A flight of dragons without heads appears — this signifies the virtue of flexibility and the absence of rigid leadership. All things find their proper course. Good fortune.',
        label: `${primary.chinese} — All Nines (用九)`,
      });
    } else if (primary.number === 2) {
      rules.instruction = 'All six lines are changing. For Hexagram 2 (Kūn), the special "all sixes" text applies: "Lasting perseverance is favorable."';
      rules.governingTexts.push({
        source: 'primary',
        type: 'special',
        text: 'Enduring constancy bears fruit. When all yields and transforms, steadfast devotion to the receptive way brings lasting benefit.',
        label: `${primary.chinese} — All Sixes (用六)`,
      });
    } else {
      rules.instruction = 'All six lines are changing. Read the Judgment of the transformed hexagram.';
      if (transformed) {
        rules.governingTexts.push({
          source: 'transformed',
          type: 'judgment',
          text: transformed.judgment,
          label: `${transformed.chinese} ${transformed.pinyin} — Judgment`,
        });
      }
    }
  }

  return rules;
}

export function describeTransformation(primary, transformed, changingCount) {
  if (!transformed || changingCount === 0) return null;
  return `Your reading moves from ${primary.chinese} (${primary.pinyin}, "${primary.english}") to ${transformed.chinese} (${transformed.pinyin}, "${transformed.english}"). The primary hexagram describes your present situation, while the transformed hexagram reveals the direction of change — where circumstances are heading as the changing forces in your situation resolve.`;
}
