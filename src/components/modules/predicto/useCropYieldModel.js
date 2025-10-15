// useCropYieldModel.js

// Fake crop yield prediction based on crop and location {lat, lng}
export function predictYield(crop, location) {
  const lat = parseFloat(location.lat);
  const lng = parseFloat(location.lng);

  const baseYields = {
    maize: 3.5,
    rice: 4.0,
    tomato: 6.0,
  };

  const latFactor = 1 - Math.abs(lat) / 90;
  const lngFactor = 1 - Math.abs((lng % 180) / 180);
  const noise = 0.9 + Math.random() * 0.2;

  const predictedYield = baseYields[crop] * ((latFactor + lngFactor) / 2) * noise;

  return Number(predictedYield.toFixed(2));
}
