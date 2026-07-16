const { spawn } = require("child_process");
const { join, dirname } = require("path");
const { existsSync } = require("fs");
const { Playlist, PlayableExtractorPlugin, Song, DisTubeError } = require("distube");
const ytdlCore = require("@distube/ytdl-core");
const { download } = require("@distube/yt-dlp");

const isPlaylist = (info) => Array.isArray(info?.entries);
const playdl = require("play-dl");

const toYtDlpArgs = (url, flags = {}) => {
  const args = [url];

  for (const [key, value] of Object.entries(flags)) {
    if (value === false || value == null) continue;

    const arg = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;

    if (value === true) {
      args.push(arg);
    } else if (Array.isArray(value)) {
      args.push(arg, ...value.map(String));
    } else {
      args.push(arg, String(value));
    }
  }

  return args;
};

const getYtDlpPath = () => {
  const modulePath = require.resolve("@distube/yt-dlp");
  const moduleDir = dirname(modulePath);
  return join(moduleDir, "..", "bin", `yt-dlp${process.platform === "win32" ? ".exe" : ""}`);
};

const { spawnSync } = require("child_process");
const https = require("https");
const { promises: fsPromises } = require("fs");

const ensureYtDlpBinary = async () => {
  const filePath = getYtDlpPath();
  const projBin = join(process.cwd(), "bin", `yt-dlp${process.platform === "win32" ? ".exe" : ""}`);

  // If local project binary exists (./bin/yt-dlp or ./bin/yt-dlp.exe), prefer it
  if (existsSync(projBin)) return projBin;

  // If bundled binary exists, use it
  if (existsSync(filePath)) return filePath;

  // Try to find yt-dlp in PATH (yt-dlp or yt-dlp.exe on Windows)
  try {
    const checkCmd = process.platform === "win32" ? "where" : "which";
    const proc = spawnSync(checkCmd, [process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"]);
    if (proc.status === 0 && proc.stdout) {
      const found = proc.stdout.toString().split(/\r?\n/)[0].trim();
      if (found) return found;
    }
  } catch (e) {
    // ignore
  }

  // Try generic command name (in case the shell resolves it)
  try {
    const proc2 = spawnSync(process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp", ["--version"], { stdio: "ignore" });
    if (proc2.status === 0) return process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  } catch (e) {
    // ignore
  }

  // Attempt to download bundled binary
  await download().catch(() => void 0);

  if (existsSync(filePath)) return filePath;

  throw new Error(
    "No se encontró el ejecutable de yt-dlp. Instala Python y yt-dlp, o coloca un ejecutable de yt-dlp en PATH. Alternativamente, reinstala @distube/yt-dlp."
  );
};

const downloadOfficialYtDlp = async (dest) => {
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp${process.platform === "win32" ? ".exe" : ""}`;
  const tmp = `${dest}.tmp`;

  await fsPromises.mkdir(require("path").dirname(dest), { recursive: true });

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        https.get(res.headers.location, (r2) => {
          const file = require("fs").createWriteStream(tmp);
          r2.pipe(file);
          file.on("finish", async () => {
            file.close();
            try {
              await fsPromises.rename(tmp, dest);
              await fsPromises.chmod(dest, 0o755);
              resolve(dest);
            } catch (e) {
              reject(e);
            }
          });
        }).on("error", reject);
        return;
      }

      if (res.statusCode !== 200) return reject(new Error(`Download failed: ${res.statusCode}`));
      const file = require("fs").createWriteStream(tmp);
      res.pipe(file);
      file.on("finish", async () => {
        file.close();
        try {
          await fsPromises.rename(tmp, dest);
          await fsPromises.chmod(dest, 0o755);
          resolve(dest);
        } catch (e) {
          reject(e);
        }
      });
      file.on("error", reject);
    });
    req.on("error", reject);
  });
};

const spawnJson = async (url, flags = {}) => {
  const filePath = await ensureYtDlpBinary();
  const projBin = join(process.cwd(), "bin", `yt-dlp${process.platform === "win32" ? ".exe" : ""}`);
  const args = toYtDlpArgs(url, flags);
  // If there's a cookies file at project root or specified via env, prefer it to avoid captchas
  try {
    const envCookies = process.env.YTDLP_COOKIES;
    const envCookiesContent = process.env.YTDLP_COOKIES_CONTENT;
    const defaultCookies = join(process.cwd(), "cookies.txt");

    // If YTDLP_COOKIES_CONTENT is set (Railway env), write it to cookies.txt
    if (envCookiesContent && !existsSync(defaultCookies)) {
      try {
        await fsPromises.writeFile(defaultCookies, envCookiesContent, { encoding: 'utf8', mode: 0o600 });
        console.log('[YtDlpPlugin] Wrote cookies.txt from YTDLP_COOKIES_CONTENT env var');
      } catch (e) {
        console.error('[YtDlpPlugin] Failed to write cookies.txt from env content', e);
      }
    }

    const cookiesPath = envCookies || (existsSync(defaultCookies) ? defaultCookies : null);
    if (cookiesPath) {
      // only add if not already provided
      if (!flags.cookies) {
        args.push("--cookies", cookiesPath);
      }
      console.log(`[YtDlpPlugin] Using cookies file: ${cookiesPath}`);
    }
  } catch (e) {
    // ignore
  }

  // Log which executable and args we're using to help debug environments
  try {
    console.log(`[YtDlpPlugin] spawnJson will run: ${filePath} ${args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}`);
  } catch (e) {
    // ignore logging errors
  }

  return new Promise((resolve, reject) => {
    let output = "";
    let errorOutput = "";

    const process2 = spawn(filePath, args, { stdio: ["ignore", "pipe", "pipe"] });

    process2.stdout?.on("data", (chunk) => {
      output += chunk.toString();
    });

    process2.stderr?.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });

    process2.on("close", (code) => {
      if (code !== 0) {
        // If it failed because python3 is missing, try downloading official static binary into ./bin and retry once
        const stderrLower = (errorOutput || "").toLowerCase();
        if (!flags.__ytl_retried && /python3/.test(stderrLower)) {
          console.warn("[YtDlpPlugin] yt-dlp appears to require python3. Attempting to download official yt-dlp binary to ./bin and retry...");
          return downloadOfficialYtDlp(projBin)
            .then(() => {
              flags.__ytl_retried = true;
              // retry using the new projBin
              return spawnJson(url, flags).then(resolve).catch(reject);
            })
            .catch((dlErr) => {
              const err = new Error(`yt-dlp failed and automatic binary download failed: ${dlErr.message}. stderr: ${errorOutput.trim()}`);
              err.debug = { code, stdout: output.trim(), stderr: errorOutput.trim(), cmd: `${filePath} ${args.join(' ')}` };
              console.error('[YtDlpPlugin] download failed', dlErr);
              return reject(err);
            });
        }

        const err = new Error(errorOutput || output || `yt-dlp exited with code ${code}`);
        // attach debug info
        err.debug = { code, stdout: output.trim(), stderr: errorOutput.trim(), cmd: `${filePath} ${args.join(' ')}` };
        console.error('[YtDlpPlugin] yt-dlp failed', err.debug);
        return reject(err);
      }

      try {
        const onlyJson = output.trim();
        const start = onlyJson.indexOf("{");
        const end = onlyJson.lastIndexOf("}");
        const jsonText = start >= 0 && end > start ? onlyJson.slice(start, end + 1) : onlyJson;
        if (!jsonText) throw new Error("empty-output");
        resolve(JSON.parse(jsonText));
      } catch (parseError) {
        console.error('[YtDlpPlugin] Failed to parse JSON from yt-dlp', { stdout: output.trim(), stderr: errorOutput.trim() });
        // Fallback: if URL is YouTube, try using @distube/ytdl-core to get info
        try {
          const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
          if (isYoutube) {
            console.log('[YtDlpPlugin] Falling back to @distube/ytdl-core for YouTube URL');
            (async () => {
              try {
                const info = await ytdlCore.getInfo(url);
                const vd = info.videoDetails || {};
                const built = {
                  extractor: 'youtube',
                  id: vd.videoId || vd.video_url || vd.id,
                  title: vd.title || vd.fulltitle,
                  fulltitle: vd.title || vd.fulltitle,
                  webpage_url: `https://www.youtube.com/watch?v=${vd.videoId || vd.video_url || vd.id}`,
                  original_url: url,
                  is_live: vd.isLive || false,
                  thumbnail: vd.thumbnails?.[vd.thumbnails.length - 1]?.url,
                  thumbnails: vd.thumbnails,
                  duration: Number(vd.lengthSeconds) || 0,
                  uploader: vd.author?.name,
                  uploader_url: vd.author?.channel_url,
                  view_count: Number(vd.viewCount) || 0
                };
                resolve(built);
                return;
              } catch (e) {
                console.error('[YtDlpPlugin] ytdl-core fallback failed', e);
                // fall through to return original error
              }
            })();
            return;
          }
        } catch (fbErr) {
          console.error('[YtDlpPlugin] Fallback check failed', fbErr);
        }

        const e = new Error(`Failed to parse yt-dlp JSON output. stderr: ${errorOutput.trim()} stdout: ${output.trim()}`);
        e.debug = { stdout: output.trim(), stderr: errorOutput.trim() };
        reject(e);
      }
    });

    process2.on("error", reject);
  });
};

class YtDlpSong extends Song {
  constructor(plugin, info, options = {}) {
    super(
      {
        plugin,
        source: info.extractor,
        playFromSource: true,
        id: info.id?.toString(),
        name: info.title || info.fulltitle,
        url: info.webpage_url || info.original_url,
        isLive: info.is_live,
        thumbnail: info.thumbnail || info.thumbnails?.[0]?.url,
        duration: info.is_live ? 0 : info.duration,
        uploader: {
          name: info.uploader,
          url: info.uploader_url
        },
        views: info.view_count,
        likes: info.like_count,
        dislikes: info.dislike_count,
        reposts: info.repost_count,
        ageRestricted: Boolean(info.age_limit) && info.age_limit >= 18
      },
      options
    );
  }
}

class YtDlpPlugin extends PlayableExtractorPlugin {
  constructor({ update } = {}) {
    super();
    if (update ?? true) {
      download().catch(() => void 0);
    }
  }

  init(distube) {
    super.init(distube);
    if (this.distube.plugins[this.distube.plugins.length - 1] !== this) {
      console.warn(`[${this.constructor.name}] Este plugin no está al final de la lista de plugins de DisTube. Esto no es recomendado.`);
    }
  }

  validate() {
    return true;
  }

  async resolve(url, options) {
    const info = await spawnJson(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true
    }).catch((error) => {
      throw new DisTubeError("YTDLP_ERROR", `${error.message}`);
    });

    if (isPlaylist(info)) {
      if (info.entries.length === 0) {
        throw new DisTubeError("YTDLP_ERROR", "La playlist está vacía.");
      }

      return new Playlist(
        {
          source: info.extractor,
          songs: info.entries.map((entry) => new YtDlpSong(this, entry, options)),
          id: info.id?.toString(),
          name: info.title,
          url: info.webpage_url,
          thumbnail: info.thumbnails?.[0]?.url
        },
        options
      );
    }

    return new YtDlpSong(this, info, options);
  }

  async getStreamURL(song) {
    if (!song.url) {
      throw new DisTubeError("YTDLP_PLUGIN_INVALID_SONG", "No se puede obtener la URL de reproducción de la canción.");
    }

    const info = await spawnJson(song.url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      format: "ba/ba*"
    }).catch((error) => {
      throw new DisTubeError("YTDLP_ERROR", `${error.message}`);
    });

    if (isPlaylist(info)) {
      throw new DisTubeError("YTDLP_ERROR", "No se puede obtener la URL de reproducción de una playlist.");
    }

    if (info.url) return info.url;

    // Fallback: try using play-dl to get a readable stream for YouTube URLs
    try {
      if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(song.url)) {
        console.log('[YtDlpPlugin] Falling back to play-dl stream for', song.url);
        const r = await playdl.stream(song.url);
        // r.stream is a readable stream which DisTube/FFmpeg can accept
        return r.stream;
      }
    } catch (e) {
      console.error('[YtDlpPlugin] play-dl fallback failed', e);
    }

    return info.url;
  }

  getRelatedSongs() {
    return [];
  }
}

module.exports = {
  YtDlpPlugin
};
