import sqlite3

conn = sqlite3.connect('posts.db', check_same_thread=False, uri=True)
conn.execute('PRAGMA encoding="UTF-8"')
c = conn.cursor()
c.execute("SELECT * FROM posts")
posts = c.fetchall()
for post in posts:
    print(post)
    
conn.close()