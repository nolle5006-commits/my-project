function displayPost(post) {
    let html = `<h1>${post.title}</h1><p>${post.content}</p><p>작성자: ${post.author}</p>`;
    if (post.comment) {
        html += `<p>댓글: ${post.comment}</p>`;
    }
    return html;
}

function markAsImportant(post, isImportant) {
    if (isImportant) {
        return { ...post, title: "중요: " + post.title };
    }
    return post;
}

function addComment(post, comment) {
    return { ...post, comment: comment };
}

async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:5001/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const posts = await response.json();
        const postsDiv = document.getElementById('posts');
        postsDiv.innerHTML = '';
        posts.forEach(post => {
            const postHtml = displayPost(post);
            postsDiv.innerHTML += `<div class="post">${postHtml}</div>`;
        });
    } catch (error) {
        console.error('게시물 조회 실패:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchPosts);