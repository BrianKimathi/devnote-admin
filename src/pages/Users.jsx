import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { ref, onValue, set, push, update, remove } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../config/firebase"; // Firebase configuration

const Users = () => {
  const isDarkMode = useSelector((state) => state.theme.darkMode);

  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [adminList, setAdminList] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user", password: "" });
  const [isFormVisible, setIsFormVisible] = useState(true);

  const auth = getAuth();

  // Fetch users and adminList from Firebase
  useEffect(() => {
    const usersRef = ref(db, "devnote/users");
    const adminListRef = ref(db, "devnote/adminList");

    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.entries(data).map(([id, user]) => ({ id, ...user }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });

    onValue(adminListRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAdminList(Object.entries(data).map(([id, email]) => ({ id, email })));
      } else {
        setAdminList([]);
      }
    });
  }, []);

  // Handlers
  const handleFilterChange = (role) => setFilterRole(role);

  const handleAction = (userId, action) => {
    const userRef = ref(db, `devnote/users/${userId}`);
    const updates = {};
    if (action === "suspend") {
      updates.isSuspended = true;
    } else if (action === "unsuspend") {
      updates.isSuspended = false;
    } else if (action === "activate") {
      updates.active = true;
    } else if (action === "deactivate") {
      updates.active = false;
    }
    update(userRef, updates).catch((error) => console.error("Error updating user status:", error));
  };

  const handleDelete = (userId) => {
    const userRef = ref(db, `devnote/users/${userId}`);
    remove(userRef).catch((error) => console.error("Error deleting user:", error));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      const { uid } = userCredential.user;

      // Add user data to Realtime Database
      const newUserData = {
        ...newUser,
        active: true,
        isSuspended: false,
        status: "active",
        uid,
      };
      await set(ref(db, `devnote/users/${uid}`), newUserData);

      // If the user is an admin, add their email to devnote/adminList
      if (newUser.role === "admin") {
        const adminListRef = ref(db, "devnote/adminList");
        push(adminListRef, newUser.email).catch((error) =>
          console.error("Error adding admin to adminList:", error)
        );
      }

      setNewUser({ name: "", email: "", role: "user", password: "" });
      alert("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user: " + error.message);
    }
  };

  const handleMakeAdmin = (user) => {
    const adminListRef = ref(db, "devnote/adminList");

    if (adminList.some((admin) => admin.email === user.email)) {
      // Remove admin rights
      const adminEntry = adminList.find((admin) => admin.email === user.email);
      remove(ref(db, `devnote/adminList/${adminEntry.id}`))
        .then(() => {
          const userRef = ref(db, `devnote/users/${user.id}`);
          update(userRef, { role: "user" }).catch((error) =>
            console.error("Error updating user role:", error)
          );
          alert("Admin rights removed.");
        })
        .catch((error) => {
          console.error("Error removing admin from adminList:", error);
          alert("Error removing admin rights.");
        });
    } else {
      // Grant admin rights
      push(adminListRef, user.email)
        .then(() => {
          const userRef = ref(db, `devnote/users/${user.id}`);
          update(userRef, { role: "admin" }).catch((error) =>
            console.error("Error updating user role:", error)
          );
          alert("User successfully made an admin.");
        })
        .catch((error) => {
          console.error("Error adding user to adminList:", error);
          alert("Error making user an admin.");
        });
    }
  };

  // Filtered Users
  const filteredUsers = filterRole === "all" ? users : users.filter((user) => user.role === filterRole);

  return (
    <div
      className={`p-4 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>

      {/* Add User Form */}
      <div
        className={`rounded shadow-md p-4 mb-4 ${
          isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          <h2 className="text-xl font-bold">Add New User</h2>
          {isFormVisible ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {isFormVisible && (
          <form onSubmit={handleAddUser} className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded ${
                    isDarkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                  }`}
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  className={`w-full p-2 border rounded ${
                    isDarkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                  }`}
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Password</label>
                <input
                  type="password"
                  className={`w-full p-2 border rounded ${
                    isDarkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                  }`}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Role</label>
                <select
                  className={`w-full p-2 border rounded ${
                    isDarkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                  }`}
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add User
            </button>
          </form>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Role:</label>
        <select
          className={`p-2 border rounded ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
          }`}
          value={filterRole}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table
          className={`table-auto w-full shadow-md rounded mb-6 ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
          }`}
        >
          <thead>
            <tr className={isDarkMode ? "bg-gray-600" : "bg-gray-200"}>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="text-center border-t">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  {adminList.some((admin) => admin.email === user.email) ? "Admin" : "User"}
                </td>
                <td className="px-4 py-2">{user.isSuspended ? "Suspended" : "Active"}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className={`${
                      user.isSuspended ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                    } text-white px-2 py-1 rounded`}
                    onClick={() => handleAction(user.id, user.isSuspended ? "unsuspend" : "suspend")}
                  >
                    {user.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                  <button
                    className={`${
                      user.active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    } text-white px-2 py-1 rounded`}
                    onClick={() => handleAction(user.id, user.active ? "deactivate" : "activate")}
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    onClick={() => handleMakeAdmin(user)}
                  >
                    {adminList.some((admin) => admin.email === user.email)
                      ? "Remove Admin"
                      : "Make Admin"}
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
