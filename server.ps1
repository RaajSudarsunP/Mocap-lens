$port = 8000
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "MocapLens Local Server running at http://127.0.0.1:$port/prototype/index.html"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".task" = "application/octet-stream"
    ".wasm" = "application/wasm"
}

$rootDir = $PSScriptRoot

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 2000
        $buffer = New-Object byte[] 4096
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -gt 0) {
            $reqText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
            $firstLine = $reqText.Split("`r`n")[0]
            $parts = $firstLine.Split(' ')
            if ($parts.Length -ge 2) {
                $rawUrl = $parts[1].Split('?')[0]
                if ($rawUrl -eq "/" -or $rawUrl -eq "") { $rawUrl = "/prototype/index.html" }
                $decodedUrl = [System.Uri]::UnescapeDataString($rawUrl)
                $relPath = $decodedUrl.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
                $fullPath = [System.IO.Path]::Combine($rootDir, $relPath)
                if (Test-Path $fullPath -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
                    $ct = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                    $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
                    $hdr = "HTTP/1.1 200 OK`r`nContent-Type: $ct`r`nContent-Length: $($fileBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $hdrBytes = [System.Text.Encoding]::UTF8.GetBytes($hdr)
                    $stream.Write($hdrBytes, 0, $hdrBytes.Length)
                    $stream.Write($fileBytes, 0, $fileBytes.Length)
                } else {
                    $notFoundMsg = "404 Not Found: $rawUrl"
                    $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($notFoundMsg)
                    $hdr = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($notFoundBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $hdrBytes = [System.Text.Encoding]::UTF8.GetBytes($hdr)
                    $stream.Write($hdrBytes, 0, $hdrBytes.Length)
                    $stream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                }
            }
        }
        $stream.Close()
        $client.Close()
    } catch {
        # continue on transient socket error
    }
}
