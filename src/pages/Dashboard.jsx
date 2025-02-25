import React, { useState, useEffect } from "react";
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
import { getDatabase, ref, onValue } from "firebase/database";
import { ClipLoader } from "react-spinners";

// Register required ChartJS components
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
  const isDarkMode = useSelector((state) => state.theme.darkMode);
  const [userStats, setUserStats] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState({
    labels: [],
    datasets: [],
  });
  const [userPieData, setUserPieData] = useState({
    labels: [],
    datasets: [],
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const db = getDatabase();

  useEffect(() => {
    const fetchStats = () => {
      const usersRef = ref(db, "devnote/users");

      onValue(usersRef, (snapshot) => {
        const users = snapshot.val() || {};
        const totalUsers = Object.keys(users).length;
        const activeUsers = Object.values(users).filter(
          (user) => user.active && !user.isSuspended
        ).length;
        const deactivatedUsers = Object.values(users).filter(
          (user) => !user.active && !user.isSuspended
        ).length;
        const suspendedUsers = Object.values(users).filter(
          (user) => user.isSuspended
        ).length;

        setUserStats([
          { label: "Total Users", value: totalUsers },
          { label: "Active Users", value: activeUsers },
          { label: "Deactivated Users", value: deactivatedUsers },
          { label: "Suspended Users", value: suspendedUsers },
        ]);

        setUserGrowthData({
          labels: ["January", "February", "March", "April"],
          datasets: [
            {
              label: "Users Gained",
              data: [10, 25, 15, totalUsers],
              backgroundColor: isDarkMode
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(75, 192, 192, 0.2)",
              borderColor: isDarkMode
                ? "rgba(255, 255, 255, 0.6)"
                : "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        setUserPieData({
          labels: ["Active Users", "Deactivated Users", "Suspended Users"],
          datasets: [
            {
              data: [activeUsers, deactivatedUsers, suspendedUsers],
              backgroundColor: isDarkMode
                ? [
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(128, 128, 128, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                  ]
                : [
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(128, 128, 128, 0.5)",
                    "rgba(255, 99, 132, 0.5)",
                  ],
              borderColor: isDarkMode
                ? [
                    "rgba(54, 162, 235, 1)",
                    "rgba(128, 128, 128, 1)",
                    "rgba(255, 99, 132, 1)",
                  ]
                : [
                    "rgba(54, 162, 235, 1)",
                    "rgba(128, 128, 128, 1)",
                    "rgba(255, 99, 132, 1)",
                  ],
              borderWidth: 1,
            },
          ],
        });

        setIsDataLoaded(true);
      });
    };

    fetchStats();
  }, [db, isDarkMode]);

  return (
    <div
      className={`p-4 min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

      {/* Charts */}
      {isDataLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`p-4 rounded shadow ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-bold mb-2">User Growth</h3>
            <Bar
              data={userGrowthData}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: isDarkMode ? "#ffffff" : "#000000",
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: isDarkMode ? "#ffffff" : "#000000" },
                  },
                  y: {
                    ticks: { color: isDarkMode ? "#ffffff" : "#000000" },
                  },
                },
              }}
            />
          </div>
          <div
            className={`p-4 rounded shadow ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-bold mb-2">User Distribution</h3>
            <Pie
              data={userPieData}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: isDarkMode ? "#ffffff" : "#000000",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-48">
          <ClipLoader color={isDarkMode ? "#ffffff" : "#000000"} size={50} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
