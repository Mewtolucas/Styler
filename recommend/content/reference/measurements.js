const measurements = {
  eye: {
    width: {
      feature: "Eye width",
      measurement: "Point 23→26",
      perfectDimension: "32-38px (1/5 face width)"
    },
    height: {
      feature: "Eye height",
      measurement: "Point 23→25",
      perfectDimension: "12-16px (1/3 eye width)"
    },
    spacing: {
      feature: "Eye spacing",
      measurement: "Point 26→27",
      perfectDimension: "32-40px (1 eye width apart)"
    },
    canthalTilt: {
      feature: "Canthal tilt",
      measurement: "Outer vs inner height",
      perfectDimension: "2-4px outward higher"
    }
  },
  brow: {
    length: {
      feature: "Brow length",
      measurement: "Point 17→21",
      perfectDimension: "60-75px"
    },
    archHeight: {
      feature: "Brow arch height",
      measurement: "Point 19 above baseline",
      perfectDimension: "15-22px"
    }
  },
  nose: {
    length: {
      feature: "Nose length",
      measurement: "Point 27→30",
      perfectDimension: "35-45px (1/3 face)"
    },
    bridgeWidth: {
      feature: "Nose bridge width",
      measurement: "Left↔right bridge",
      perfectDimension: "18-24px"
    },
    nostrilBaseWidth: {
      feature: "Nostril base width",
      measurement: "Point 31↔35",
      perfectDimension: "24-32px (1.1-1.3× bridge)"
    }
  },
  lips: {
    upperThickness: {
      feature: "Upper lip thickness",
      measurement: "Point 51→50",
      perfectDimension: "5-7px"
    },
    lowerThickness: {
      feature: "Lower lip thickness",
      measurement: "Point 57→58",
      perfectDimension: "6-9px (1.2-1.4× upper)"
    },
    mouthWidth: {
      feature: "Mouth width",
      measurement: "Point 48→54",
      perfectDimension: "55-70px"
    },
    cupidsBowDip: {
      feature: "Cupid's bow dip",
      measurement: "Point 51 below line",
      perfectDimension: "2-3px below"
    }
  },
  cheekbone: {
    peakToTemple: {
      feature: "Cheekbone peak to temple",
      measurement: "Point 2→1",
      perfectDimension: "25-30px"
    }
  },
  jaw: {
    width: {
      feature: "Jaw width",
      measurement: "Point 0↔16",
      perfectDimension: "85-110px"
    },
    chinProjection: {
      feature: "Chin projection",
      measurement: "3D depth",
      perfectDimension: "8-12px beyond lips"
    },
    chinHeight: {
      feature: "Chin height",
      measurement: "Point 8→51",
      perfectDimension: "20-28px (1/5 lower face)"
    }
  },
  proportions: {
    foreheadHeight: {
      feature: "Forehead height",
      measurement: "Hairline→brow",
      perfectDimension: "45-60px (1/3 face)"
    },
    facialThirds: {
      feature: "Facial thirds",
      measurement: "Forehead:Midface:Chin",
      perfectDimension: "Equal ±5px each"
    },
    facialFifths: {
      feature: "Facial fifths",
      measurement: "Each section",
      perfectDimension: "Face width / 5 ±3px"
    },
    overallRatio: {
      feature: "Overall ratio",
      measurement: "Height : Width",
      perfectDimension: "1.618:1 (±0.05)"
    }
  }
};

export default measurements;
