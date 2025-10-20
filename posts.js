function displayPost(post) {
    let html = `<h1>${post.title}</h1><p>${post.content}</p><p>작성자: ${post.author}</p>`;
    if (post.comment) {
        html += `<p>댓글: ${post.comment}</p>`;
    }
    html += `<button class="delete-btn" onclick ="deletePost(${post.id})">삭제</button>`;
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

async function createPost() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author').value;

    const data = {title, content, author};
    try {
        const response = await fetch('http://localhost:5001/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        fetchPosts(); //새로고침
    }catch(error) {
        console.error('게시물 생성실패: ', error);
    }
}

async function deletePost(id) {
    try {
        const response = await fetch(`http://localhost:5001/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        fetchPosts(); //새로고침
    } catch(error) {
        console.error('게시물 삭제 실패: ', error);
    }
}


document.addEventListener('DOMContentLoaded', fetchPosts);