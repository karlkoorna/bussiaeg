cd %~dp0
call update.bat
:restart
node app.js %errorlevel%
goto restart
