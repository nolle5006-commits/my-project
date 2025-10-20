let isAdmin = false;

function updateUI() {
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const postForm = document.getElementById('postForm');
    if (!loginForm || !adminPanel || !postForm) {
        console.error('DOM 요소를 찾을 수 없음:', { loginForm, adminPanel, postForm });
        return;
    }
    loginForm.style.display = isAdmin ? 'none' : 'block';
    adminPanel.style.display = isAdmin ? 'block' : 'none';
    postForm.style.display = isAdmin ? 'block' : 'none';
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? 'block' : 'none';
        console.log('admin-only 요소:', el, 'display:', el.style.display, 'parent:', el.parentElement, 'offsetParent:', el.offsetParent);
    });
    console.log('UI 업데이트 - isAdmin:', isAdmin);
}

async function checkAdminStatus() {
    console.log('checkAdminStatus 호출');
    try {
        const response = await fetch('http://localhost:5001/admin/status', {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            isAdmin = data.is_admin;
        } else {
            console.warn('Admin 상태 확인 응답 오류:', response.status, response.statusText);
            isAdmin = false;
        }
    } catch (error) {
        console.error('Admin 상태 확인 실패:', error);
        isAdmin = false;
    }
    updateUI();
}

async function login() {
    console.log('login 호출');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            console.log('로그인 응답:', data);
            isAdmin = data.is_admin;
            updateUI();
            await checkAdminStatus();
            fetchPosts();
        } else {
            alert('로그인 실패: ' + (await response.text()));
        }
    } catch (error) {
        console.error('로그인 실패:', error);
    }
}

async function logout() {
    console.log('logout 호출');
    try {
        await fetch('http://localhost:5001/logout', {
            method: 'POST',
            credentials: 'include'
        });
        isAdmin = false;
        updateUI();
        fetchPosts();
    } catch (error) {
        console.error('로그아웃 실패:', error);
    }
}

function displayPost(post) {
    let html = `<h1>${post.title}</h1><p>${post.content}</p><p>작성자: ${post.author}</p>`;
    if (post.comment) {
        html += `<p>댓글: ${post.comment}</p>`;
    }
    if (isAdmin) {
        html += `<button class="update-btn admin-only" onclick="startUpdate(${post.id}, '${post.title}', '${post.content}', '${post.author}')">수정</button>`;
        html += `<button class="delete-btn admin-only" onclick="deletePost(${post.id})">삭제</button>`;
        console.log('버튼 추가 - post:', post.id, 'isAdmin:', isAdmin);
    } else {
        console.log('isAdmin이 false이므로 버튼 생략 - post:', post.id);
    }
    return html;
}

async function createPost() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author').value;

    if (!title || !content || !author) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const data = { title, content, author };
    try {
        const response = await fetch('http://localhost:5001/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('author').value = '';
        fetchPosts();
    } catch (error) {
        console.error('게시물 생성 실패:', error);
    }
}

async function deletePost(id) {
    if (!confirm('이 게시물을 삭제하시겠습니까?')) {
        return;
    }
    try {
        const response = await fetch(`http://localhost:5001/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        fetchPosts();
    } catch (error) {
        console.error('게시물 삭제 실패:', error.message);
    }
}

function startUpdate(id, title, content, author) {
    document.getElementById('updateId').value = id;
    document.getElementById('updateTitle').value = title;
    document.getElementById('updateContent').value = content;
    document.getElementById('updateAuthor').value = author;
    document.getElementById('updateForm').style.display = 'block';
}

function cancelUpdate() {
    document.getElementById('updateForm').style.display = 'none';
}

async function updatePost() {
    const id = document.getElementById('updateId').value;
    const title = document.getElementById('updateTitle').value;
    const content = document.getElementById('updateContent').value;
    const author = document.getElementById('updateAuthor').value;

    if (!title || !content || !author) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const data = { title, content, author };
    try {
        const response = await fetch(`http://localhost:5001/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        cancelUpdate();
        fetchPosts();
    } catch (error) {
        console.error('게시물 수정 실패:', error.message);
    }
}

async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:5001/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const posts = await response.json();
        const postsDiv = document.getElementById('posts');
        postsDiv.innerHTML = '';
        posts.forEach(post => {
            const postHtml = displayPost(post);
            postsDiv.innerHTML += `<div class="post">${postHtml}</div>`;
        });
        updateUI(); // 게시물 렌더링 후 UI 업데이트
    } catch (error) {
        console.error('게시물 조회 실패:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료');
    updateUI();
});