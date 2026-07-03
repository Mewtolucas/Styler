import { useState, useRef, useCallback } from "react";

const SLOTS = [
  {
    key: "front",
    label: "Front",
    description: "Face the camera directly, chin level.",
    icon: "◉",
  },
  {
    key: "profile",
    label: "Profile",
    description: "Turn to show your face from the side.",
    icon: "◐",
  },
  {
    key: "threequarter",
    label: "3/4 Angle",
    description: "Turn partway — both eyes visible, one closer.",
    icon: "◑",
  },
];

export default function PhotoUpload({ photos, onPhotoChange, validations }) {
  const [dragOver, setDragOver] = useState(null);

  const handleFile = useCallback(
    (slotKey, file) => {
      if (!file || !file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onPhotoChange(slotKey, url);
    },
    [onPhotoChange]
  );

  const handleDrop = useCallback(
    (slotKey, e) => {
      e.preventDefault();
      setDragOver(null);
      const file = e.dataTransfer.files[0];
      handleFile(slotKey, file);
    },
    [handleFile]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
      {SLOTS.map((slot) => {
        const photo = photos[slot.key];
        const validation = validations[slot.key];
        const inputRef = useRef();

        return (
          <div key={slot.key} className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{slot.icon}</span>
              <span className="font-display text-lg font-semibold tracking-tight text-ink">
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
                <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                  <div className="text-3xl text-stone mb-2">+</div>
                  <p className="text-sm text-clay leading-snug">
                    {slot.description}
                  </p>
                  <p className="text-xs text-stone mt-2">
                    Drop or click to upload
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
              <p className="text-sm text-error leading-snug text-center px-2">
                {validation.message}
              </p>
            )}
            {validation?.valid && (
              <p className="text-sm text-success">Ready</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
