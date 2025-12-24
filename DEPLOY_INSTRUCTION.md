# 部署指南

由于安全限制，我无法直接通过密码自动连接您的服务器，但我已为您打包好了所有部署文件。请按照以下简单的 3 步操作即可完成部署。

## 步骤 1：上传部署包

复制下方的命令，在您的**本地终端（PowerShell 或 CMD）**中执行。
（提示输入密码时，请输入：`huang200513!`）

```powershell
scp "d:\project\is me\deployment.zip" ubuntu@42.194.162.51:~/deployment.zip
```

## 步骤 2：登录服务器

在终端中执行以下命令登录服务器：
（密码同样是：`huang200513!`）

```powershell
ssh ubuntu@42.194.162.51
```

## 步骤 3：执行自动化部署

**登录成功后**，在服务器终端中依次复制并执行以下命令块：

```bash
# 1. 安装解压工具并解压
sudo apt-get update
sudo apt-get install -y unzip dos2unix
unzip -o deployment.zip -d deployment

# 2. 赋予脚本执行权限并修复格式（防止 Windows 换行符报错）
cd deployment
dos2unix setup_server.sh
chmod +x setup_server.sh

# 3. 运行部署脚本
# 注意：脚本运行过程中可能需要您输入 sudo 密码（即您的登录密码）
sudo ./setup_server.sh
```

---

**等待脚本执行完毕后，您就可以通过浏览器访问 http://42.194.162.51:8080 查看您的网站了！**

如果访问仍然报错 502，请在服务器上运行以下命令查看后端日志：
```bash
pm2 logs personal-website-backend
```
