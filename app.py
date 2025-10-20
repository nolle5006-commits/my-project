from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import datetime
import json
import os
import sqlite3

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.secret_key = '1234'  # 보안상 랜덤 값으로 변경 권장
CORS(app, resources={
    r"/posts/*": {"origins": "http://localhost:8000", "methods": ["GET", "POST", "PUT", "DELETE"], "supports_credentials": True},
    r"/login": {"origins": "http://localhost:8000", "methods": ["POST"], "supports_credentials": True},
    r"/admin/status": {"origins": "http://localhost:8000", "methods": ["GET"], "supports_credentials": True},
    r"/logout": {"origins": "http://localhost:8000", "methods": ["POST"], "supports_credentials": True}
}, supports_credentials=True)

def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    try:
        c.execute('''CREATE TABLE IF NOT EXISTS users
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      username TEXT NOT NULL UNIQUE,
                      password TEXT NOT NULL,
                      is_admin INTEGER DEFAULT 0)''')
        c.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
        if c.fetchone()[0] == 0:
            c.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)", ('admin', '1234', 1))
        conn.commit()
        print("DB 초기화 완료: users 테이블 생성 및 Admin 추가")
    except sqlite3.Error as e:
        print(f"DB 초기화 오류: {e}")
    finally:
        conn.close()

def init_json():
    if not os.path.exists('posts.json'):
        with open('posts.json', 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False)

# 인증 확인 데코레이터 (고유 이름 생성)
def require_admin(f):
    def wrapper(*args, **kwargs):
        if not session.get('is_admin'):
            return jsonify({"message": "Admin 권한이 필요합니다."}), 403
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__ + '_secured'  # 고유 이름 부여
    return wrapper

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
    user = c.fetchone()
    conn.close()
    
    if user and user[3] == 1:
        session['is_admin'] = True
        return jsonify({"message": "로그인 성공", "is_admin": True}), 200
    else:
        return jsonify({"message": "로그인 실패"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('is_admin', None)
    return jsonify({"message": "로그아웃 완료"}), 200

@app.route('/admin/status', methods=['GET'])
def admin_status():
    is_admin = session.get('is_admin', False)
    return jsonify({"is_admin": is_admin})

@app.route('/posts', methods=['POST'])
@require_admin
def create_post():
    data = request.get_json(force=True)
    title = data.get('title')
    content = data.get('content')
    author = data.get('author')
    created_at = datetime.now().isoformat()
    
    with open('posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    
    new_post = {
        "id": len(posts) + 1,
        "title": title,
        "content": content,
        "author": author,
        "created_at": created_at
    }
    posts.append(new_post)
    
    with open('posts.json', 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    
    return jsonify({"message": "게시물 생성 완료"}), 201

@app.route('/posts/<int:id>', methods=['PUT'])
@require_admin
def update_post(id):
    data = request.get_json(force=True)
    title = data.get('title')
    content = data.get('content')
    author = data.get('author')
    
    with open('posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    
    post = next((p for p in posts if p['id'] == id), None)
    if post is None:
        return jsonify({"message": "게시물을 찾을 수 없습니다."}), 404
    
    post['title'] = title if title is not None else post['title']
    post['content'] = content if content is not None else post['content']
    post['author'] = author if author is not None else post['author']
    post['updated_at'] = datetime.now().isoformat()
    
    with open('posts.json', 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    
    return jsonify({"message": "게시물 수정 완료"}), 200

@app.route('/posts/<int:id>', methods=['DELETE'])
@require_admin
def delete_post(id):
    with open('posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    posts = [p for p in posts if p['id'] != id]
    with open('posts.json', 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    return jsonify({"message": "게시물 삭제 완료"}), 200

@app.route('/posts', methods=['GET'])
def get_posts():
    with open('posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    return jsonify(posts), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    print(f"404 발생 - 요청 경로: {request.path}")
    return jsonify({"error": "Not Found"}), 404

if __name__ == '__main__':
    init_db()
    init_json()
    app.run(debug=True, port=5001)