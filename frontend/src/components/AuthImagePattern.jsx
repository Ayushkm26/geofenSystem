const AuthImagePattern = ({ title, subtitle, actions }) => {
  const gridColor = "bg-black"; // single color for all squares

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="max-w-sm text-center rounded-xl shadow-lg p-6 bg-white">
        {/* Single-color grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg ${gridColor} shadow-sm`}
            />
          ))}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 text-sm leading-snug mb-4">{subtitle}</p>

        {/* Optional Action Buttons */}
        {actions && (
          <div className="flex gap-3 justify-center">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition text-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthImagePattern;
