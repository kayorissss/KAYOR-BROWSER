# Скачать KAYOR Browser v1.0.0

Прямые ссылки (если релиз-вложения не грузятся — качай отсюда):

- [KAYOR-Setup-1.0.0.exe](https://raw.githubusercontent.com/kayorissss/KAYOR-BROWSER/arena/01a0ba41-kayor-browser/releases/v1.0.0/KAYOR-Setup-1.0.0.exe) — установщик Windows (валидный PE, MZ)
- [KAYOR-Portable.exe](https://raw.githubusercontent.com/kayorissss/KAYOR-BROWSER/arena/01a0ba41-kayor-browser/releases/v1.0.0/KAYOR-Portable.exe)
- [KAYOR-Browser-Portable-1.0.0.zip](https://raw.githubusercontent.com/kayorissss/KAYOR-BROWSER/arena/01a0ba41-kayor-browser/releases/v1.0.0/KAYOR-Browser-Portable-1.0.0.zip) — портативка (рекомендуется, распакуй и запусти Запустить-KAYOR.bat)
- [KAYOR-Browser-Web.zip](https://raw.githubusercontent.com/kayorissss/KAYOR-BROWSER/arena/01a0ba41-kayor-browser/releases/v1.0.0/KAYOR-Browser-Web.zip)

### .iss и .nsi — это исходники установщика, а не сам установщик
- `installer.iss` + Inno Setup 6 → `KAYOR-Setup-1.0.0.exe`
- `installer.nsi` + NSIS 3 → `kayor-installer-1.0.0.exe`
На Windows открой файл в Inno/NSIS и нажми Compile — получишь полный установщик с выбором папки и деинсталлятором.

