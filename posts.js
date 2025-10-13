function displayPost(post) {
    return `<h1>${post.title}</h1><p>${post.content}</p><p>작성자:${post.author}</p>`;
}

function markAsImportant(post, isImportant) {
    if(isImportant) {
        return {...post, title: "중요: " + post.title}; //새로운 객체반환
    }
    return post;
}

//테스트
const post = {title: "공지사항", content: "서비스 점검안내", author: "admin"};
console.log(displayPost(post));
console.log(displayPost(markAsImportant(post, true)));