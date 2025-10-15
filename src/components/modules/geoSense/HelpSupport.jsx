import React from "react";

export default function HelpSupport() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl">
      <h1 className="text-4xl font-extrabold mb-8 text-green-700 tracking-tight">
        Help & Support
      </h1>

      <p className="text-lg text-gray-700 leading-relaxed">
        For assistance, please contact your local agricultural extension office or email{" "}
        <a
          href="mailto:support@geosense.example.com"
          className="text-green-600 underline hover:text-green-800 transition-colors"
        >
          support@geosense.example.com
        </a>.
      </p>

      <p className="mt-6 text-gray-700 text-lg leading-relaxed">
        Visit our <a href="/resources" className="text-green-600 underline hover:text-green-800 transition-colors">resources page</a> for detailed guides and tutorials on soil testing, moisture management, and sustainable farming.
      </p>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-4 text-green-700 border-l-4 border-green-600 pl-4">
          Soil Health Types & Recommendations
        </h2>
        <p className="mb-6 text-gray-600 text-base max-w-prose">
          Below is a color-indicated table summarizing soil types, pH, moisture, nutrient status, warnings, and recommendations.
        </p>

        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-green-100">
              <tr>
                {[
                  "Soil Type",
                  "pH",
                  "Moisture",
                  "NPK Status",
                  "Organic Matter",
                  "Warning",
                  "Key Recommendations",
                  "Suitable Crops",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 border border-green-200 font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  soilType: "🟠 Sandy",
                  pH: "🔴 Acidic (5.0–6.5)",
                  moisture: "🔴 Low",
                  npk: "🔴 Low N & P",
                  organicMatter: "🔴 <1%",
                  warning: "Nutrient leaching, drought-prone",
                  recommendations: "Add compost, mulch, slow-release NPK",
                  crops: "Groundnuts, cassava, maize",
                },
                {
                  soilType: "🟢 Loamy",
                  pH: "🟢 Neutral (6.0–7.0)",
                  moisture: "🟢 Moderate",
                  npk: "🟢 Balanced",
                  organicMatter: "🟢 3–5%",
                  warning: "Degrades if mismanaged",
                  recommendations: "Crop rotation, organic matter",
                  crops: "Vegetables, beans, plantain",
                },
                {
                  soilType: "🔵 Clay",
                  pH: "🟢 Slightly acidic–neutral",
                  moisture: "🔵 High",
                  npk: "🟡 Low P",
                  organicMatter: "🟢 4–6%",
                  warning: "Waterlogging risk",
                  recommendations: "Improve drainage, lime if acidic",
                  crops: "Rice, legumes",
                },
                {
                  soilType: "🔴 Lateritic",
                  pH: "🔴 Acidic (4.5–5.5)",
                  moisture: "🟡 Moderate",
                  npk: "🔴 Low NPK",
                  organicMatter: "🟡 1–2%",
                  warning: "Strong acidity, leaching",
                  recommendations: "Lime, rock phosphate, agroforestry",
                  crops: "Cassava, oil palm",
                },
                {
                  soilType: "🟣 Peaty",
                  pH: "🔴 Acidic (4.0–5.0)",
                  moisture: "🟣 Very High",
                  npk: "🔴 Low NPK",
                  organicMatter: "🟣 >10%",
                  warning: "Excess water, acidity",
                  recommendations: "Drain, lime, balanced fertilizer",
                  crops: "Vegetables (raised beds)",
                },
                {
                  soilType: "⚪ Saline",
                  pH: "⚪ Alkaline (>8.0)",
                  moisture: "🔴 Low",
                  npk: "⚪ NPK unavailable",
                  organicMatter: "🔴 <1%",
                  warning: "High salt toxicity",
                  recommendations: "Leach salts, gypsum, salt-tolerant crops",
                  crops: "Barley, cotton",
                },
              ].map(
                (
                  {
                    soilType,
                    pH,
                    moisture,
                    npk,
                    organicMatter,
                    warning,
                    recommendations,
                    crops,
                  },
                  i
                ) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-green-50" : "bg-white"}
                  >
                    <td className="px-4 py-3 border border-green-200 font-semibold">
                      {soilType}
                    </td>
                    <td className="px-4 py-3 border border-green-200">{pH}</td>
                    <td className="px-4 py-3 border border-green-200">{moisture}</td>
                    <td className="px-4 py-3 border border-green-200">{npk}</td>
                    <td className="px-4 py-3 border border-green-200">{organicMatter}</td>
                    <td className="px-4 py-3 border border-green-200">{warning}</td>
                    <td className="px-4 py-3 border border-green-200">{recommendations}</td>
                    <td className="px-4 py-3 border border-green-200">{crops}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-4 text-green-700 border-l-4 border-green-600 pl-4">
          General Farming Tips
        </h2>
        <ul className="list-disc pl-8 space-y-3 text-gray-700 text-lg max-w-prose leading-relaxed">
          <li>Test your soil annually for pH, organic matter, and nutrients.</li>
          <li>Use organic mulches and compost to improve soil structure.</li>
          <li>Rotate crops and practice cover cropping to maintain fertility.</li>
          <li>Avoid over-irrigation and high-salt fertilizers.</li>
          <li>Prevent soil erosion by keeping the surface covered.</li>
        </ul>
      </section>
    </div>
  );
}
