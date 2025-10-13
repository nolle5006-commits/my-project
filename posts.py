from datetime import datetime

def create_post(title, content, author):
    return {"title": title, "content": content, "author": author}

def get_post_summary(post):
    return f"제목: {post['title']}, 작성자: {post['author']}"

def add_timestamp(post):
    # 새 딕셔너리 생성
    return {**post, "created_at": datetime.now()}
    

# 테스트
post = create_post("공지사항", "서비스 점검 안내", "admin")
post_with_time = add_timestamp(post)
print(post_with_time)
print(get_post_summary(post_with_time))