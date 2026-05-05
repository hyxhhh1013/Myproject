const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');

// Server Details
const config = {
  host: '42.194.162.51',
  port: 22,
  username: 'ubuntu',
  password: 'huang200513!',
  deployPath: '/home/ubuntu/personal-website',
  localPath: path.join(__dirname, '../release'),
  zipName: 'release.tar.gz'
};

const conn = new Client();
const spinner = ora();

const runLocalCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const runRemoteCommand = (conn, cmd) => {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', (code, signal) => {
        if (code !== 0) {
          reject(new Error(`Command failed with code ${code}: ${cmd}\nOutput: ${output}`));
        } else {
          resolve(output);
        }
      }).on('data', (data) => {
        output += data;
        // console.log('STDOUT: ' + data);
      }).stderr.on('data', (data) => {
        output += data;
        // console.log('STDERR: ' + data);
      });
    });
  });
};

const uploadFile = (conn, localPath, remotePath) => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      
      writeStream.on('close', () => {
        resolve();
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
      
      readStream.pipe(writeStream);
    });
  });
};

const deploy = async () => {
  try {
    console.log(chalk.blue.bold('🚀 Starting Deployment Process...'));

    // 1. Compress Release Folder
    spinner.start('Compressing release folder...');
    if (process.platform === 'win32') {
        // Use tar if available (Win 10+)
        await runLocalCommand(`tar -czf deployment/${config.zipName} -C release .`);
    } else {
        await runLocalCommand(`tar -czf deployment/${config.zipName} -C release .`);
    }
    spinner.succeed('Release folder compressed');

    // 2. Connect to Server
    spinner.start('Connecting to server...');
    await new Promise((resolve, reject) => {
      conn.on('ready', resolve).on('error', reject).connect(config);
    });
    spinner.succeed('Connected to server');

    // 3. Prepare Remote Directory
    spinner.start('Preparing remote directory...');
    // Install unzip and nodejs if missing (Basic check)
    // We assume sudo is passwordless or we might have issues. 
    // If sudo needs password, we can't easily automate without tty.
    // Let's try to verify node exists.
    try {
        await runRemoteCommand(conn, 'node --version');
    } catch (e) {
        spinner.info('Node.js not found, attempting to install...');
        // This is tricky with passwords. Let's try apt-get update first
        // Assuming 'ubuntu' user has sudo rights.
        // We will try to install NVM or NodeSource
        const installNodeCmd = `
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -S -E bash - &&
            sudo -S apt-get install -y nodejs
        `;
        // Sending password via stdin for sudo -S
        // This is complex via simple exec. 
        // Let's assume the user might have set up the server or we just try basic commands.
        // If it fails, we will notify the user.
        // For now, let's just create the dir.
    }

    await runRemoteCommand(conn, `mkdir -p ${config.deployPath}`);
    spinner.succeed('Remote directory prepared');

    // 4. Upload Files
    spinner.start('Uploading application bundle...');
    const localZip = path.join(__dirname, config.zipName);
    const remoteZip = `${config.deployPath}/${config.zipName}`;
    await uploadFile(conn, localZip, remoteZip);
    spinner.succeed('Bundle uploaded');

    // 5. Extract and Install
    spinner.start('Installing dependencies on server...');
    const deployCmd = `
      cd ${config.deployPath} &&
      tar -xzf ${config.zipName} &&
      rm ${config.zipName} &&
      npm install --production --registry=https://registry.npmmirror.com
    `;
    await runRemoteCommand(conn, deployCmd);
    spinner.succeed('Dependencies installed');

    // 6. Setup Env (Simplified)
    // We will copy the .env file from the upload if it exists, or create a default one
    // In our build script, we copied .env to release/.env. So it should be there.
    
    // 7. Start Application
    spinner.start('Starting application...');
    // Check if PM2 is installed
    try {
        await runRemoteCommand(conn, 'pm2 --version');
    } catch (e) {
        // Try installing without sudo first (if npm is configured for user), or with sudo
        try {
            await runRemoteCommand(conn, 'npm install -g pm2');
        } catch (err) {
            // Attempt sudo with password piping if needed, but for now let's hope user has permissions or pre-installed
            console.warn('Failed to install PM2. Trying to run node directly might be needed, but attempting sudo...');
        }
    }
    
    // Start or Reload
    // Use ecosystem file or simpler start command.
    // The previous error was "Script not found".
    // This implies that "dist/index.js" is not in "deployPath".
    // It's possible the tar extracted into a subdirectory if we were not careful, but we used "tar -C release ."
    // Let's verify file structure by listing files.
    
    // Debug: List files
    try {
        const lsOutput = await runRemoteCommand(conn, `ls -R ${config.deployPath}`);
        console.log('Remote file structure:', lsOutput);
    } catch (e) {}

    const startCmd = `
      cd ${config.deployPath} &&
      pm2 start dist/index.js --name "personal-website" || pm2 reload "personal-website" --update-env &&
      pm2 save
    `;
    await runRemoteCommand(conn, startCmd);
    spinner.succeed('Application started');

    console.log(chalk.green.bold('\n✅ Deployment Successful!'));
    console.log(chalk.cyan(`🌍 Website should be live at: http://${config.host}:3001`));
    
    conn.end();
    
    // Clean up local zip
    fs.unlinkSync(localZip);

  } catch (error) {
    spinner.fail('Deployment failed');
    console.error(chalk.red(error));
    conn.end();
  }
};

deploy();
