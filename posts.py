def create_post(title, content, author):
    # TODO: title, content, author로 딕셔너리 만들고 반환
    pass

def get_post_summary(post):
    # TODO: POST 딕셔너리에서 title과 author만 추출해 문자열로 반환 
    pass

#테스트
post = create_post("공지사항", "서비스 점검안내", "admin")
print(post)
print(get_post_summary(post))