**Arreglar reproducción (rápida)**

- Si tu bot corre en Linux/contener, ejecuta (desde la raíz del proyecto):

```
sudo ./scripts/auto-fix-linux.sh
```

- Si tu bot corre en Windows (PowerShell como administrador), ejecuta:

```
.\scripts\fix-windows-all.ps1
```

- Ambos scripts intentan instalar Python3 + ffmpeg (si es posible), descargar `yt-dlp` a `./bin`, y ejecutar `npm install`.

- Si YouTube te pide iniciar sesión (captcha "Sign in to confirm you’re not a bot"), exporta tus cookies con una extensión y guarda el archivo `cookies.txt` en la raíz del proyecto. El plugin usará automáticamente `./cookies.txt`.

Notas importantes:
- No puedo ejecutar estos comandos en tu servidor desde aquí. Los scripts están añadidos al repositorio para que ejecutes un único comando. Si no quieres ejecutar nada, la única alternativa es que el host tenga Python3 y ffmpeg instalados por el proveedor del servicio.
