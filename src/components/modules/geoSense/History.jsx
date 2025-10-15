import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

const TestHistory = ({ history }) => {
  const [visibleCount, setVisibleCount] = useState(5); // initial items to load
  const { ref, inView } = useInView({ threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      setVisibleCount((prev) => Math.min(prev + 3, history.length)); // load 3 more when in view
    }
  }, [inView, history.length]);

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-3xl font-extrabold mb-6 text-green-700 flex items-center gap-2">
        🧪 Soil Test History
      </h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-500 italic">No previous soil tests found.</p>
      ) : (
        <ul className="relative border-l-4 border-green-600 pl-4 space-y-6">
          {history.slice(0, visibleCount).map(({ id, date, soilType, pH, moisture }, index) => (
            <li
              key={id}
              className="relative bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer w-full"
            >
              {/* Timeline Dot */}
              <span className="absolute -left-3 top-5 w-6 h-6 bg-green-600 rounded-full border-4 border-white shadow"></span>

              {/* Card Header */}
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">#{index + 1} | {date}</p>
                <span className="text-xs bg-green-700 text-white px-3 py-1 rounded-full shadow">
                  {soilType}
                </span>
              </div>

              {/* Soil Details */}
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="bg-white p-3 rounded shadow-inner text-center">
                  <p className="text-xs text-gray-500">Soil Type</p>
                  <p className="text-lg font-semibold text-green-800">{soilType}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-inner text-center">
                  <p className="text-xs text-gray-500">pH Level</p>
                  <p className={`text-lg font-semibold ${pH < 5.5 ? "text-red-600" : pH > 7.5 ? "text-yellow-600" : "text-blue-600"}`}>
                    {pH}
                  </p>
                </div>
                <div className="bg-white p-3 rounded shadow-inner text-center">
                  <p className="text-xs text-gray-500">Moisture</p>
                  <p className="text-lg font-semibold text-teal-600">{moisture}%</p>
                </div>
              </div>
            </li>
          ))}

          {/* Lazy Load Trigger */}
          {visibleCount < history.length && (
            <li ref={ref} className="text-center py-4 text-green-600 font-semibold animate-pulse">
              ⏳ Loading more tests...
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default TestHistory;
