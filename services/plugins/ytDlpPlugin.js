const { spawn } = require("child_process");
const { join, dirname } = require("path");
const { existsSync } = require("fs");
const { Playlist, PlayableExtractorPlugin, Song, DisTubeError } = require("distube");
const { download } = require("@distube/yt-dlp");

const isPlaylist = (info) => Array.isArray(info?.entries);

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

const spawnJson = async (url, flags = {}) => {
  const filePath = await ensureYtDlpBinary();
  const args = toYtDlpArgs(url, flags);

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
        resolve(JSON.parse(jsonText));
      } catch (parseError) {
        const e = new Error(`Failed to parse yt-dlp JSON output. stderr: ${errorOutput.trim()} stdout: ${output.trim()}`);
        e.debug = { stdout: output.trim(), stderr: errorOutput.trim() };
        console.error('[YtDlpPlugin] Failed to parse JSON from yt-dlp', e.debug);
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

    return info.url;
  }

  getRelatedSongs() {
    return [];
  }
}

module.exports = {
  YtDlpPlugin
};
