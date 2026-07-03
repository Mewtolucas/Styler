import { useState, useCallback, useRef } from "react";
import PhotoUpload from "./components/PhotoUpload.jsx";
import ResultsView from "./components/ResultsView.jsx";
import LandmarkOverlay from "./components/LandmarkOverlay.jsx";
import { detectLandmarks } from "./lib/landmarks.js";
import { validateAngle, checkPhotoQuality } from "./lib/angleValidation.js";
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

  const imageRefs = useRef({});

  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
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

    if (!url) return;

    try {
      const img = await loadImage(url);
      imageRefs.current[slot] = img;

      const quality = checkPhotoQuality(img);
      if (!quality.valid) {
        setValidations((prev) => ({ ...prev, [slot]: quality }));
        return;
      }

      const result = await detectLandmarks(img, slot);
      if (!result) {
        setValidations((prev) => ({
          ...prev,
          [slot]: { valid: false, message: "No face detected. Make sure your face is clearly visible and well-lit." },
        }));
        return;
      }

      const angleCheck = validateAngle(slot, result.matrix, result.landmarks, result.noDetection);
      setValidations((prev) => ({ ...prev, [slot]: angleCheck }));

      if (slot === "front" && angleCheck.valid) {
        setFrontLandmarks(result.landmarks);
        setFrontDims({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      }
    } catch (e) {
      setValidations((prev) => ({
        ...prev,
        [slot]: { valid: false, message: "Failed to process this image. Try a different photo." },
      }));
    }
  }, []);

  const canAnalyze =
    PHOTO_KEYS.every((k) => photos[k] && validations[k]?.valid) &&
    gender &&
    ageBracket;

  const runAnalysis = async () => {
    setStep(STEPS.ANALYZING);
    setError(null);

    try {
      setProgress("Detecting landmarks across all photos...");

      const imgs = {};
      for (const key of PHOTO_KEYS) {
        imgs[key] = imageRefs.current[key] || (await loadImage(photos[key]));
      }

      const results = {};
      const detections = await Promise.all(
        PHOTO_KEYS.map(async (key) => {
          const r = await detectLandmarks(imgs[key], key);
          return [key, r];
        })
      );
      for (const [key, r] of detections) {
        results[key] = r;
      }

      if (!results.front || results.front.noDetection) {
        throw new Error("Could not detect face in front photo.");
      }

      setProgress("Classifying features...");

      const frontImg = imgs.front;
      const frontImgData = getImageData(frontImg);
      const w = frontImg.naturalWidth || frontImg.width;
      const h = frontImg.naturalHeight || frontImg.height;

      const result = analyzeFace(
        results.front.landmarks,
        frontImgData,
        w,
        h,
        results.leftProfile?.landmarks || null,
        results.rightProfile?.landmarks || null,
        results.leftThreeQuarter?.landmarks || null,
        results.rightThreeQuarter?.landmarks || null,
        results.chinUp?.landmarks || null
      );

      setFrontLandmarks(results.front.landmarks);
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
    imageRefs.current = {};
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
                You must be 18 or older to use this tool.
              </p>
              <button
                onClick={() => setStep(STEPS.SETUP)}
                className="w-full py-3 bg-ink text-paper font-body text-sm font-medium rounded-sm hover:bg-charcoal transition-colors"
              >
                I confirm I am 18 or older
              </button>
            </div>
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
                  { value: "under25", label: "Under 25" },
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
