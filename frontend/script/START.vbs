' E-Kost Manager - Quick Start Script
' VBScript Version

Option Explicit

Dim choice

Do
    ShowMenu
    choice = InputBox("Masukkan pilihan (1-4):", "E-Kost Manager - Quick Start")
    
    Select Case choice
        Case "1"
            StartStandalone
        Case "2"
            StartDevelopment
        Case "3"
            OpenDocs
        Case "4"
            MsgBox "Terima kasih!", vbInformation, "E-Kost Manager"
            Exit Do
        Case Else
            MsgBox "Pilihan tidak valid!", vbExclamation, "E-Kost Manager"
    End Select
Loop

Sub ShowMenu
    Dim msg
    msg = "========================================" & vbCrLf & _
          "   E-Kost Manager - Quick Start" & vbCrLf & _
          "========================================" & vbCrLf & vbCrLf & _
          "Pilih cara menjalankan aplikasi:" & vbCrLf & vbCrLf & _
          "1. Standalone Mode (Tidak perlu install apapun)" & vbCrLf & _
          "2. Development Mode (Perlu Node.js)" & vbCrLf & _
          "3. Buka Dokumentasi" & vbCrLf & _
          "4. Keluar"
    
    MsgBox msg, vbInformation, "E-Kost Manager - Quick Start"
End Sub

Sub StartStandalone
    On Error Resume Next
    
    Dim shell
    Set shell = CreateObject("WScript.Shell")
    
    shell.Run "standalone.html", 1, False
    
    If Err.Number <> 0 Then
        MsgBox "Gagal membuka browser. Silakan buka file standalone.html manual", vbExclamation, "E-Kost Manager"
    Else
        MsgBox "Aplikasi dibuka di browser!" & vbCrLf & "Jika browser tidak terbuka, buka file standalone.html manual", vbInformation, "E-Kost Manager"
    End If
    
    On Error GoTo 0
End Sub

Sub StartDevelopment
    On Error Resume Next
    
    Dim shell
    Set shell = CreateObject("WScript.Shell")
    
    ' Check if Node.js is installed
    Dim result
    result = shell.Run("node --version", 0, True)
    
    If result <> 0 Then
        MsgBox "Node.js tidak terinstall!" & vbCrLf & "Silakan install Node.js dari https://nodejs.org/" & vbCrLf & "Atau gunakan opsi 1 (Standalone Mode)", vbExclamation, "E-Kost Manager"
        Exit Sub
    End If
    
    MsgBox "Node.js terinstall!" & vbCrLf & "Installing dependencies...", vbInformation, "E-Kost Manager"
    
    ' Install dependencies
    result = shell.Run("npm install", 1, True)
    
    If result <> 0 Then
        MsgBox "Gagal install dependencies!" & vbCrLf & "Silakan gunakan opsi 1 (Standalone Mode)", vbExclamation, "E-Kost Manager"
        Exit Sub
    End If
    
    MsgBox "Dependencies berhasil diinstall!" & vbCrLf & "Starting development server..." & vbCrLf & "Aplikasi akan berjalan di: http://localhost:3000", vbInformation, "E-Kost Manager"
    
    ' Start development server
    shell.Run "npm run dev", 1, False
    
    On Error GoTo 0
End Sub

Sub OpenDocs
    On Error Resume Next
    
    Dim shell
    Set shell = CreateObject("WScript.Shell")
    
    shell.Run "README.md", 1, False
    shell.Run "QUICK_START.md", 1, False
    shell.Run "START_HERE.md", 1, False
    
    If Err.Number <> 0 Then
        MsgBox "Gagal membuka dokumentasi. Silakan buka file manual:" & vbCrLf & "- README.md" & vbCrLf & "- QUICK_START.md" & vbCrLf & "- START_HERE.md", vbExclamation, "E-Kost Manager"
    Else
        MsgBox "Dokumentasi dibuka!", vbInformation, "E-Kost Manager"
    End If
    
    On Error GoTo 0
End Sub