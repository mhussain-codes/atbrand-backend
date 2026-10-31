Add-Type -AssemblyName System.Drawing
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$url = 'https://atbrand-store-218737.hostingersite.com/wp-content/uploads/2026/09/logo-scaled.jpeg'
$tempFile = [System.IO.Path]::GetTempFileName()
Invoke-WebRequest -Uri $url -OutFile $tempFile

$srcImage = [System.Drawing.Image]::FromFile($tempFile)

function Save-Resized($img, $w, $h, $destPath) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $destPath ($w by $h)"
}

$dirs = @('apps/web/public', 'dist')
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null }
    Save-Resized $srcImage 180 180 "$d/apple-touch-icon.png"
    Save-Resized $srcImage 192 192 "$d/android-chrome-192x192.png"
    Save-Resized $srcImage 512 512 "$d/android-chrome-512x512.png"
    Save-Resized $srcImage 32 32 "$d/favicon-32x32.png"
    Save-Resized $srcImage 16 16 "$d/favicon-16x16.png"
}

$srcImage.Dispose()
Remove-Item $tempFile -Force
Write-Host "Icons generated successfully!"
