; KAYOR Browser — NSIS installer script
!include "MUI2.nsh"
Name "KAYOR Browser"
OutFile "kayor-installer-1.0.0.exe"
InstallDir "$PROGRAMFILES\KAYOR"
RequestExecutionLevel admin
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "Russian"
Section "Install"
  SetOutPath "$INSTDIR"
  File /r "dist\*.*"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortcut "$DESKTOP\KAYOR.lnk" "$INSTDIR\KAYOR.exe"
SectionEnd
Section "Uninstall"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\KAYOR.lnk"
SectionEnd
