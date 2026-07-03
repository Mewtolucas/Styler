import { useState, useCallback, useRef, useEffect } from "react";
import PhotoUpload from "./components/PhotoUpload.jsx";
import ResultsView from "./components/ResultsView.jsx";
import LandmarkOverlay from "./components/LandmarkOverlay.jsx";
import { initLandmarker, detectLandmarks } from "./lib/landmarks.js";
import { validatePhoto } from "./lib/mediapipeValidator.js";
import { analyzeFace } from "./lib/classify/index.js";
import { generateRecommendations } from "./lib/recommend/rules.js";

const STEPS = { AGE_GATE: 0, SETUP: 1, PHOTOS: 2, ANALYZING: 3, RESULTS: 4 };

const PHOTO_KEYS = [
  "front",
  "leftThreeQuarter",
  "rightThreeQuarter",
  "leftProfile",
  "rightProfile",
  "chinUp",
];

const SLOT_LABELS = {
  front: "Front",
  leftThreeQuarter: "Left 3/4",
  rightThreeQuarter: "Right 3/4",
  leftProfile: "Left Profile",
  rightProfile: "Right Profile",
  chinUp: "Chin Up",
};

const emptyPhotos = () =>
  Object.fromEntries(PHOTO_KEYS.map((k) => [k, null]));

export default function App() {
  const [step, setStep] = useState(STEPS.AGE_GATE);
  const [gender, setGender] = useState(null);
  const [ageBracket, setAgeBracket] = useState(null);
  const [photos, setPhotos] = useState(emptyPhotos);
  const [validations, setValidations] = useState({});
  const [classification, setClassification] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");
  const [frontLandmarks, setFrontLandmarks] = useState(null);
  const [frontDims, setFrontDims] = useState(null);
  const [profilerReady, setProfilerReady] = useState(false);
  const [confirmSlot, setConfirmSlot] = useState(null);

  const imageRefs = useRef({});
  const landmarkStore = useRef({});

  useEffect(() => {
    initLandmarker()
      .then(() => setProfilerReady(true))
      .catch((e) => console.error("MediaPipe init failed:", e));
  }, []);

  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  const getImageData = (img) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const handlePhotoChange = useCallback(async (slot, url) => {
    setPhotos((prev) => ({ ...prev, [slot]: url }));
    setValidations((prev) => ({ ...prev, [slot]: null }));
    setConfirmSlot(null);

    if (!url) {
      landmarkStore.current[slot] = null;
      return;
    }

    try {
      const img = await loadImage(url);
      imageRefs.current[slot] = img;

      const result = await validatePhoto(img, slot);

      if (result.quality && !result.quality.valid) {
        setValidations((prev) => ({
          ...prev,
          [slot]: { valid: false, message: result.message, quality: result.quality },
        }));
        landmarkStore.current[slot] = null;
        return;
      }

      if (result.needsConfirmation) {
        setConfirmSlot(slot);
        setValidations((prev) => ({
          ...prev,
          [slot]: { valid: false, message: result.message, pendingConfirmation: true },
        }));
        landmarkStore.current[slot] = null;
        return;
      }

      if (!result.slotValid) {
        setValidations((prev) => ({
          ...prev,
          [slot]: { valid: false, message: result.message, pose: result.pose },
        }));
        landmarkStore.current[slot] = null;
        return;
      }

      landmarkStore.current[slot] = result.landmarks;

      if (slot === "front" && result.landmarks) {
        setFrontLandmarks(result.landmarks);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setFrontDims({ width: w, height: h });
      }

      setValidations((prev) => ({
        ...prev,
        [slot]: {
          valid: true,
          quality: result.quality,
          pose: result.pose,
          slotClassification: result.slotClassification,
        },
      }));
    } catch (e) {
      setValidations((prev) => ({
        ...prev,
        [slot]: { valid: false, message: "Failed to process this image. Try a different photo." },
      }));
    }
  }, []);

  const handleConfirmPhoto = useCallback((slot, confirmed) => {
    setConfirmSlot(null);
    if (confirmed) {
      landmarkStore.current[slot] = null;
      setValidations((prev) => ({
        ...prev,
        [slot]: { valid: true, accepted: true, userConfirmed: true },
      }));
    } else {
      setPhotos((prev) => ({ ...prev, [slot]: null }));
      setValidations((prev) => ({ ...prev, [slot]: null }));
    }
  }, []);

  const allPhotosValid = PHOTO_KEYS.every(
    (k) => photos[k] && validations[k]?.valid
  );
  const canAnalyze = allPhotosValid && gender && ageBracket;

  const runAnalysis = async () => {
    setStep(STEPS.ANALYZING);
    setError(null);

    try {
      setProgress("Running detailed landmark detection...");

      const imgs = {};
      for (const key of PHOTO_KEYS) {
        imgs[key] = imageRefs.current[key] || (await loadImage(photos[key]));
      }

      const mpResults = {};
      for (const key of PHOTO_KEYS) {
        setProgress(`Detecting landmarks: ${key}...`);
        const stored = landmarkStore.current[key];
        if (stored) {
          mpResults[key] = { landmarks: stored, noDetection: false };
        } else {
          const res = await detectLandmarks(imgs[key], key);
          mpResults[key] = res || { landmarks: null, noDetection: true };
        }
      }

      if (!mpResults.front || mpResults.front.noDetection) {
        throw new Error("Could not detect face in front photo during detailed analysis.");
      }

      setProgress("Classifying features...");

      const frontImg = imgs.front;
      const frontImgData = getImageData(frontImg);
      const w = frontImg.naturalWidth || frontImg.width;
      const h = frontImg.naturalHeight || frontImg.height;

      const result = analyzeFace(
        mpResults.front.landmarks,
        frontImgData,
        w,
        h,
        mpResults.leftProfile?.landmarks || null,
        mpResults.rightProfile?.landmarks || null,
        mpResults.leftThreeQuarter?.landmarks || null,
        mpResults.rightThreeQuarter?.landmarks || null,
        mpResults.chinUp?.landmarks || null
      );

      setFrontLandmarks(mpResults.front.landmarks);
      setFrontDims({ width: w, height: h });

      setProgress("Generating recommendations...");

      const recs = generateRecommendations(result, gender, ageBracket);

      setClassification(result);
      setRecommendations(recs);
      setStep(STEPS.RESULTS);
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again with different photos.");
      setStep(STEPS.PHOTOS);
    }
  };

  const startOver = () => {
    Object.values(photos).forEach((url) => url && URL.revokeObjectURL(url));
    setPhotos(emptyPhotos());
    setValidations({});
    setClassification(null);
    setRecommendations(null);
    setFrontLandmarks(null);
    setFrontDims(null);
    setError(null);
    setConfirmSlot(null);
    imageRefs.current = {};
    landmarkStore.current = {};
    setStep(STEPS.SETUP);
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-stone/40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">
            Style Analyzer
          </h1>
          {step > STEPS.SETUP && step !== STEPS.AGE_GATE && (
            <button
              onClick={startOver}
              className="text-sm text-clay hover:text-ink transition-colors"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      <main className="px-6 py-10 md:py-16">
        {step === STEPS.AGE_GATE && (
          <div className="max-w-md mx-auto text-center space-y-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-ink tracking-tight mb-3">
                Welcome
              </h2>
              <p className="text-charcoal leading-relaxed">
                Style Analyzer provides personalized grooming and styling
                suggestions based on your face shape and features. All photos
                are processed locally in your browser — nothing is uploaded or
                stored.
              </p>
            </div>
            <div className="bg-warm-white border border-stone/40 rounded-sm p-6 space-y-4">
              <p className="text-sm text-charcoal">
                You must be 14 or older to use this tool.
              </p>
              <button
                onClick={() => setStep(STEPS.SETUP)}
                className="w-full py-3 bg-ink text-paper font-body text-sm font-medium rounded-sm hover:bg-charcoal transition-colors"
              >
                I confirm I am 14 or older
              </button>
            </div>
            {!profilerReady && (
              <p className="text-xs text-clay">Loading face detection models...</p>
            )}
          </div>
        )}

        {step === STEPS.SETUP && (
          <div className="max-w-md mx-auto space-y-10">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ink tracking-tight mb-2">
                Before we begin
              </h2>
              <p className="text-sm text-clay">
                These help us show relevant recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.15em] text-clay">
                Recommendation set
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["men", "women"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`
                      py-3 rounded-sm border text-sm font-medium capitalize transition-colors
                      ${gender === g
                        ? "border-ink bg-ink text-paper"
                        : "border-stone text-charcoal hover:border-clay"
                      }
                    `}
                  >
                    {g === "men" ? "Men's" : "Women's"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.15em] text-clay">
                Age bracket
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "under18", label: "14–17" },
                  { value: "18-24", label: "18–24" },
                  { value: "25-40", label: "25–40" },
                  { value: "40-60", label: "40–60" },
                  { value: "60+", label: "60+" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAgeBracket(opt.value)}
                    className={`
                      py-3 rounded-sm border text-sm font-medium transition-colors
                      ${ageBracket === opt.value
                        ? "border-ink bg-ink text-paper"
                        : "border-stone text-charcoal hover:border-clay"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(STEPS.PHOTOS)}
              disabled={!gender || !ageBracket}
              className={`
                w-full py-3 rounded-sm text-sm font-medium transition-colors
                ${gender && ageBracket
                  ? "bg-ink text-paper hover:bg-charcoal"
                  : "bg-stone text-clay cursor-not-allowed"
                }
              `}
            >
              Continue to photos
            </button>
          </div>
        )}

        {step === STEPS.PHOTOS && (
          <div className="space-y-10">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="font-display text-2xl font-bold text-ink tracking-tight mb-2">
                Upload six photos
              </h2>
              <p className="text-sm text-clay leading-relaxed">
                We need front, both 3/4 angles, both profiles, and a chin-up
                shot for accurate analysis. Good, even lighting works best. All
                processing happens in your browser.
              </p>
            </div>

            <PhotoUpload
              photos={photos}
              onPhotoChange={handlePhotoChange}
              validations={validations}
            />

            {confirmSlot && photos[confirmSlot] && (
              <div className="max-w-lg mx-auto bg-warm-white border border-stone/40 rounded-sm p-5 space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-ink">
                    Confirm {SLOT_LABELS[confirmSlot]} photo
                  </p>
                  <p className="text-xs text-clay mt-1">
                    We couldn't auto-detect a face in this photo. Is it a clear,
                    well-lit {SLOT_LABELS[confirmSlot].toLowerCase()} shot?
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleConfirmPhoto(confirmSlot, true)}
                    className="px-6 py-2 bg-ink text-paper text-sm font-medium rounded-sm hover:bg-charcoal transition-colors"
                  >
                    Yes, use this photo
                  </button>
                  <button
                    onClick={() => handleConfirmPhoto(confirmSlot, false)}
                    className="px-6 py-2 border border-stone text-charcoal text-sm font-medium rounded-sm hover:border-clay transition-colors"
                  >
                    Retake
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-error text-center">{error}</p>
            )}

            <div className="text-center">
              <button
                onClick={runAnalysis}
                disabled={!canAnalyze}
                className={`
                  px-10 py-3 rounded-sm text-sm font-medium transition-colors
                  ${canAnalyze
                    ? "bg-ink text-paper hover:bg-charcoal"
                    : "bg-stone text-clay cursor-not-allowed"
                  }
                `}
              >
                Analyze my features
              </button>
            </div>
          </div>
        )}

        {step === STEPS.ANALYZING && (
          <div className="max-w-md mx-auto text-center space-y-6 py-20">
            <div className="inline-block w-8 h-8 border-2 border-stone border-t-ink rounded-full animate-spin" />
            <p className="text-sm text-charcoal">{progress}</p>
          </div>
        )}

        {step === STEPS.RESULTS && classification && recommendations && (
          <div className="space-y-10">
            {frontLandmarks && photos.front && frontDims && (
              <div className="max-w-xs mx-auto relative">
                <img
                  src={photos.front}
                  alt="Your front photo"
                  className="w-full rounded-sm"
                />
                <LandmarkOverlay
                  landmarks={frontLandmarks}
                  width={frontDims.width}
                  height={frontDims.height}
                />
              </div>
            )}

            <ResultsView
              classification={classification}
              recommendations={recommendations}
              gender={gender}
              frontPhoto={photos.front}
              landmarks={frontLandmarks}
            />
          </div>
        )}
      </main>
    </div>
  );
}
