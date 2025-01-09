import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from "react-icons/ai";

const Devlogs = () => {
  const [devlogs, setDevlogs] = useState([]);
  const [expandedDevlogId, setExpandedDevlogId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  const db = getDatabase();

  // Fetch devlogs
  useEffect(() => {
    const devlogsRef = ref(db, "devnote/devlogs");
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
  }, [db]);

  // Toggle devlog status (publish/unpublish)
  const handleToggleStatus = (userId, devlogId, isPublished) => {
    const devlogRef = ref(db, `devnote/devlogs/${userId}/${devlogId}`);
    update(devlogRef, { isPublished: !isPublished }).catch((error) =>
      console.error("Error toggling devlog status:", error)
    );
  };

  // Suspend a user by updating isSuspended to true
  const handleSuspendCommenter = (userId) => {
    if (!userId) return;
    const userRef = ref(db, `devnote/users/${userId}`);
    update(userRef, { isSuspended: true })
      .then(() => {
        alert("User has been suspended successfully.");
      })
      .catch((error) => {
        console.error("Error suspending commenter:", error);
        alert("Failed to suspend the user. Please try again.");
      });
  };

  // Render comments and replies
  const renderComments = (comments, parentPath = "") => {
    return Object.keys(comments || {}).map((commentId) => {
      const comment = comments[commentId];
      const commentPath = `${parentPath ? `${parentPath}/` : ""}comments/${commentId}`;
      const isExpanded = expandedComments[commentId];

      return (
        <div key={commentId} className="ml-4 border-l pl-4 mt-4">
          <p className="font-semibold">
            {comment.user?.name || "Anonymous"}{" "}
            {comment.user?.isSuspended && <span className="text-red-500">(Suspended)</span>}:
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
          <div className="flex items-center space-x-2 mt-2">
            <button
              className="text-red-500 text-sm"
              onClick={() => handleSuspendCommenter(comment.user?.id)}
            >
              Suspend User
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
                <td className="px-4 py-2">{devlog.author || "Unknown"}</td>
                <td className="px-4 py-2">{devlog.isPublished ? "Published" : "Unpublished"}</td>
                <td className="px-4 py-2 space-x-2">
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
                    <div className="flex space-x-4">
                      <img
                        src={devlog.image || "https://via.placeholder.com/150"}
                        alt="Devlog"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{devlog.description}</h3>
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
  );
};

export default Devlogs;
