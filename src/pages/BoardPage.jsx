import TopBar from '../components/TopBar';
import TopNav from '../components/TopNav';
import TabBar from '../components/TabBar';
import '../styles/TopShell.css';
import '../styles/BoardPage.css';

const BoardPage = () => {
  const navItems = [
    { label: '오늘 뭐 해먹지?', to: '/' },
    { label: '추천 요리', to: '/recommend' },
    { label: '게시판', to: '/board' },
    { label: '랭킹', to: '/rank' },
  ];

  return (
    <div className="board-page">
      <div className="board-wrap">
        {/* 상단 고정 영역들 */}
        <TopBar />
        <TopNav items={navItems} />

        {/* ⬇️ 중앙 스크롤 전용 영역 */}
        <main className="board-content" role="main" aria-label="게시판 피드">
          {/* ── 피드 카드 한 개 (샘플) ── */}
          <article className="post-card" aria-label="피드 게시글">
            {/* 헤더 */}
            <header className="post-head">
              <div className="post-author">
                <div className="avatar" aria-hidden="true" />
                <div className="meta">
                  <strong className="name">성민</strong>
                  <span className="time" aria-label="작성 시간">• 2시간 전</span>
                </div>
              </div>
              <button className="post-more" aria-label="더보기 메뉴">•••</button>
            </header>

            {/* 미디어(배너/이미지 자리) */}
            <div className="post-media" role="img" aria-label="요리 사진">
              <div className="media-inner">
                <p className="media-caption">내가 만든 맛있는 파스타!</p>
              </div>

              {/* 페이지 인디케이터 (데코) */}
              <div className="dots" aria-hidden="true">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>

            {/* 바닥 정보/액션 */}
            <div className="post-body">
              <div className="likes" aria-label="좋아요 수">
                <span className="heart" role="img" aria-label="좋아요">❤️</span>
                <strong>100</strong>
              </div>
              <p className="comment">
                정말 맛있게 먹었어요~
              </p>
              <div className="actions">
                <button className="btn-like" aria-label="좋아요 추가">❤️</button>
                <button className="btn-reply" aria-label="답글">⟳</button>
              </div>
            </div>
          </article>

          {/* 글쓰기 버튼 (목업) */}
          <div className="write-area">
            <button className="write-btn" type="button">글 쓰기</button>
          </div>

          {/* 필요 시 더 많은 카드들을 이어서 렌더링 */}
        </main>

        {/* 하단 탭 고정 */}
        <TabBar />
      </div>
    </div>
  );
};

export default BoardPage;
