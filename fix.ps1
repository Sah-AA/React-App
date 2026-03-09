$srcDir = Join-Path $PSScriptRoot "src"
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.jsx", "*.js"
$fixed = 0

foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    $original = $content

    # Step 1: Remove any `import React from "react";` line at any position
    $content = [regex]::Replace($content, '(?m)^import React from [''"]react[''"];\r?\n', '')

    # Step 2: Find "use client" / "use server" directive that is NOT at the very start
    $directivePattern = '(?m)^([''"]use (?:client|server)[''"];?\r?\n)'
    $match = [regex]::Match($content, $directivePattern)
    if ($match.Success -and -not $content.StartsWith($match.Groups[1].Value)) {
        $directive = $match.Groups[1].Value
        $content = [regex]::Replace($content, [regex]::Escape($directive), '')
        $content = $directive + $content
    }

    # Step 3: If file uses React.createElement/React.Fragment but has no React import, add one
    $usesReact = $content -match 'React\.(createElement|Fragment|createContext|createRef|forwardRef|memo|cloneElement)'
    $hasReactImport = $content -match 'import (\* as )?React\b'
    if ($usesReact -and -not $hasReactImport) {
        $dirMatch = [regex]::Match($content, '(?m)^([''"]use (?:client|server)[''"];?\r?\n)')
        if ($dirMatch.Success) {
            $after = $content.Substring($dirMatch.Groups[1].Length)
            $content = $dirMatch.Groups[1].Value + "import React from `"react`";`n" + $after
        } else {
            $content = "import React from `"react`";`n" + $content
        }
    }

    if ($content -ne $original) {
        $newBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        [System.IO.File]::WriteAllBytes($f.FullName, $newBytes)
        $fixed++
        Write-Host "Fixed: $($f.Name)"
    }
}

Write-Host ""
Write-Host "Done. Fixed $fixed files." -ForegroundColor Green
