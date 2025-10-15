import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const allRegionsNdvi = [
  {
    id: "greaterAccra",
    name: "Greater Accra",
    coords: [-0.207, 5.6037],
    ndvi: 0.65,
    explanation:
      "Good vegetation cover in urban outskirts and peri-urban farms with some patches of dryness.",
  },
  {
    id: "ashanti",
    name: "Ashanti",
    coords: [-1.616, 6.693],
    ndvi: 0.60,
    explanation:
      "Moderate vegetation health. Some areas may need irrigation or care to improve growth.",
  },
  {
    id: "central",
    name: "Central",
    coords: [-1.024, 5.091],
    ndvi: 0.70,
    explanation:
      "Strong vegetation cover supported by coastal humidity and rainfall patterns.",
  },
  {
    id: "eastern",
    name: "Eastern",
    coords: [-0.798, 6.030],
    ndvi: 0.68,
    explanation:
      "Healthy vegetation with mixed forest and agricultural land. Adequate rainfall expected.",
  },
  {
    id: "volta",
    name: "Volta",
    coords: [0.623, 7.832],
    ndvi: 0.55,
    explanation:
      "Vegetation showing signs of dryness. Monitor water availability and rainfall closely.",
  },
  {
    id: "oti",
    name: "Oti",
    coords: [0.25, 8.900],
    ndvi: 0.57,
    explanation:
      "Moderate vegetation health with patches of good cover; rainfall expected to improve conditions.",
  },
  {
    id: "western",
    name: "Western",
    coords: [-2.080, 5.321],
    ndvi: 0.80,
    explanation:
      "Very healthy forests and plantations with dense green canopy, ideal for biodiversity.",
  },
  {
    id: "northEast",
    name: "North East",
    coords: [-0.716, 9.700],
    ndvi: 0.50,
    explanation:
      "Average vegetation health, some stress due to dry season and irregular rainfall.",
  },
  {
    id: "northern",
    name: "Northern",
    coords: [-1.111, 9.395],
    ndvi: 0.75,
    explanation:
      "Healthy vegetation with dense green cover. Conditions favorable for crops and forests.",
  },
  {
    id: "savannah",
    name: "Savannah",
    coords: [-1.225, 9.063],
    ndvi: 0.52,
    explanation:
      "Moderate vegetation health, risk of drought stress in dry periods, requires monitoring.",
  },
  {
    id: "upperEast",
    name: "Upper East",
    coords: [-0.175, 10.686],
    ndvi: 0.40,
    explanation:
      "Low NDVI indicates stressed vegetation, likely due to dry season or lack of irrigation.",
  },
  {
    id: "upperWest",
    name: "Upper West",
    coords: [-2.516, 10.334],
    ndvi: 0.45,
    explanation:
      "Vegetation under moderate stress, with dry season effects. Water management needed.",
  },
  {
    id: "bono",
    name: "Bono",
    coords: [-2.132, 7.700],
    ndvi: 0.58,
    explanation:
      "Good vegetation health with moderate rainfall; suitable for diverse crop cultivation.",
  },
  {
    id: "bonoEast",
    name: "Bono East",
    coords: [-1.500, 7.900],
    ndvi: 0.50,
    explanation:
      "Average vegetation health, with some areas under stress due to recent dry spells.",
  },
  {
    id: "ahafo",
    name: "Ahafo",
    coords: [-2.100, 7.350],
    ndvi: 0.62,
    explanation:
      "Healthy vegetation with potential for agriculture expansion and forest regeneration.",
  },
  {
    id: "odenCentral",
    name: "Oden Central",
    coords: [-1.800, 6.000],
    ndvi: 0.67,
    explanation:
      "Good vegetation supported by favorable climate and soil conditions.",
  },
  {
    id: "westernNorth",
    name: "Western North",
    coords: [-2.500, 6.400],
    ndvi: 0.78,
    explanation:
      "Dense forest cover and plantations; high biodiversity and ecosystem stability.",
  },
];

export default function NDVIMap() {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token is missing!");
      return;
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [-1.0232, 7.9465], // Rough center of Ghana
      zoom: 6,
      accessToken: MAPBOX_TOKEN,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    allRegionsNdvi.forEach(({ name, coords, ndvi, explanation }) => {
      let color = "red";
      if (ndvi > 0.7) color = "green";
      else if (ndvi > 0.55) color = "orange";

      const popupContent = `
        <h3>${name}</h3>
        <p><strong>NDVI:</strong> ${ndvi}</p>
        <p style="font-size: 0.9em; margin-top: 5px;">${explanation}</p>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      new mapboxgl.Marker({ color })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(mapInstance);
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  return (
    <div className="bg-gray-100 p-6 rounded shadow max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        🛰️ Vegetation Health (NDVI) Map - All Regions of Ghana
      </h2>
      <div
        ref={mapContainerRef}
        style={{ height: "520px", borderRadius: "8px", border: "1px solid #ccc" }}
        aria-label="Vegetation health map showing NDVI values across all Ghana regions"
      />
      <p className="mt-4 text-gray-700 text-sm max-w-5xl">
        This interactive map shows the Normalized Difference Vegetation Index (NDVI) for all 16
        administrative regions of Ghana. NDVI values close to 1 indicate healthy, dense vegetation,
        while lower values suggest stressed or sparse vegetation. Use the colored markers to quickly
        assess vegetation health — green indicates healthy, orange signals moderate concern, and red
        warns of stressed vegetation. Click on markers for detailed region-specific explanations.
      </p>
    </div>
  );
}
