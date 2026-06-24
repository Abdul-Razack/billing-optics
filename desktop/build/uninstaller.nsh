!macro customUnInstall
  MessageBox MB_YESNO "Do you want to completely remove all application data and settings? (Recommended if you are experiencing issues reinstalling)" IDYES remove_data IDNO skip_data
  remove_data:
    RMDir /r "$APPDATA\Billing Optics ERP"
  skip_data:
!macroend
