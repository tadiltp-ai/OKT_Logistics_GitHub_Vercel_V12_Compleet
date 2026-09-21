@echo off
cd /d "%~dp0"
set "OKT_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%OKT_NODE%" set "OKT_NODE=node"
echo Open http://127.0.0.1:8931 in uw browser. Laat dit venster open.
"%OKT_NODE%" --env-file-if-exists=.env server.mjs
pause
