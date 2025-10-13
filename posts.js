function displayPost(post) {
    // TODO: POST 객체(예: {title, content, author} 를 HTML문자열로 )
    // 예: "<h1>제목</h1> <p>내용</p> <p>작성자:작성자</p>"
}

function markAsImportant(post, isImportant) {
    // TODO: isImportant가 true 이면 post.title에 "중요: " 추가
}

//테스트
const post = {title: "공지사항", content: "서비스 점검안내", author: "admin"};
console.log(displayPost(post));
console.log(displayPost(markAsImportant(post, true)));