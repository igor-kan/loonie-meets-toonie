// chrome-extension/src/popup/Popup.tsx
import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import "../index.css";

const Popup: React.FC = () => {
  const [review, setReview] = useState("");
  const [voteMessage, setVoteMessage] = useState("");

  const handleVote = async (vote: number) => {
    try {
      const response = await fetch("https://api.yourdomain.com/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // Add auth header if social auth is integrated
        },
        body: JSON.stringify({
          productId: 1, // Replace with actual product id from context
          userId: "example-user", // Replace with actual user id from auth
          vote
        })
      });
      const data = await response.json();
      setVoteMessage("Vote registered!");
      console.log("Vote response:", data);
    } catch (error) {
      console.error("Error voting:", error);
      setVoteMessage("Error voting. Please try again.");
    }
  };

  const handleSubmitReview = async () => {
    console.log("Review submitted:", review);
    // Add functionality to submit review (e.g., via the same API endpoint)
    setReview("");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Buy Canadian</h1>
      <div className="mb-4">
        <p>No product data available.</p>
      </div>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            className="bg-green-500 text-white px-2 py-1 rounded"
            onClick={() => handleVote(1)}
          >
            👍 Upvote
          </button>
          <button
            className="bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => handleVote(-1)}
          >
            👎 Downvote
          </button>
        </div>
        {voteMessage && <p className="text-sm text-blue-500">{voteMessage}</p>}
        <textarea
          className="w-full border p-1 rounded"
          placeholder="Add a review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded"
          onClick={handleSubmitReview}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
