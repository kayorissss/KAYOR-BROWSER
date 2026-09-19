; KAYOR Browser — Inno Setup 6 (Windows)
; Установи Inno Setup 6 с https://jrsoftware.org/isinfo.php
; Затем открой этот файл и нажми Ctrl+F9 — получишь KAYOR-Setup-1.0.0.exe

#define MyAppName "KAYOR Browser"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "KAYOR"
#define MyAppURL "https://kayor.app"

[Setup]
AppId={{KAYOR-BROWSER-2026-09-19}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\KAYOR
DefaultGroupName=KAYOR
AllowNoIcons=yes
LicenseFile=README.md
OutputDir=build
OutputBaseFilename=KAYOR-Setup-1.0.0
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=public\favicon.ico
UninstallDisplayIcon={app}\KAYOR.exe
WizardImageFile=public\kayorbrowse.png
WizardSmallImageFile=public\favicon.ico
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs
Source: "public\kayorbrowse.png"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\favicon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\KAYOR Browser"; Filename: "{app}\KAYOR.exe"; IconFilename: "{app}\favicon.ico"
Name: "{group}\{cm:UninstallProgram,KAYOR Browser}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\KAYOR Browser"; Filename: "{app}\KAYOR.exe"; IconFilename: "{app}\favicon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\KAYOR.exe"; Description: "{cm:LaunchProgram,KAYOR Browser}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{localappdata}\KAYOR"

[Code]
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
    if MsgBox('Удалить все данные KAYOR (закладки, история, пароли)?', mbConfirmation, MB_YESNO) = IDYES then
      DelTree(ExpandConstant('{localappdata}\KAYOR'), True, True, True);
end;
