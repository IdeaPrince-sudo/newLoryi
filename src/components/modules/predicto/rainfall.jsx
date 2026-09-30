import React, { useRef, useEffect, useState } from "react";
import { api } from '../../../lib/api';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN";

const ghanaRegions = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Ashanti",
        rainfall: 1300,
        farmProduce: {
          crops: 600000,
          livestock: 150000,
          fishery: 70000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-2.2, 6.2],
          [-1.4, 6.2],
          [-1.4, 7.1],
          [-2.2, 7.1],
          [-2.2, 6.2]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Bono",
        rainfall: 1100,
        farmProduce: {
          crops: 450000,
          livestock: 120000,
          fishery: 30000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-2.7, 7.0],
          [-1.9, 7.0],
          [-1.9, 7.7],
          [-2.7, 7.7],
          [-2.7, 7.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Bono East",
        rainfall: 1050,
        farmProduce: {
          crops: 420000,
          livestock: 100000,
          fishery: 25000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-1.9, 7.0],
          [-1.4, 7.0],
          [-1.4, 7.7],
          [-1.9, 7.7],
          [-1.9, 7.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Ahafo",
        rainfall: 1150,
        farmProduce: {
          crops: 480000,
          livestock: 130000,
          fishery: 28000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-2.7, 6.5],
          [-2.2, 6.5],
          [-2.2, 7.1],
          [-2.7, 7.1],
          [-2.7, 6.5]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Eastern",
        rainfall: 1400,
        farmProduce: {
          crops: 650000,
          livestock: 180000,
          fishery: 40000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-0.7, 5.8],
          [0.2, 5.8],
          [0.2, 6.5],
          [-0.7, 6.5],
          [-0.7, 5.8]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Greater Accra",
        rainfall: 1350,
        farmProduce: {
          crops: 500000,
          livestock: 160000,
          fishery: 45000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [0.0, 5.5],
          [0.5, 5.5],
          [0.5, 6.0],
          [0.0, 6.0],
          [0.0, 5.5]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Western",
        rainfall: 1800,
        farmProduce: {
          crops: 850000,
          livestock: 220000,
          fishery: 120000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-3.5, 4.7],
          [-2.7, 4.7],
          [-2.7, 5.3],
          [-3.5, 5.3],
          [-3.5, 4.7]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Western North",
        rainfall: 1750,
        farmProduce: {
          crops: 800000,
          livestock: 210000,
          fishery: 115000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-3.5, 5.3],
          [-3.0, 5.3],
          [-3.0, 5.7],
          [-3.5, 5.7],
          [-3.5, 5.3]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Central",
        rainfall: 1600,
        farmProduce: {
          crops: 750000,
          livestock: 195000,
          fishery: 85000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-1.3, 5.0],
          [-0.5, 5.0],
          [-0.5, 5.8],
          [-1.3, 5.8],
          [-1.3, 5.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Volta",
        rainfall: 1250,
        farmProduce: {
          crops: 550000,
          livestock: 145000,
          fishery: 50000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [0.5, 6.0],
          [1.2, 6.0],
          [1.2, 7.0],
          [0.5, 7.0],
          [0.5, 6.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Oti",
        rainfall: 900,
        farmProduce: {
          crops: 300000,
          livestock: 90000,
          fishery: 25000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [0.5, 7.0],
          [1.2, 7.0],
          [1.2, 7.7],
          [0.5, 7.7],
          [0.5, 7.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Northern",
        rainfall: 850,
        farmProduce: {
          crops: 270000,
          livestock: 85000,
          fishery: 20000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-1.7, 8.0],
          [-0.7, 8.0],
          [-0.7, 9.5],
          [-1.7, 9.5],
          [-1.7, 8.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Savannah",
        rainfall: 700,
        farmProduce: {
          crops: 200000,
          livestock: 60000,
          fishery: 15000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-2.7, 8.0],
          [-1.7, 8.0],
          [-1.7, 9.0],
          [-2.7, 9.0],
          [-2.7, 8.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "North East",
        rainfall: 750,
        farmProduce: {
          crops: 220000,
          livestock: 65000,
          fishery: 17000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-0.7, 8.0],
          [0.1, 8.0],
          [0.1, 9.0],
          [-0.7, 9.0],
          [-0.7, 8.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Upper East",
        rainfall: 600,
        farmProduce: {
          crops: 150000,
          livestock: 45000,
          fishery: 10000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [0.1, 9.0],
          [0.7, 9.0],
          [0.7, 10.3],
          [0.1, 10.3],
          [0.1, 9.0]
        ]],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Upper West",
        rainfall: 650,
        farmProduce: {
          crops: 160000,
          livestock: 47000,
          fishery: 12000,
        },
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-2.7, 9.0],
          [-2.0, 9.0],
          [-2.0, 10.3],
          [-2.7, 10.3],
          [-2.7, 9.0]
        ]],
      },
    },
  ],
};

const transitionalZone = {
  type: "Feature",
  properties: {
    name: "Forest-Savannah Transitional Zone",
    rainfallTrend: "-0.72 to -1.15 mm/year",
    description: `The transitional zone lies between humid forest and dry savannah zones in Ghana.
Rainfall is declining by about 0.72 to 1.15 mm/year, affecting agriculture and water resources.
This area includes Brong-Ahafo, parts of Ashanti, and Eastern Regions.`,
  },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [-2.5, 8.5],
      [-0.5, 8.5],
      [-0.5, 7.0],
      [-1.5, 6.5],
      [-2.5, 7.5],
      [-2.5, 8.5]
    ]],
  },
};

function getColor(rainfall) {
  return rainfall > 1600
    ? "#08306b"
    : rainfall > 1400
    ? "#2171b5"
    : rainfall > 1200
    ? "#4292c6"
    : rainfall > 900
    ? "#6baed6"
    : rainfall > 700
    ? "#9ecae1"
    : "#c6dbef";
}

function getCentroid(coords) {
  const ring = coords[0];
  let x = 0,
    y = 0,
    area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xi1 = ring[i + 1][0],
      yi1 = ring[i + 1][1];
    const a = xi * yi1 - xi1 * yi;
    area += a;
    x += (xi + xi1) * a;
    y += (yi + yi1) * a;
  }
  area /= 2;
  x /= 6 * area;
  y /= 6 * area;
  return [x, y];
}

function getMarkerSize(rainfall) {
  if (rainfall > 1600) return 40;
  if (rainfall > 1400) return 36;
  if (rainfall > 1200) return 32;
  if (rainfall > 900) return 28;
  if (rainfall > 700) return 24;
  return 20;
}

const raindropSVG = (color) => `
  <svg
    width="24"
    height="36"
    viewBox="0 0 24 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 0C7.5 8 0 18 0 26.4C0 31.392 4.02944 36 9 36C13.9706 36 18 31.392 18 26.4C18 18 12 8 12 0Z"
      fill="${color}"
      stroke="#fff"
      stroke-width="2"
    />
  </svg>
`;

const GhanaRainfallMap = ({ selectedLocation }) => {
  const [monitoring, setMonitoring] = useState(null);
  useEffect(() => {
    api.monitoring(selectedLocation || 'Greater Accra').then(setMonitoring).catch(() => setMonitoring(null));
  }, [selectedLocation]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [-1.2, 7.5],
      zoom: 6,
      antialias: true,
    });

    map.current.on("load", () => {
      map.current.addSource("ghana-regions", {
        type: "geojson",
        data: ghanaRegions,
      });

      map.current.addLayer({
        id: "regions-fill",
        type: "none",
        source: "ghana-regions",
        paint: {
          "fill-color": [
            "match",
            ["get", "name"],
            ...ghanaRegions.features.flatMap((feature) => [
              feature.properties.name,
              getColor(feature.properties.rainfall),
            ]),
            "#ccc",
          ],
          "fill-opacity": 0,
        },
      });

      map.current.addLayer({
        id: "regions-outline",
        type: "line",
        source: "ghana-regions",
        paint: {
          "line-color": "#555",
          "line-width": 0,
        },
      });

      map.current.addSource("transitional-zone", {
        type: "geojson",
        data: transitionalZone,
      });

      map.current.addLayer({
        id: "transitional-zone-fill",
        type: "fill",
        source: "transitional-zone",
        paint: {
          "fill-color": "#f28cb1",
          "fill-opacity": 0.3,
        },
      });

      map.current.addLayer({
        id: "transitional-zone-outline",
        type: "line",
        source: "transitional-zone",
        paint: {
          "line-color": "#d94877",
          "line-width": 3,
          "line-opacity": 0.8,
        },
      });

      // Add raindrop markers with hover popup
      ghanaRegions.features.forEach((feature) => {
        const { rainfall, name, farmProduce } = feature.properties;
        const centroid = getCentroid(feature.geometry.coordinates);

        const color = getColor(rainfall);
        const size = getMarkerSize(rainfall);

        const el = document.createElement("div");
        el.style.width = `${size}px`;
        el.style.height = `${(size * 1.5).toFixed(0)}px`;
        el.style.cursor = "pointer";
        el.innerHTML = raindropSVG(color);

        el.addEventListener("mouseenter", () => {
          popup.current
            .setLngLat(centroid)
            .setHTML(
              `<strong>${name}</strong><br/>
               Avg Annual Rainfall: ${rainfall} mm<br/>
               <strong>Annual Farm Produce:</strong><br/>
               Crops: ${farmProduce.crops.toLocaleString()} tonnes<br/>
               Livestock: ${farmProduce.livestock.toLocaleString()} tonnes<br/>
               Fishery: ${farmProduce.fishery.toLocaleString()} tonnes`
            )
            .addTo(map.current);
        });
        el.addEventListener("mouseleave", () => {
          popup.current.remove();
        });

        new mapboxgl.Marker(el).setLngLat(centroid).addTo(map.current);
      });

      // Popup on polygon click
      map.current.on("click", "regions-fill", (e) => {
        const feature = e.features[0];
        const coordinates = e.lngLat;
        const { name, rainfall, farmProduce } = feature.properties;

        new mapboxgl.Popup({ offset: 15 })
          .setLngLat(coordinates)
          .setHTML(
            `<h3 style="margin:0 0 6px;color:#2171b5;">${name}</h3>
             <p><strong>Average Annual Rainfall:</strong> ${rainfall} mm</p>
             <p><strong>Annual Farm Produce:</strong></p>
             <ul style="margin:0;padding-left:1.2em;">
               <li>Crops: ${farmProduce.crops.toLocaleString()} tonnes</li>
               <li>Livestock: ${farmProduce.livestock.toLocaleString()} tonnes</li>
               <li>Fishery: ${farmProduce.fishery.toLocaleString()} tonnes</li>
             </ul>`
          )
          .addTo(map.current);
      });

      // Popup for transitional zone polygon
      map.current.on("click", "transitional-zone-fill", (e) => {
        const coordinates = e.lngLat;
        const { name, rainfallTrend, description } = e.features[0].properties;

        new mapboxgl.Popup({ offset: 15, maxWidth: "300px" })
          .setLngLat(coordinates)
          .setHTML(
            `<h3 style="margin:0 0 10px;color:#d94877;">${name}</h3>
             <p><strong>Rainfall Trend:</strong> ${rainfallTrend}</p>
             <p style="margin-top:8px;line-height:1.4;font-size:0.9rem;">${description}</p>`
          )
          .addTo(map.current);
      });

      // Change cursor to pointer on hover for interactivity
      map.current.on("mouseenter", "regions-fill", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "regions-fill", () => {
        map.current.getCanvas().style.cursor = "";
      });

      map.current.on("mouseenter", "transitional-zone-fill", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "transitional-zone-fill", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: 960,
        margin: "20px auto",
        padding: "0 1rem",
        color: "#1e293b",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#2171b5", marginBottom: 24 }}>
        Rainfall Patterns & Forest-Savannah Transitional Zone in Ghana
      </h2>
      {monitoring?.selected && <p className="mb-3 text-sm text-slate-600">Live {monitoring.selected.name} rainfall: {monitoring.selected.rainfall7d} mm/day average. Source: Open-Meteo.</p>}
      <div
        ref={mapContainer}
        style={{
          height: 650,
          borderRadius: 12,
          boxShadow: "none",
          marginBottom: 20,
        }}
      />
      <p
        style={{
          maxWidth: 820,
          margin: "0 auto 30px",
          fontSize: 16,
          lineHeight: 1.5,
          backgroundColor: "#fef3f7",
          borderRadius: 8,
          padding: "12px 20px",
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)",
          color: "#5f1d3e",
        }}
      >
        The pink shaded area represents the{" "}
        <strong>Forest-Savannah Transitional Zone</strong> in Ghana, where rainfall is
        decreasing at a rate between{" "}
        <strong style={{ color: "#a51c43" }}>-0.72 to -1.15 mm/year</strong>. This
        has significant implications including prolonged dry seasons, reduced crop
        yields, and increased drought vulnerability.
      </p>

      {/* Legend */}
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          backgroundColor: "#f9fafb",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: 14,
          color: "#333",
          boxShadow: "none",
        }}
      >
        <strong>Rainfall Legend (mm/year)</strong>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            alignItems: "center",
          }}
        >
          {[1800, 1600, 1400, 1200, 900, 700].map((val) => (
            <div
              key={val}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "default",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 36,
                  backgroundColor: getColor(val),
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  border: "1.5px solid #fff",
                  boxShadow: "0 0 3px rgba(0,0,0,0.25)",
                }}
              />
              <span>{val}+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GhanaRainfallMap;
