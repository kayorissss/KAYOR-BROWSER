; KAYOR Browser — auto-close before install/uninstall
; Фикс ошибки "Не удалось закрыть KAYOR Browser" — сам закрывает процесс

!macro preInit
  ; попытка мягко закрыть, затем жёстко
  nsExec::Exec 'taskkill /f /im "KAYOR Browser.exe" /t'
  Sleep 800
  nsExec::Exec 'taskkill /f /im "KAYOR.exe" /t'
  Sleep 800
!macroend

!macro customInit
  nsExec::Exec 'taskkill /f /im "KAYOR Browser.exe" /t'
  Sleep 800
  nsExec::Exec 'taskkill /f /im "KAYOR.exe" /t'
  Sleep 800
!macroend

!macro customUnInit
  nsExec::Exec 'taskkill /f /im "KAYOR Browser.exe" /t'
  Sleep 800
  nsExec::Exec 'taskkill /f /im "KAYOR.exe" /t'
  Sleep 800
!macroend
