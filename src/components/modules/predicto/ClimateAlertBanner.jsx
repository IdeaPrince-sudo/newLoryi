import { useState, useEffect } from "react";

const alerts = [
  {
    id: 1,
    region: "Northern Region",
    type: "High Heat",
    message: "High heat warning in Northern Region. Water crops early.",
    icon: "☀️",
    severity: "warning",
  },
  {
    id: 2,
    region: "Ashanti Region",
    type: "Drought Risk",
    message: "Drought conditions expected. Monitor irrigation closely.",
    icon: "⚠️",
    severity: "alert",
  },
];

const severityColors = {
  warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
  alert: "bg-red-100 border-red-500 text-red-800",
  info: "bg-blue-100 border-blue-500 text-blue-800",
};

export default function ClimateAlertBanner() {
  const [visibleAlerts, setVisibleAlerts] = useState(alerts);

  // Auto-dismiss alerts after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleAlerts([]);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleAlerts.map(({ id, region, message, icon, severity }) => (
        <div
          key={id}
          className={`border-l-4 p-4 text-sm rounded shadow ${severityColors[severity]}`}
          role="alert"
          aria-live="assertive"
        >
          <strong className="mr-2">{icon} Climate Alert:</strong>
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
}
