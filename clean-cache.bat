@echo off
echo ========================================
echo   Nettoyage Cache Angular
echo ========================================
echo.

echo [1/3] Suppression du cache node_modules...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Cache node_modules supprime
) else (
    echo ℹ Cache node_modules inexistant
)

echo.
echo [2/3] Suppression du cache .angular...
if exist ".angular" (
    rmdir /s /q ".angular"
    echo ✓ Cache .angular supprime
) else (
    echo ℹ Cache .angular inexistant
)

echo.
echo [3/3] Suppression du dossier dist...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Dossier dist supprime
) else (
    echo ℹ Dossier dist inexistant
)

echo.
echo ========================================
echo   ✓ Nettoyage termine !
echo ========================================
echo.
echo Vous pouvez maintenant executer: ng serve
echo.
pause
