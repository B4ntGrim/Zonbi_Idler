# Zed Idler local test server (Oct 12). Serves E:\Zed_Idler at http://127.0.0.1:8080/ with no caching.
# Run:  powershell -ExecutionPolicy Bypass -File "E:\Zed_Idler\server\serve-local.ps1"     Stop: Ctrl+C
$root  = 'E:\Zed_Idler'
$rootFull = [IO.Path]::GetFullPath($root).TrimEnd('\') + '\'
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='application/javascript'; '.jsx'='text/babel'; '.css'='text/css'; '.png'='image/png'; '.json'='application/json'; '.svg'='image/svg+xml' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add('http://127.0.0.1:8080/')   # loopback only: other machines on the network cannot reach it
$l.Start()
Write-Host 'Serving http://127.0.0.1:8080/  (Ctrl+C to stop)'
try {
  while ($l.IsListening) {
    $c = $l.GetContext(); $r = $c.Response
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
    if ($p -eq '') { $p = 'Zombie Idler v2 - TEST SAVE.html' }
    $full = [IO.Path]::GetFullPath((Join-Path $root $p))
    $r.Headers.Add('Cache-Control', 'no-store')
    # Path-traversal guard: refuse anything that resolves outside the game folder (e.g. /../../Windows/win.ini)
    if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) { $r.StatusCode = 403 }
    elseif (Test-Path $full -PathType Leaf) {
      $b = [IO.File]::ReadAllBytes($full); $e = [IO.Path]::GetExtension($full).ToLower()
      $r.ContentType = $(if ($types[$e]) { $types[$e] } else { 'application/octet-stream' })
      $r.OutputStream.Write($b, 0, $b.Length)
    } else { $r.StatusCode = 404 }
    $r.Close()
  }
} finally { $l.Stop() }
