import React, { useState } from "react";

const Devnotes = () => {
  const [devnotes, setDevnotes] = useState([
    {
      id: 1,
      title: "Devnote on JavaScript",
      description: "Tips and tricks for mastering JavaScript.",
      image: "https://via.placeholder.com/150",
      content: "<p>Detailed JavaScript guide for beginners.</p>",
      date: "2023-09-15T10:00:00Z",
      author: "John Doe",
      status: "published",
      likes: [
        { id: 1, name: "Jane Smith", profilePic: "https://via.placeholder.com/40", status: "active" },
        { id: 2, name: "Bob Johnson", profilePic: "https://via.placeholder.com/40", status: "active" },
      ],
      dislikes: [
        { id: 3, name: "Alice Brown", profilePic: "https://via.placeholder.com/40", status: "active" },
      ],
      comments: [
        { id: 1, author: "Jane Smith", content: "Very helpful!", profilePic: "https://via.placeholder.com/40", status: "active" },
        { id: 2, author: "Bob Johnson", content: "Loved the examples!", profilePic: "https://via.placeholder.com/40", status: "active" },
      ],
    },
    {
      id: 2,
      title: "Devnote on React",
      description: "Best practices for building React applications.",
      image: "https://via.placeholder.com/150",
      content: "<p>Comprehensive guide on React.</p>",
      date: "2023-09-20T12:30:00Z",
      author: "Jane Smith",
      status: "unpublished",
      likes: [
        { id: 4, name: "John Doe", profilePic: "https://via.placeholder.com/40", status: "active" },
      ],
      dislikes: [],
      comments: [
        { id: 1, author: "John Doe", content: "Very insightful!", profilePic: "https://via.placeholder.com/40", status: "active" },
      ],
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedDevnoteId, setExpandedDevnoteId] = useState(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState(null);
  const [expandedLikesId, setExpandedLikesId] = useState(null);
  const [expandedDislikesId, setExpandedDislikesId] = useState(null);

  // Handlers
  const handleFilterChange = (status) => setFilterStatus(status);

  const handleToggleStatus = (devnoteId) => {
    setDevnotes((prev) =>
      prev.map((devnote) =>
        devnote.id === devnoteId
          ? { ...devnote, status: devnote.status === "published" ? "unpublished" : "published" }
          : devnote
      )
    );
  };

  const handleSuspendUser = (userId, type, devnoteId) => {
    setDevnotes((prev) =>
      prev.map((devnote) => {
        if (devnote.id === devnoteId) {
          const updateStatus = (userList) =>
            userList.map((user) =>
              user.id === userId ? { ...user, status: "suspended" } : user
            );

          if (type === "like") {
            return { ...devnote, likes: updateStatus(devnote.likes) };
          } else if (type === "dislike") {
            return { ...devnote, dislikes: updateStatus(devnote.dislikes) };
          } else if (type === "comment") {
            return { ...devnote, comments: updateStatus(devnote.comments) };
          }
        }
        return devnote;
      })
    );
  };

  const handleRemoveComment = (devnoteId, commentId) => {
    setDevnotes((prev) =>
      prev.map((devnote) =>
        devnote.id === devnoteId
          ? { ...devnote, comments: devnote.comments.filter((comment) => comment.id !== commentId) }
          : devnote
      )
    );
  };

  const filteredDevnotes =
    filterStatus === "all" ? devnotes : devnotes.filter((devnote) => devnote.status === filterStatus);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Devnotes Management</h1>

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Status:</label>
        <select
          className="p-2 border rounded"
          value={filterStatus}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {/* Devnotes Table */}
      <table className="table-auto w-full bg-white shadow-md rounded mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Author</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevnotes.map((devnote) => (
            <React.Fragment key={devnote.id}>
              <tr className="text-center border-t">
                <td className="px-4 py-2">{devnote.title}</td>
                <td className="px-4 py-2">{devnote.author}</td>
                <td className="px-4 py-2">{devnote.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleToggleStatus(devnote.id)}
                  >
                    {devnote.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    onClick={() =>
                      setExpandedDevnoteId(expandedDevnoteId === devnote.id ? null : devnote.id)
                    }
                  >
                    {expandedDevnoteId === devnote.id ? "Hide Details" : "View Details"}
                  </button>
                </td>
              </tr>

              {/* Expanded Details */}
              {expandedDevnoteId === devnote.id && (
                <tr>
                  <td colSpan="4" className="p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold">Description:</h3>
                    <p>{devnote.description}</p>
                    <img
                      src={devnote.image}
                      alt="Devnote"
                      className="w-32 h-32 object-cover rounded my-2"
                    />
                    <h3 className="text-lg font-semibold mt-4">Content:</h3>
                    <div dangerouslySetInnerHTML={{ __html: devnote.content }} />
                    <h3 className="text-lg font-semibold mt-4">Date:</h3>
                    <p>{new Date(devnote.date).toLocaleString()}</p>

                    {/* Likes */}
                    <h3 className="text-lg font-semibold mt-4">Likes:</h3>
                    <button
                      className="text-blue-500 underline mb-2"
                      onClick={() =>
                        setExpandedLikesId(expandedLikesId === devnote.id ? null : devnote.id)
                      }
                    >
                      {expandedLikesId === devnote.id ? "Hide Likes" : "View Likes"}
                    </button>
                    {expandedLikesId === devnote.id && (
                      <ul className="list-disc ml-6">
                        {devnote.likes.map((like) => (
                          <li key={like.id} className="flex items-center mb-2">
                            <img
                              src={like.profilePic}
                              alt={like.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <span>{like.name} ({like.status})</span>
                            <button
                              className="ml-4 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                              onClick={() => handleSuspendUser(like.id, "like", devnote.id)}
                            >
                              Suspend
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Dislikes */}
                    <h3 className="text-lg font-semibold mt-4">Dislikes:</h3>
                    <button
                      className="text-blue-500 underline mb-2"
                      onClick={() =>
                        setExpandedDislikesId(expandedDislikesId === devnote.id ? null : devnote.id)
                      }
                    >
                      {expandedDislikesId === devnote.id ? "Hide Dislikes" : "View Dislikes"}
                    </button>
                    {expandedDislikesId === devnote.id && (
                      <ul className="list-disc ml-6">
                        {devnote.dislikes.map((dislike) => (
                          <li key={dislike.id} className="flex items-center mb-2">
                            <img
                              src={dislike.profilePic}
                              alt={dislike.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <span>{dislike.name} ({dislike.status})</span>
                            <button
                              className="ml-4 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                              onClick={() => handleSuspendUser(dislike.id, "dislike", devnote.id)}
                            >
                              Suspend
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Comments */}
                    <h3 className="text-lg font-semibold mt-4">Comments:</h3>
                    <button
                      className="text-blue-500 underline"
                      onClick={() =>
                        setExpandedCommentsId(expandedCommentsId === devnote.id ? null : devnote.id)
                      }
                    >
                      {expandedCommentsId === devnote.id ? "Hide Comments" : "View Comments"}
                    </button>
                    {expandedCommentsId === devnote.id && (
                      <ul className="list-disc ml-6">
                        {devnote.comments.map((comment) => (
                          <li
                            key={comment.id}
                            className="flex justify-between items-center border-b pb-2 mb-2"
                          >
                            <div className="flex items-center space-x-4">
                              <img
                                src={comment.profilePic}
                                alt={comment.author}
                                className="w-8 h-8 rounded-full"
                              />
                              <span>
                                <strong>{comment.author}:</strong> {comment.content}
                              </span>
                            </div>
                            <div className="space-x-2">
                              <button
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                onClick={() => handleRemoveComment(devnote.id, comment.id)}
                              >
                                Remove
                              </button>
                              <button
                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                onClick={() => handleSuspendUser(comment.id, "comment", devnote.id)}
                              >
                                Suspend
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
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

export default Devnotes;
