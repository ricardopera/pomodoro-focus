Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Path to the Pomodoro Focus.exe
exePath = scriptDir & "\Pomodoro Focus.exe"

' Run the executable hidden (0 = hidden window)
WshShell.Run Chr(34) & exePath & Chr(34), 0, False

Set WshShell = Nothing
Set fso = Nothing
