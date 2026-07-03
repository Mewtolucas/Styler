const hairstyleProportions = {
  // --- Facial thirds ---
  longForehead: {
    title: "Hairstyle Adjustment: Long Forehead",
    body: "Your forehead is proportionally taller than your midface and lower face. Bangs are the most direct correction — full bangs, curtain bangs, or a textured fringe cover part of the forehead and visually shorten the upper third. If you prefer no bangs, forward-directed styling at the hairline (not swept back) keeps the forehead from being fully exposed. Avoid slicked-back styles, high pompadours, and pulled-back ponytails that reveal the full forehead height. A side part with hair falling across the upper forehead is a good middle ground."
  },
  shortForehead: {
    title: "Hairstyle Adjustment: Short Forehead",
    body: "Your forehead is proportionally shorter than your midface and lower face. Avoid bangs — they cover what's already compact and make the forehead feel even smaller. Swept-back styles, volume at the crown, and off-the-face styling all reveal the forehead and make it read as taller. A pompadour, quiff, or volume lift at the root line adds height above the brow that extends the visual forehead. High ponytails and top knots also open up the forehead area."
  },
  longMidface: {
    title: "Hairstyle Adjustment: Long Midface",
    body: "The distance from your brows to the base of your nose is proportionally longer than the other thirds. Hairstyles that add width at the cheekbone level visually compress the midface — layers starting at the cheekbone, side volume, and face-framing pieces that sit at nose level all help. Avoid very long, flat styles that pull the eye downward through the midface without interruption. A fringe or bangs paired with cheekbone-level layers creates two horizontal breaks that partition the long midface into shorter visual segments."
  },
  shortMidface: {
    title: "Hairstyle Adjustment: Short Midface",
    body: "The distance from your brows to the base of your nose is proportionally shorter than the other thirds. Avoid heavy face-framing layers at the cheekbone level, which compress the midface further. Longer, sleeker styles that don't add width at the mid-face keep the area visually open. Styles that add height at the crown lift the brows upward and extend the visual midface. Tuck hair behind the ears to open the midface rather than framing it."
  },
  longLowerFace: {
    title: "Hairstyle Adjustment: Long Lower Face",
    body: "The distance from the base of your nose to your chin is proportionally longer than the other thirds. Chin-length styles (bobs, lobs ending at the chin) create a horizontal break across the lower face that shortens it visually. Face-framing layers ending at the chin draw the eye to the midpoint of the lower face rather than the full distance. Avoid very long, straight hair that extends the vertical line below the chin. For shorter styles, width at the jawline — through volume, layers, or curls — breaks up the long lower third."
  },
  shortLowerFace: {
    title: "Hairstyle Adjustment: Short Lower Face",
    body: "The distance from the base of your nose to your chin is proportionally shorter than the other thirds. Avoid chin-length bobs and blunt cuts that end right at the jaw — they emphasize where the face ends abruptly. Longer styles that fall past the chin extend the visual lower face. Volume above the jaw (at the cheekbone or higher) shifts the eye upward and makes the lower face feel proportional. A longer, tapered beard (men) visually extends the chin line."
  },
  balancedThirds: {
    title: "Balanced Facial Thirds",
    body: "Your forehead, midface, and lower face are roughly equal in height — this is the classical ideal proportion. You have the flexibility to choose hairstyles based on face shape, hair texture, and personal preference rather than needing to correct a thirds imbalance. Most style rules for your face shape apply cleanly without adjustment."
  },

  // --- Face width-to-height ratio ---
  narrowFace: {
    title: "Hairstyle Adjustment: Narrow Face",
    body: "Your face is taller than it is wide. Hairstyles that add width at the sides balance this — layers with volume at the cheekbones, side-swept styles, and wavy or curly textures that expand horizontally all help. Avoid very long, straight styles with no volume, which pull the eye downward and make the face read even narrower. A chin-length or shoulder-length cut with body creates a wider frame. Side parts work better than center parts, which emphasize vertical length."
  },
  wideFace: {
    title: "Hairstyle Adjustment: Wide Face",
    body: "Your face is wider relative to its height. Hairstyles that add height on top and length below the chin elongate the face visually. Volume at the crown — pompadours, quiffs, top knots, or teased roots — stretches the vertical line. Avoid very short, wide styles that sit flat on top and expand at the sides. Longer styles that fall past the jawline draw the eye downward. A center part creates a vertical line that visually narrows the face."
  },

  // --- Jaw width ---
  wideJaw: {
    title: "Hairstyle Adjustment: Wide Jaw",
    body: "Your jaw is wide relative to your cheekbones. Styles that add volume above the jaw — at the cheekbone or temple level — balance the proportions by widening the upper face to match. Avoid blunt, chin-length cuts that end right at the jawline, as they draw a horizontal line across the widest point. Longer layers that fall past the jaw soften its visual weight. Soft waves or curls at cheekbone height shift the eye upward. For shorter cuts, texture on top with tapered sides works well."
  },
  narrowJaw: {
    title: "Hairstyle Adjustment: Narrow Jaw",
    body: "Your jaw is narrow relative to your cheekbones, giving a more tapered or V-shaped lower face. Chin-length styles — bobs, lobs, or layers ending at the jaw — add visual width where the face narrows. Volume or curls at the jawline fill out the lower face. Avoid heavy volume at the temples or crown with nothing at the jaw, which exaggerates the taper. A soft, layered cut that frames the jawline gives the lower face more presence."
  },

  // --- Forehead width ---
  wideForehead: {
    title: "Hairstyle Adjustment: Wide Forehead",
    body: "Your forehead is wide relative to your cheekbones. Side-swept bangs, curtain bangs, or angled fringe cover the outer edges of the forehead and visually narrow it. Avoid pulling hair straight back or using a center part with hair tucked behind the ears, which exposes the full forehead width. A deep side part brings hair across the forehead at an angle that breaks the wide horizontal line. Volume at the cheekbones and jaw helps balance the wider forehead above."
  },
  narrowForehead: {
    title: "Hairstyle Adjustment: Narrow Forehead",
    body: "Your forehead is narrow relative to your cheekbones. Styles that add volume or width at the temples open up the forehead area — blow-dried volume at the roots, side volume, or a voluminous fringe all help. Avoid heavy, full bangs that compress the forehead further. Off-the-face styling at the hairline reveals the forehead and lets it read wider. A layered cut that builds outward at the temple level balances the wider cheekbone area below."
  },

  // --- Face length ---
  longFace: {
    title: "Hairstyle Adjustment: Long Face",
    body: "Your face is long relative to its width. Horizontal visual breaks shorten it — bangs create a strong horizontal line across the forehead, chin-length cuts create another at the jaw, and layers at the cheekbone add a third. Avoid very long, one-length styles that follow the vertical line without interruption. Side volume expands the face horizontally and counteracts the length. A textured bob or lob with bangs is particularly effective. For men, a textured crop with a fringe shortens the visual face."
  },
  shortFace: {
    title: "Hairstyle Adjustment: Short Face",
    body: "Your face is short relative to its width. Height on top elongates it — volume at the crown, a pompadour, a high top knot, or teased roots all add vertical length. Avoid blunt bangs that cut the face shorter, and avoid very short, flat styles. Longer styles that fall below the chin extend the visual face downward. A center part creates a vertical line that adds perceived length. Layers that start below the chin keep the longer vertical line intact."
  },

  // --- Cheekbone prominence ---
  prominentCheekbones: {
    title: "Hairstyle Adjustment: Prominent Cheekbones",
    body: "Your cheekbones are the widest point of your face. Face-framing layers at cheekbone height can either showcase or soften them depending on the look you want. To emphasize them, pull hair back or tuck it behind the ears so the cheekbone line is visible — high ponytails and slicked-back styles highlight this structure. To soften, let layers or waves fall across the cheekbone area. Avoid styles that add maximum width right at the cheekbone if you want to downplay them."
  },
  flatCheekbones: {
    title: "Hairstyle Adjustment: Flat Cheekbones",
    body: "Your cheekbones are less prominent, giving your face a flatter profile at the midface. Styles that add volume at the cheekbone level create the illusion of more structure — layers starting at the cheekbone, waves or curls that expand at mid-face height, and face-framing pieces all help. Avoid styles that are flat and close to the head at the sides, which make the midface look even flatter. A textured cut with body at the cheeks gives the face more dimension."
  },

  // --- Chin projection (hairstyle angle) ---
  shortChin: {
    title: "Hairstyle Adjustment: Short Chin",
    body: "Your chin projects less than average, which can make the lower face feel recessed. Styles that add volume or movement at the jawline bring the lower face forward visually. Layers ending at the chin or just below frame the jaw and give it more presence. Avoid very heavy, long styles that fall straight past the chin without interacting with it — they make the chin disappear. A bob or lob that curves inward at the jaw adds fullness where the chin recedes."
  },
  longChin: {
    title: "Hairstyle Adjustment: Long Chin",
    body: "Your chin is prominent, projecting forward or appearing longer than the midface would suggest. Styles that draw attention upward — volume at the crown, bangs, or face-framing layers at the cheekbone — shift the visual center of the face above the chin. Avoid very short styles that expose the full jawline and chin, or chin-length cuts that end right at the chin point and emphasize it. Longer styles that fall past the chin soften its prominence by not ending at its widest point."
  },

  // --- Eye spacing ---
  wideSetEyes: {
    title: "Hairstyle Adjustment: Wide-Set Eyes",
    body: "Your eyes are spaced wider than the width of one eye apart. A center part draws the eye inward and visually narrows the gap — it creates a vertical line between the eyes. Avoid heavy side-swept bangs that expose one temple fully, which can make the wider spacing more apparent on one side. Bangs with more density at the center or a fringe that draws attention to the bridge of the nose help. Volume at the center of the head rather than the sides focuses the visual weight inward."
  },
  closeSetEyes: {
    title: "Hairstyle Adjustment: Close-Set Eyes",
    body: "Your eyes are spaced closer than the width of one eye apart. A side part draws attention outward and away from the center. Side-swept bangs or a swooping fringe that moves toward the temples widens the visual gap. Avoid a center part with flat hair, which draws focus to the narrow space between the eyes. Volume at the sides and temples expands the face outward. Face-framing pieces that fan away from the center also help create the illusion of wider spacing."
  },
};

export default hairstyleProportions;
