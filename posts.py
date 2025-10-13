def create_post(title, content, author):
    post = {"title": title, "content": content, "author": author}
    return post

def get_post_summary(post):
    return f"제목: {post['title']}, 작성자: {post['author']}"

#테스트
post = create_post("공지사항", "서비스 점검안내", "admin")
print(post)
print(get_post_summary(post))