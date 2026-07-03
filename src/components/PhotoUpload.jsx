import { useState, useRef, useCallback } from "react";

const SLOTS = [
  {
    key: "front",
    label: "Front",
    description: "Face the camera directly, chin level.",
    icon: "◉",
  },
  {
    key: "leftThreeQuarter",
    label: "Left 3/4",
    description: "Turn left — both eyes visible, left side closer.",
    icon: "◑",
  },
  {
    key: "rightThreeQuarter",
    label: "Right 3/4",
    description: "Turn right — both eyes visible, right side closer.",
    icon: "◐",
  },
  {
    key: "leftProfile",
    label: "Left Profile",
    description: "Turn fully left to show your left side.",
    icon: "◑",
  },
  {
    key: "rightProfile",
    label: "Right Profile",
    description: "Turn fully right to show your right side.",
    icon: "◐",
  },
  {
    key: "chinUp",
    label: "Chin Up",
    description: "Tilt chin slightly upward, face toward camera.",
    icon: "◓",
  },
];

export default function PhotoUpload({ photos, onPhotoChange, validations }) {
  const [dragOver, setDragOver] = useState(null);

  const handleFile = useCallback(
    async (slotKey, file) => {
      if (!file || !file.type.startsWith("image/")) return;
      try {
        const bitmap = await createImageBitmap(file);
        const MAX = 1920;
        let w = bitmap.width;
        let h = bitmap.height;
        if (w > MAX || h > MAX) {
          const scale = MAX / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              onPhotoChange(slotKey, url);
            }
          },
          "image/jpeg",
          0.92
        );
      } catch {
        const url = URL.createObjectURL(file);
        onPhotoChange(slotKey, url);
      }
    },
    [onPhotoChange]
  );

  const handleDrop = useCallback(
    async (slotKey, e) => {
      e.preventDefault();
      setDragOver(null);
      const file = e.dataTransfer.files[0];
      await handleFile(slotKey, file);
    },
    [handleFile]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
      {SLOTS.map((slot) => {
        const photo = photos[slot.key];
        const validation = validations[slot.key];
        const inputRef = useRef();

        return (
          <div key={slot.key} className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{slot.icon}</span>
              <span className="font-display text-base font-semibold tracking-tight text-ink">
                {slot.label}
              </span>
            </div>

            <div
              className={`
                relative w-full aspect-[3/4] rounded-sm border-2 border-dashed
                cursor-pointer transition-colors overflow-hidden
                ${dragOver === slot.key ? "border-sage bg-sage-light" : ""}
                ${photo && validation?.valid ? "border-success" : ""}
                ${photo && validation && !validation.valid ? "border-error" : ""}
                ${!photo ? "border-stone hover:border-clay bg-warm-white" : ""}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(slot.key);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(slot.key, e)}
              onClick={() => inputRef.current?.click()}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={`${slot.label} photo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-3 text-center">
                  <div className="text-2xl text-stone mb-1">+</div>
                  <p className="text-xs text-clay leading-snug">
                    {slot.description}
                  </p>
                  <p className="text-[10px] text-stone mt-1">
                    Drop or tap to upload
                  </p>
                </div>
              )}

              {photo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPhotoChange(slot.key, null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/60 text-white text-sm flex items-center justify-center hover:bg-ink/80 transition-colors"
                >
                  ×
                </button>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(slot.key, e.target.files[0])}
              />
            </div>

            {validation && !validation.valid && (
              <p className="text-xs text-error leading-snug text-center px-1">
                {validation.message}
              </p>
            )}
            {validation?.valid && validation?.accepted && (
              <p className="text-xs text-clay">Accepted</p>
            )}
            {validation?.valid && !validation?.accepted && (
              <p className="text-xs text-success">Ready</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
