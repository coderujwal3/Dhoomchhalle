import React from "react";

const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-linear-to-br ${color} rounded-lg p-6 text-white cursor-pointer transform transition hover:scale-105 ring-1 ring-white ring-opacity-10`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-80 text-sm font-medium">
            {label}
          </p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 text-white text-opacity-20" />
      </div>
    </div>
  );
};

export default StatCard;
