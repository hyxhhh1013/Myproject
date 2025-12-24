#!/bin/bash
set -e

echo "正在将网站端口修改为 8080 以绕过备案拦截..."

# 1. 强制修改 Nginx 配置（无论之前是什么端口）
# 先将所有 listen 行删除，然后重新插入
sudo sed -i '/listen/d' /etc/nginx/sites-available/personal-website
# 在 server { 下一行插入 listen 8080;
sudo sed -i '/server_name/i \    listen 8080;' /etc/nginx/sites-available/personal-website

# 2. 检查并重启 Nginx
sudo nginx -t
sudo systemctl restart nginx

echo "=============================================="
echo "端口修改成功！"
echo "请务必执行以下最后一步："
echo "登录腾讯云控制台 -> 服务器 -> 安全组 -> 添加规则 -> 开放 TCP:8080 端口"
echo "=============================================="
echo "之后访问地址变为: http://42.194.162.51:8080"
