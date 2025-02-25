import React, { useState, useEffect, useContext } from "react";
import {
  getDatabase,
  ref,
  onValue,
  update,
  remove,
  get,
  set,
} from "firebase/database";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ThemeContext } from "../context/ThemeContext.jsx";

// ---------- Helper Functions ----------

/**
 * Converts URLs in text into clickable links.
 */
const linkifyText = (text) => {
  if (!text || typeof text !== "string") return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">${url}</a>`
  );
};

/**
 * Builds a nested comment tree from a flat object.
 * Each comment has a "parentId" (null for top-level).
 */
const buildCommentTree = (commentsObj) => {
  if (!commentsObj) return [];
  const lookup = {};
  Object.keys(commentsObj).forEach((id) => {
    lookup[id] = { ...commentsObj[id], id, childArray: [] };
  });
  const tree = [];
  Object.keys(lookup).forEach((id) => {
    const comment = lookup[id];
    if (comment.parentId) {
      if (lookup[comment.parentId]) {
        lookup[comment.parentId].childArray.push(comment);
      } else {
        tree.push(comment);
      }
    } else {
      tree.push(comment);
    }
  });
  return tree;
};

// Slider settings (for logs carousel)
const carouselSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  arrows: true,
  swipeToSlide: true,
  adaptiveHeight: false,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } },
  ],
};

// ---------- DevlogsAdmin Component ----------

const DevlogsAdmin = () => {
  const [devlogs, setDevlogs] = useState([]);
  const [expandedDevlogId, setExpandedDevlogId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [suspendedUsers, setSuspendedUsers] = useState({});
  const [reports, setReports] = useState({});
  const [logUpvotes, setLogUpvotes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  // State for users to look up author names
  const [users, setUsers] = useState({});

  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const db = getDatabase();

  // ----- Fetch Devlogs -----
  useEffect(() => {
    const devlogsRef = ref(db, "devnote/devlogs");
    onValue(devlogsRef, (snapshot) => {
      const data = snapshot.val();
      const arr = [];
      if (data) {
        Object.keys(data).forEach((userId) => {
          Object.keys(data[userId]).forEach((devlogId) => {
            arr.push({
              ...data[userId][devlogId],
              userId,
              devlogId,
            });
          });
        });
      }
      setDevlogs(arr);
    });
  }, [db]);

  // ----- Fetch Users -----
  useEffect(() => {
    const usersRef = ref(db, "devnote/users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const suspended = {};
      Object.keys(data).forEach((uid) => {
        if (data[uid].isSuspended) {
          suspended[uid] = true;
        }
      });
      setSuspendedUsers(suspended);
      setUsers(data);
    });
  }, [db]);

  // ----- Fetch Reports -----
  useEffect(() => {
    const reportsRef = ref(db, "devnote/reports");
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setReports(data);
    });
  }, [db]);

  // ----- Fetch Devlog Upvotes -----
  useEffect(() => {
    devlogs.forEach((devlog) => {
      const upRef = ref(
        db,
        "devnote/devlogs/" + devlog.userId + "/" + devlog.devlogId + "/upvotes"
      );
      get(upRef).then((snapshot) => {
        setLogUpvotes((prev) => ({
          ...prev,
          [devlog.devlogId]: snapshot.exists()
            ? Object.keys(snapshot.val()).length
            : 0,
        }));
      });
    });
  }, [devlogs, db]);

  // ----- Utility: Format Time -----
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const now = new Date();
    const past = new Date(timestamp);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // ----- Admin Action Handlers -----
  const handleToggleStatus = (path, currentStatus) => {
    const itemRef = ref(db, path);
    update(itemRef, { isPublished: !currentStatus })
      .then(() => {
        alert("Status updated successfully.");
      })
      .catch((error) => {
        console.error("Error toggling status:", error);
        alert("Failed to update status.");
      });
  };

  const handleDeleteDevlog = (userId, devlogId) => {
    if (window.confirm("Are you sure you want to delete this devlog?")) {
      const devlogRef = ref(db, `devnote/devlogs/${userId}/${devlogId}`);
      remove(devlogRef)
        .then(() => alert("Devlog deleted successfully."))
        .catch((error) => {
          console.error("Error deleting devlog:", error);
          alert("Failed to delete devlog.");
        });
    }
  };

  const handleDeleteLog = (userId, devlogId, logId) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      const logRef = ref(
        db,
        `devnote/devlogs/${userId}/${devlogId}/logs/${logId}`
      );
      remove(logRef)
        .then(() => alert("Log deleted successfully."))
        .catch((error) => {
          console.error("Error deleting log:", error);
          alert("Failed to delete log.");
        });
    }
  };

  const handleDeleteComment = (path, commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const commentRef = ref(db, path);
      remove(commentRef)
        .then(() => alert("Comment deleted successfully."))
        .catch((error) => {
          console.error("Error deleting comment:", error);
          alert("Failed to delete comment.");
        });
    }
  };

  const handleSuspendUser = (uid) => {
    if (!uid) return;
    const userRef = ref(db, `devnote/users/${uid}`);
    update(userRef, { isSuspended: true })
      .then(() => {
        alert("User suspended successfully.");
      })
      .catch((error) => {
        console.error("Error suspending user:", error);
        alert("Failed to suspend user.");
      });
  };

  const handleUnsuspendUser = (uid) => {
    if (!uid) return;
    const userRef = ref(db, `devnote/users/${uid}`);
    update(userRef, { isSuspended: false })
      .then(() => {
        alert("User unsuspended successfully.");
      })
      .catch((error) => {
        console.error("Error unsuspending user:", error);
        alert("Failed to unsuspend user.");
      });
  };

  const handleEditDevlog = (devlogId) => {
    navigate("/create-devlog?id=" + devlogId);
  };

  const handleLogUpvote = async (userId, devlogId) => {
    if (!userId || !devlogId) return;
    const adminUser = { userId: "admin", userName: "Admin" };
    const upvoteRef = ref(
      db,
      "devnote/devlogs/" + userId + "/" + devlogId + "/upvotes/admin"
    );
    try {
      const snapshot = await get(upvoteRef);
      if (snapshot.exists()) {
        await set(upvoteRef, null);
        setLogUpvotes((prev) => ({
          ...prev,
          [devlogId]: Math.max((prev[devlogId] || 1) - 1, 0),
        }));
        alert("Removed devlog upvote.");
      } else {
        await set(upvoteRef, {
          ...adminUser,
          timestamp: new Date().toISOString(),
        });
        setLogUpvotes((prev) => ({
          ...prev,
          [devlogId]: (prev[devlogId] || 0) + 1,
        }));
        alert("Devlog upvoted.");
      }
    } catch (error) {
      console.error("Error upvoting devlog:", error);
      alert("Failed to upvote devlog.");
    }
  };

  // ----- Filter devlogs based on search term with safety checks -----
  const filteredDevlogs = devlogs.filter((d) => {
    // Use empty string if title is missing or not a string
    const title = (d.title && typeof d.title === "string")
      ? d.title.toLowerCase()
      : "";
    // For author name, default to "unknown"
    const authorName =
      ((users[d.userId] && users[d.userId].name)
        ? users[d.userId].name
        : "unknown").toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      title.includes(lowerSearchTerm) || authorName.includes(lowerSearchTerm)
    );
  });

  // ----- Render Logs and Their Comments -----
  const renderLogs = (logs, userId, devlogId) => {
    if (!logs) return <p>No logs available.</p>;
    return Object.keys(logs).map((logId) => {
      const logItem = logs[logId];
      return (
        <div key={logId} className="border p-4 my-2 rounded">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">{logItem.title}</h4>
            <div>
              <button
                className="text-blue-500 mr-2"
                onClick={() => handleEditDevlog(devlog.devlogId)}
              >
                Edit Log
              </button>
              <button
                className="text-red-500"
                onClick={() =>
                  handleDeleteLog(userId, devlog.devlogId, logId)
                }
              >
                Delete Log
              </button>
            </div>
          </div>
          <p className="text-gray-500">{logItem.description}</p>
          <div className="mt-2">
            <h5 className="font-semibold">Log Comments:</h5>
            {logItem.comments ? (
              renderComments(
                logItem.comments,
                "devnote/devlogs/" +
                  userId +
                  "/" +
                  devlog.devlogId +
                  "/logs/" +
                  logId
              )
            ) : (
              <p>No comments</p>
            )}
          </div>
        </div>
      );
    });
  };

  // ----- Render Comments Recursively -----
  const renderComments = (commentsObj, parentPath) => {
    if (!commentsObj) return null;
    return Object.keys(commentsObj).map((commentId) => {
      const comment = commentsObj[commentId];
      const commentPath = parentPath
        ? `${parentPath}/comments/${commentId}`
        : `comments/${commentId}`;
      const isExpanded = expandedComments[commentId];
      // Determine author name safely
      const commentAuthor =
        (users[comment.userId] && users[comment.userId].name) ||
        comment.userName ||
        "Anonymous";
      const isPublished = comment.isPublished !== false;
      return (
        <div key={commentId} className="ml-4 border-l pl-4 mt-4">
          <p className="font-semibold">
            {commentAuthor}{" "}
            {suspendedUsers[comment.userId] && (
              <span className="text-red-500">(Suspended)</span>
            )}
          </p>
          <p className={isPublished ? "" : "line-through text-gray-500"}>
            {comment.text}
          </p>
          {comment.fileURL && (
            <div className="my-2">
              <img
                src={comment.fileURL}
                alt="Attachment"
                className="w-16 h-16 object-cover rounded-md cursor-pointer"
                onClick={() => window.open(comment.fileURL, "_blank")}
              />
            </div>
          )}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 mt-2">
            {suspendedUsers[comment.userId] ? (
              <button className="text-gray-400 text-sm" disabled>
                User Suspended
              </button>
            ) : (
              <>
                <button
                  className="text-red-500 text-sm"
                  onClick={() => handleSuspendUser(comment.userId)}
                >
                  Suspend User
                </button>
                <button
                  className="text-blue-500 text-sm"
                  onClick={() => handleUnsuspendUser(comment.userId)}
                >
                  Unsuspend User
                </button>
              </>
            )}
            <button
              className="text-yellow-500 text-sm"
              onClick={() =>
                handleToggleStatus(commentPath, comment.isPublished)
              }
            >
              {isPublished ? "Unpublish" : "Publish"}
            </button>
            <button
              className="text-red-600 text-sm"
              onClick={() => handleDeleteComment(commentPath, commentId)}
            >
              Delete
            </button>
            <button
              className="text-blue-500 text-sm"
              onClick={() =>
                setExpandedComments((prev) => ({
                  ...prev,
                  [commentId]: !prev[commentId],
                }))
              }
            >
              {expandedComments[commentId] ? "Collapse" : "Expand"}
            </button>
          </div>
          {expandedComments[commentId] &&
            comment.replies &&
            typeof comment.replies === "object" &&
            Object.keys(comment.replies).length > 0 && (
              <div className="ml-4 mt-4">
                {renderComments(comment.replies, commentPath)}
              </div>
            )}
        </div>
      );
    });
  };

  // ----- Render Reported Items Section -----
  const renderReports = () => {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Reported Items</h2>
        {/* Reported Devlogs */}
        {reports.devlogs && (
          <div>
            <h3 className="text-xl font-semibold">Reported Devlogs</h3>
            {Object.keys(reports.devlogs).map((devlogId) => {
              const reportItems = reports.devlogs[devlogId];
              return (
                <div key={devlogId} className="border p-2 my-2">
                  <p>
                    Devlog ID: <strong>{devlogId}</strong>
                  </p>
                  {Object.values(reportItems).map((rep) => (
                    <p key={rep.reportId} className="text-sm text-red-500">
                      Reported by {rep.userName} at{" "}
                      {new Date(rep.timestamp).toLocaleString()} - Reason:{" "}
                      {rep.reason}
                    </p>
                  ))}
                  <button
                    className="text-blue-500 underline text-sm mt-1"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Resolve and delete this reported devlog?"
                        )
                      ) {
                        const reportRef = ref(
                          db,
                          "devnote/reports/devlogs/" + devlogId
                        );
                        remove(reportRef)
                          .then(() => alert("Devlog report resolved."))
                          .catch((error) => {
                            console.error("Error resolving report:", error);
                            alert("Failed to resolve report.");
                          });
                      }
                    }}
                  >
                    Resolve Report
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {/* Reported Comments */}
        {reports.comments && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Reported Comments</h3>
            {Object.keys(reports.comments).map((commentId) => {
              const repGroup = reports.comments[commentId];
              return (
                <div key={commentId} className="border p-2 my-2">
                  <p>
                    Comment ID: <strong>{commentId}</strong>
                  </p>
                  {Object.values(repGroup).map((r) => (
                    <p key={r.reportId} className="text-sm text-red-500">
                      Reported by {r.userName} at{" "}
                      {new Date(r.timestamp).toLocaleString()} - Reason:{" "}
                      {r.reason}
                    </p>
                  ))}
                  <button
                    className="text-blue-500 underline text-sm mt-1"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Resolve and delete this reported comment?"
                        )
                      ) {
                        const reportRef = ref(
                          db,
                          "devnote/reports/comments/" + commentId
                        );
                        remove(reportRef)
                          .then(() => alert("Comment report resolved."))
                          .catch((error) => {
                            console.error(
                              "Error resolving comment report:",
                              error
                            );
                            alert("Failed to resolve comment report.");
                          });
                      }
                    }}
                  >
                    Resolve Report
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ----- Render Devlogs Table with Details -----
  return (
    <div
      className={
        theme === "dark"
          ? "bg-gray-900 text-white p-4"
          : "bg-white text-black p-4"
      }
    >
      <h1 className="text-2xl font-bold mb-4">Devlogs Management (Admin)</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search devlogs by title or author..."
          className="border p-2 rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full shadow-md rounded mb-6">
          <thead
            className={
              theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100"
            }
          >
            <tr>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Upvotes</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevlogs.map((devlog) => {
              // Safe retrieval of author name (already lowercased in filtering if needed)
              const authorName =
                (users[devlog.userId] && users[devlog.userId].name) ||
                "Unknown";
              return (
                <React.Fragment key={devlog.userId + "-" + devlog.devlogId}>
                  <tr
                    className={`text-center border-t ${
                      theme === "dark" ? "bg-gray-700" : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <img
                        src={devlog.image || "https://via.placeholder.com/150"}
                        alt={devlog.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">{devlog.title}</td>
                    <td className="px-4 py-2">{authorName}</td>
                    <td className="px-4 py-2">
                      {devlog.isPublished ? "Published" : "Unpublished"}
                    </td>
                    <td className="px-4 py-2">
                      {logUpvotes[devlog.devlogId] || 0}
                    </td>
                    <td className="px-4 py-2 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row justify-center">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        onClick={() => handleEditDevlog(devlog.devlogId)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() =>
                          handleDeleteDevlog(devlog.userId, devlog.devlogId)
                        }
                      >
                        Delete
                      </button>
                      <button
                        className="bg-yellow-500 text-black px-2 py-1 rounded hover:bg-yellow-600"
                        onClick={() =>
                          handleLogUpvote(devlog.userId, devlog.devlogId)
                        }
                      >
                        Upvote Log
                      </button>
                      <button
                        className="flex items-center text-green-500"
                        onClick={() =>
                          setExpandedDevlogId(
                            expandedDevlogId === devlog.devlogId
                              ? null
                              : devlog.devlogId
                          )
                        }
                      >
                        {expandedDevlogId === devlog.devlogId
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </td>
                  </tr>
                  {expandedDevlogId === devlog.devlogId && (
                    <tr>
                      <td colSpan="6" className="p-4">
                        <div>
                          <h3 className="text-lg font-semibold mt-4">Logs:</h3>
                          {devlog.logs ? (
                            <>
                              {Object.keys(devlog.logs).map((logId) => {
                                const logItem = devlog.logs[logId];
                                return (
                                  <div
                                    key={logId}
                                    className="border p-4 my-2 rounded"
                                  >
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-bold">
                                        {logItem.title}
                                      </h4>
                                      <div>
                                        <button
                                          className="text-blue-500 mr-2"
                                          onClick={() =>
                                            handleEditDevlog(devlog.devlogId)
                                          }
                                        >
                                          Edit Log
                                        </button>
                                        <button
                                          className="text-red-500"
                                          onClick={() =>
                                            handleDeleteLog(
                                              devlog.userId,
                                              devlog.devlogId,
                                              logId
                                            )
                                          }
                                        >
                                          Delete Log
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-gray-500">
                                      {logItem.description}
                                    </p>
                                    <div className="mt-2">
                                      <h5 className="font-semibold">
                                        Log Comments:
                                      </h5>
                                      {logItem.comments ? (
                                        renderComments(
                                          logItem.comments,
                                          "devnote/devlogs/" +
                                            devlog.userId +
                                            "/" +
                                            devlog.devlogId +
                                            "/logs/" +
                                            logId
                                        )
                                      ) : (
                                        <p>No comments</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          ) : (
                            <p>No logs available.</p>
                          )}
                          <div className="mt-4">
                            <h3 className="text-lg font-semibold">
                              Devlog Comments:
                            </h3>
                            {devlog.comments ? (
                              renderComments(
                                devlog.comments,
                                "devnote/devlogs/" +
                                  devlog.userId +
                                  "/" +
                                  devlog.devlogId
                              )
                            ) : (
                              <p>No comments</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {renderReports()}
    </div>
  );
};

export default DevlogsAdmin;
