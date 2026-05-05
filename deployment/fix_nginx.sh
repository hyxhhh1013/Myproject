#!/bin/bash
set -e

echo "正在修复 Nginx 配置..."

# 1. 强制删除 Nginx 默认配置
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "发现默认配置，正在删除..."
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# 2. 重新链接我们的配置
echo "重新链接站点配置..."
sudo ln -sf /etc/nginx/sites-available/personal-website /etc/nginx/sites-enabled/

# 3. 确保网站目录权限正确
echo "修复目录权限..."
sudo chown -R $USER:$USER /var/www/personal-website
sudo chmod -R 755 /var/www/personal-website

# 4. 检查并重启 Nginx
echo "重启 Nginx..."
sudo nginx -t
sudo systemctl restart nginx

echo "修复完成！请刷新浏览器访问。"
