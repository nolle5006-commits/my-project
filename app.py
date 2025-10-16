from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app, resources={r"/posts": {"origins": "http://localhost:8000"}})  # 명시적 CORS

def init_json():
    if not os.path.exists('posts.json'):
        with open('posts.json', 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False)

@app.route('/posts', methods=['POST'])
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
    
    response = jsonify({"message": "게시물 생성 완료", "post": data})
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response, 201

@app.route('/posts', methods=['GET'])
def get_posts():
    with open('posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    response = jsonify(posts)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response, 200

if __name__ == '__main__':
    init_json()
    app.run(debug=True, port=5001)