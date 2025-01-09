import React from "react";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode); // Access Redux state for theme

  // Hardcoded user stats
  const userStats = [
    { label: "Total Users", value: 120 },
    { label: "Active Users", value: 100 },
    { label: "Suspended Users", value: 20 },
  ];

  const devlogStats = [
    { label: "Total Devlogs", value: 45 },
    { label: "Total Likes", value: 150 },
    { label: "Total Comments", value: 95 },
  ];

  // Bar chart data for user growth
  const userGrowthData = {
    labels: ["January", "February", "March", "April"],
    datasets: [
      {
        label: "Users Gained",
        data: [10, 25, 15, 50],
        backgroundColor: isDarkMode
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(75, 192, 192, 0.2)",
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.6)"
          : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data for devlog interactions
  const devlogData = {
    labels: ["Likes", "Comments"],
    datasets: [
      {
        data: [150, 95],
        backgroundColor: isDarkMode
          ? ["rgba(255, 255, 255, 0.6)", "rgba(128, 128, 128, 0.6)"]
          : ["rgba(54, 162, 235, 0.5)", "rgba(255, 99, 132, 0.5)"],
        borderColor: isDarkMode
          ? ["rgba(255, 255, 255, 1)", "rgba(128, 128, 128, 1)"]
          : ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      className={`p-4 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {userStats.map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded shadow text-center ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <h2 className="text-lg font-semibold">{stat.label}</h2>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Devlog Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {devlogStats.map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded shadow text-center ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <h2 className="text-lg font-semibold">{stat.label}</h2>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`p-4 rounded shadow ${
            isDarkMode ? "bg-gray-700" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-bold mb-2">User Growth</h3>
          <Bar data={userGrowthData} />
        </div>
        <div
          className={`p-4 rounded shadow ${
            isDarkMode ? "bg-gray-700" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-bold mb-2">Devlog Interactions</h3>
          <Pie data={devlogData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
