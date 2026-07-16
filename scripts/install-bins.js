const https = require('https');
const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const execP = promisify(exec);

const ROOT = join(__dirname, '..');
const BIN = join(ROOT, 'bin');

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        https.get(res.headers.location, (r2) => {
          r2.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) return reject(new Error('Download failed: ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  try {
    if (!fs.existsSync(BIN)) fs.mkdirSync(BIN);

    console.log('[install-bins] Downloading yt-dlp...');
    const ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
    const ytdlpPath = join(BIN, 'yt-dlp');
    await download(ytdlpUrl, ytdlpPath);
    fs.chmodSync(ytdlpPath, 0o755);

    console.log('[install-bins] Downloading ffmpeg (static)...');
    const ffUrl = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';
    const tmp = join(BIN, 'ffmpeg.tar.xz');
    await download(ffUrl, tmp);

    console.log('[install-bins] Extracting ffmpeg...');
    // extract in bin; requires tar available in build image
    await execP(`tar -xJf ${tmp} -C ${BIN}`);
    // find ffmpeg binary
    const files = fs.readdirSync(BIN);
    const dir = files.find(f => f.startsWith('ffmpeg-') && fs.statSync(join(BIN, f)).isDirectory());
    if (dir) {
      const ffPath = join(BIN, dir, 'ffmpeg');
      if (fs.existsSync(ffPath)) {
        fs.copyFileSync(ffPath, join(BIN, 'ffmpeg'));
        fs.chmodSync(join(BIN, 'ffmpeg'), 0o755);
      }
    }
    // cleanup
    try { fs.unlinkSync(tmp); } catch (e) {}

    console.log('[install-bins] Done. Binaries placed in ./bin');
  } catch (e) {
    console.error('[install-bins] Failed to fetch or extract binaries:', e);
    process.exit(0); // don't fail build — allow manual fixes
  }
}

main();
