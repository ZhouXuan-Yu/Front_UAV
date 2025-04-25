# 使用内网发送邮件--测试代码


import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
 
# 设置发件人邮箱地址和 QQ 邮箱授权码
sender_email = "1241515924@qq.com"
# 我的个人隐私密码，不要随便泄露
app_password = "lszowfvdnwwxjged"
 
# 设置收件人邮箱地址
receiver_email = "2356648915@qq.com"
 
# 创建邮件内容
message = MIMEMultipart()
message["From"] = sender_email
message["To"] = receiver_email
message["Subject"] = "I love you."
 
 
# 邮件正文内容
body = "you are my sunshine."
message.attach(MIMEText(body, "plain"))
 
# 连接到 QQ 邮箱的 SMTP 服务器
server = smtplib.SMTP_SSL("smtp.qq.com", 465)
server.login(sender_email, app_password)
 
# 发送邮件
server.sendmail(sender_email, receiver_email, message.as_string())
print("Email sent successfully!")