import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from "react-icons/ai";

const Devlogs = () => {
  const [devlogs, setDevlogs] = useState([]);
  const [expandedDevlogId, setExpandedDevlogId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [suspendedUsers, setSuspendedUsers] = useState({}); // Track suspended users

  const db = getDatabase();

  // Fetch devlogs
  useEffect(() => {
    const devlogsRef = ref(db, "devnote/devlogs");
    const usersRef = ref(db, "devnote/users");

    onValue(devlogsRef, (snapshot) => {
      const data = snapshot.val();
      const formattedDevlogs = [];
      if (data) {
        Object.keys(data).forEach((userId) => {
          Object.keys(data[userId]).forEach((devlogId) => {
            formattedDevlogs.push({
              ...data[userId][devlogId],
              userId,
              devlogId,
            });
          });
        });
      }
      setDevlogs(formattedDevlogs);
    });

    // Fetch suspended users
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const suspended = {};
      if (data) {
        Object.keys(data).forEach((userId) => {
          if (data[userId].isSuspended) {
            suspended[userId] = true;
          }
        });
      }
      setSuspendedUsers(suspended);
    });
  }, [db]);

  // Suspend a commenter
  const handleSuspendCommenter = (userId) => {
    if (!userId) return;
    const userRef = ref(db, `devnote/users/${userId}`);
    update(userRef, { isSuspended: true })
      .then(() => {
        setSuspendedUsers((prev) => ({ ...prev, [userId]: true }));
        alert("User has been suspended successfully.");
      })
      .catch((error) => {
        console.error("Error suspending commenter:", error);
        alert("Failed to suspend the user. Please try again.");
      });
  };

  // Toggle devlog status (publish/unpublish)
  const handleToggleStatus = (userId, devlogId, isPublished) => {
    const devlogRef = ref(db, `devnote/devlogs/${userId}/${devlogId}`);
    update(devlogRef, { isPublished: !isPublished }).catch((error) =>
      console.error("Error toggling devlog status:", error)
    );
  };

  // Handle likes/dislikes
  const handleLikeDislike = (path, type, userId) => {
    const actionRef = ref(db, `${path}/${type}/${userId}`);
    const oppositeType = type === "likes" ? "dislikes" : "likes";
    const oppositeActionRef = ref(db, `${path}/${oppositeType}/${userId}`);

    onValue(
      actionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          remove(actionRef).catch((error) => console.error("Error removing like/dislike:", error));
        } else {
          update(actionRef, {
            userId,
            timestamp: new Date().toISOString(),
          }).catch((error) => console.error("Error adding like/dislike:", error));

          // Remove opposite action
          onValue(
            oppositeActionRef,
            (oppositeSnap) => {
              if (oppositeSnap.exists()) remove(oppositeActionRef);
            },
            { onlyOnce: true }
          );
        }
      },
      { onlyOnce: true }
    );
  };

  // Render comments and replies
  const renderComments = (comments, parentPath = "") => {
    return Object.keys(comments || {}).map((commentId) => {
      const comment = comments[commentId];
      const commentPath = `${parentPath ? `${parentPath}/` : ""}comments/${commentId}`;
      const isExpanded = expandedComments[commentId];
      const isSuspended =
        suspendedUsers[comment.user?.id] || comment.user?.isSuspended;

      return (
        <div key={commentId} className="ml-4 border-l pl-4 mt-4">
          <p className="font-semibold">
            {comment.user?.name || "Anonymous"}{" "}
            {isSuspended && <span className="text-red-500">(Suspended)</span>}:
          </p>
          <p>{comment.text}</p>
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
            <button
              className={`text-sm ${
                isSuspended ? "text-gray-400 cursor-not-allowed" : "text-red-500"
              }`}
              disabled={isSuspended}
              onClick={() => handleSuspendCommenter(comment.user?.id)}
            >
              {isSuspended ? "User Suspended" : "Suspend User"}
            </button>
            <button
              className="flex items-center text-green-500"
              onClick={() => handleLikeDislike(commentPath, "likes", comment.user?.id)}
            >
              {comment.likes?.[comment.user?.id] ? <AiFillLike /> : <AiOutlineLike />}
              <span className="ml-1">{Object.keys(comment.likes || {}).length}</span>
            </button>
            <button
              className="flex items-center text-red-500"
              onClick={() => handleLikeDislike(commentPath, "dislikes", comment.user?.id)}
            >
              {comment.dislikes?.[comment.user?.id] ? <AiFillDislike /> : <AiOutlineDislike />}
              <span className="ml-1">{Object.keys(comment.dislikes || {}).length}</span>
            </button>
            <button
              className="text-blue-500 text-sm"
              onClick={() =>
                setExpandedComments((prev) => ({ ...prev, [commentId]: !isExpanded }))
              }
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
          {isExpanded && comment.replies && renderComments(comment.replies, commentPath)}
        </div>
      );
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Devlogs Management</h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white shadow-md rounded mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devlogs.map((devlog) => (
              <React.Fragment key={`${devlog.userId}-${devlog.devlogId}`}>
                <tr className="text-center border-t">
                  <td className="px-4 py-2">
                    <img
                      src={devlog.image || "https://via.placeholder.com/150"}
                      alt={devlog.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-4 py-2">{devlog.title}</td>
                  <td className="px-4 py-2">
                    {devlog.author || "Unknown"}{" "}
                    {suspendedUsers[devlog.userId] && (
                      <span className="text-red-500">(Suspended)</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{devlog.isPublished ? "Published" : "Unpublished"}</td>
                  <td className="px-4 py-2 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row justify-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      onClick={() =>
                        handleToggleStatus(devlog.userId, devlog.devlogId, devlog.isPublished)
                      }
                    >
                      {devlog.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() =>
                        setExpandedDevlogId(
                          expandedDevlogId === devlog.devlogId ? null : devlog.devlogId
                        )
                      }
                    >
                      {expandedDevlogId === devlog.devlogId ? "Hide Details" : "View Details"}
                    </button>
                  </td>
                </tr>

                {expandedDevlogId === devlog.devlogId && (
                  <tr>
                    <td colSpan="5" className="p-4 bg-gray-50">
                      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <img
                          src={devlog.image || "https://via.placeholder.com/150"}
                          alt="Devlog"
                          className="w-32 h-32 object-cover rounded-md mx-auto md:mx-0"
                        />
                        <div>
                          <h3 className="text-lg font-semibold">{devlog.description}</h3>
                          <div className="flex flex-col md:flex-row mt-4 space-y-2 md:space-y-0 md:space-x-4">
                            <button
                              className="flex items-center text-green-500"
                              onClick={() =>
                                handleLikeDislike(
                                  `devnote/devlogs/${devlog.userId}/${devlog.devlogId}`,
                                  "likes",
                                  devlog.userId
                                )
                              }
                            >
                              <AiOutlineLike />
                              <span className="ml-1">
                                {Object.keys(devlog.likes || {}).length}
                              </span>
                            </button>
                            <button
                              className="flex items-center text-red-500"
                              onClick={() =>
                                handleLikeDislike(
                                  `devnote/devlogs/${devlog.userId}/${devlog.devlogId}`,
                                  "dislikes",
                                  devlog.userId
                                )
                              }
                            >
                              <AiOutlineDislike />
                              <span className="ml-1">
                                {Object.keys(devlog.dislikes || {}).length}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mt-4">Comments:</h3>
                      {devlog.comments ? (
                        <div>{renderComments(devlog.comments)}</div>
                      ) : (
                        <p>No Comments</p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devlogs;
