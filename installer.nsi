; KAYOR Browser — NSIS 3 (Windows)
; Установи NSIS с https://nsis.sourceforge.io
; Затем: makensis installer.nsi -> kayor-installer-1.0.0.exe
!include "MUI2.nsh"
Name "KAYOR Browser"
OutFile "build\kayor-installer-1.0.0.exe"
InstallDir "$PROGRAMFILES\KAYOR"
InstallDirRegKey HKLM "Software\KAYOR" "InstallDir"
RequestExecutionLevel admin
Icon "public\favicon.ico"
UninstallIcon "public\favicon.ico"

!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "README.md"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Russian"
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "dist\*.*"
  File "public\kayorbrowse.png"
  File "public\favicon.ico"
  WriteRegStr HKLM "Software\KAYOR" "InstallDir" "$INSTDIR"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateDirectory "$SMPROGRAMS\KAYOR"
  CreateShortCut "$SMPROGRAMS\KAYOR\KAYOR Browser.lnk" "$INSTDIR\KAYOR.exe" "" "$INSTDIR\favicon.ico"
  CreateShortCut "$DESKTOP\KAYOR Browser.lnk" "$INSTDIR\KAYOR.exe" "" "$INSTDIR\favicon.ico"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\KAYOR" "DisplayName" "KAYOR Browser"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\KAYOR" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\KAYOR" "DisplayIcon" "$INSTDIR\favicon.ico"
SectionEnd

Section "Uninstall"
  MessageBox MB_YESNO "Удалить все данные KAYOR (закладки, история, пароли)?" IDYES yes IDNO no
  yes:
    RMDir /r "$LOCALAPPDATA\KAYOR"
    RMDir /r "$APPDATA\KAYOR"
  no:
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\KAYOR"
  DeleteRegKey HKLM "Software\KAYOR"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\KAYOR Browser.lnk"
  RMDir /r "$SMPROGRAMS\KAYOR"
SectionEnd
