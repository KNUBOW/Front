import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import api from "../lib/api";
import "../styles/BoardDetailPage.css";

const BoardDetailPage = () => {
  const location = useLocation();
  const id = location.state?.postId;
  const [post, setPost] = useState(null);

  useEffect(() => {
    document.title = "게시글 상세 - 보드";
    fetchPostDetail(id);
  }, [id]);

  const fetchPostDetail = async (postId) => {
    try {
      const res = await api.get(`/board/${postId}`, { withCredentials: true });
      setPost(res.data);
    } catch (error) {
      console.error("[fetchPostDetail 실패]", error);
    }
  };

  return (
    <div className="board-detail-page">
      <TopBar />
      <div className="board-detail-container">
        <h2 className="board-detail-title">게시글 상세</h2>
        <div className="board-detail-content">
          {post ? (
            <div className="board-detail-post">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              {/* Add more post details as needed */}
            </div>
          ) : (
            <p>게시글을 불러오는 중입니다...</p>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default BoardDetailPage;