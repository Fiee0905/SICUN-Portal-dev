Set shell = CreateObject("WScript.Shell")
root = "C:\Users\86199\Documents\New project"

frontend = "cmd.exe /c cd /d """ & root & "\frontend"" && npm.cmd run dev > """ & root & "\logs\frontend.log"" 2> """ & root & "\logs\frontend.err.log"""
backend = "cmd.exe /c cd /d """ & root & "\backend"" && mvn.cmd spring-boot:run > """ & root & "\logs\backend.log"" 2> """ & root & "\logs\backend.err.log"""
mock = "cmd.exe /c cd /d """ & root & "\integration\mock-server"" && npm.cmd start > """ & root & "\logs\mock.log"" 2> """ & root & "\logs\mock.err.log"""

shell.Run frontend, 0, False
shell.Run backend, 0, False
shell.Run mock, 0, False
