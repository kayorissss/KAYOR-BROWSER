; KAYOR Browser — Inno Setup (Windows)
#define MyAppName "KAYOR Browser"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "KAYOR"
#define MyAppURL "https://kayor.app"

[Setup]
AppId={{KAYOR-BROWSER-2026}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\KAYOR
DefaultGroupName=KAYOR
AllowNoIcons=yes
LicenseFile=README.md
OutputDir=.
OutputBaseFilename=kayor-setup-1.0.0
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=public\favicon.svg
UninstallDisplayIcon={app}\KAYOR.exe

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs
Source: "public\favicon.svg"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\KAYOR Browser"; Filename: "{app}\KAYOR.exe"
Name: "{group}\{cm:UninstallProgram,KAYOR Browser}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\KAYOR Browser"; Filename: "{app}\KAYOR.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\KAYOR.exe"; Description: "{cm:LaunchProgram,KAYOR Browser}"; Flags: nowait postinstall skipifsilent

[Code]
var
  UninstallDataForm: TSetupForm;
  DeleteDataCheck: TNewCheckBox;
function InitializeUninstall(): Boolean;
begin
  Result := True;
end;
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
    if MsgBox('Удалить все данные KAYOR (закладки, история, пароли)?', mbConfirmation, MB_YESNO) = IDYES then
      DelTree(ExpandConstant('{localappdata}\KAYOR'), True, True, True);
end;

[UninstallDelete]
Type: filesandordirs; Name: "{localappdata}\KAYOR"
