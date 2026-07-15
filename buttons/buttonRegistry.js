const backHome = require("./handlers/back_home");
const music = require("./handlers/music");
const mp3 = require("./handlers/mp3");
const partido = require("./handlers/partido");
const settings = require("./handlers/settings");
const search = require("./handlers/search");
const youtube = require("./handlers/youtube");
const mp3Panel = require("./handlers/mp3_panel");
const play = require("./handlers/play");
const pause = require("./handlers/pause");
const stop = require("./handlers/stop");
const skip = require("./handlers/skip");
const queue = require("./handlers/queue");
const volume = require("./handlers/volume");
const himno = require("./handlers/himno");
const himnoEntero = require("./handlers/himno_entero");
const lavida = require("./handlers/lavida");
const gol = require("./handlers/gol");
const celebracion = require("./handlers/celebracion");

module.exports = {
  music,
  mp3,
  partido,
  settings,
  back_home: backHome,
  search,
  youtube,
  mp3_panel: mp3Panel,
  play,
  pause,
  stop,
  skip,
  queue,
  volume,
  volume_down: volume,
  himno,
  himno_entero: himnoEntero,
  lavida,
  gol,
  celebracion
};
