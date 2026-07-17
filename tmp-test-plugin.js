const { YtDlpPlugin } = require('./services/plugins/ytDlpPlugin');
(async () => {
  const plugin = new YtDlpPlugin({ update: false });
  const song = await plugin.resolve('https://www.youtube.com/watch?v=tJWWJiVYiUA', {});
  console.log('song keys', Object.keys(song || {}).slice(0, 50));
  console.log('song.url', song?.url);
  console.log('song.name', song?.name);
  console.log('song.stream', song?.stream);
  try {
    const stream = await plugin.getStreamURL(song);
    console.log('stream', typeof stream, stream && String(stream).slice(0, 200));
  } catch (e) {
    console.error('stream error', e);
  }
})();
