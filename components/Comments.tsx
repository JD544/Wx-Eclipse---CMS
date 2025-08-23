import React, { useState } from 'react';

// Simple static comment data
const comments = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b586?w=150&h=150&fit=crop&crop=face",
    date: "2 hours ago",
    text: "Great article! Really helped me understand the concepts better."
  },
  {
    id: 2,
    author: "Mike Johnson", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    date: "4 hours ago",
    text: "Thanks for sharing this. The examples were really clear."
  },
  {
    id: 3,
    author: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", 
    date: "6 hours ago",
    text: "I've bookmarked this for future reference. Very helpful!"
  }
];

const SimpleComments = () => {
  const [newComment, setNewComment] = useState('');
  const [commentList, setCommentList] = useState(comments);

  const handleSubmit = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: "You",
        avatar: "https://ui-avatars.com/api/?name=You&background=6366f1&color=fff&size=150",
        date: "Just now",
        text: newComment
      };
      setCommentList([comment, ...commentList]);
      setNewComment('');
    }
  };

  return (
    <div className="wx-blog-comments">
      <h2 className="wx-blog-comments-title">Comments ({commentList.length})</h2>
      
      {/* Simple Comment Form */}
      <div className="wx-blog-comment-form">
        <h3 className="wx-blog-comment-form-title">Leave a comment</h3>
        <div className="wx-blog-comment-form-field">
          <label>Your comment</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            rows={4}
          />
        </div>
        <div className="wx-powered-by">
          <p>
            Powered by <a href="https://wxeclipse.com">WX</a>
          </p>
        </div>
        <button onClick={handleSubmit} className="wx-blog-comment-form-button">
          Post Comment
        </button>
      </div>

      {/* Comments List */}
      <div style={{ marginTop: '2rem' }}>
        {commentList.map(comment => (
          <div key={comment.id} className="wx-blog-comment">
            <div className="wx-blog-comment-avatar">
              <img src={comment.avatar} alt={comment.author} />
            </div>
            <div className="wx-blog-comment-content">
              <div className="wx-blog-comment-header">
                <span className="wx-blog-comment-author">{comment.author}</span>
                <span className="wx-blog-comment-date">{comment.date}</span>
              </div>
              <p className="wx-blog-comment-text">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleComments;