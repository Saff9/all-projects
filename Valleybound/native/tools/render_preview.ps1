param(
    [string]$OutputPath = "artifacts\valleybound_native_preview.png"
)

Add-Type -AssemblyName System.Drawing

$width = 1280
$height = 800
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

function Brush($r, $gValue, $b) {
    return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($r, $gValue, $b))
}

function PenC($r, $gValue, $b, $w) {
    return New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($r, $gValue, $b), $w)
}

function Fill-Ellipse($x, $y, $rx, $ry, $brush) {
    $g.FillEllipse($brush, $x - $rx, $y - $ry, $rx * 2, $ry * 2)
}

function Fill-Rect($x, $y, $w, $h, $brush) {
    $g.FillRectangle($brush, $x, $y, $w, $h)
}

function Draw-Label($text, $x, $y, $size = 13, $color = [System.Drawing.Color]::FromArgb(245,239,218)) {
    $font = New-Object System.Drawing.Font("Segoe UI", $size, [System.Drawing.FontStyle]::Regular)
    $brush = New-Object System.Drawing.SolidBrush($color)
    $g.DrawString($text, $font, $brush, $x, $y)
    $font.Dispose()
    $brush.Dispose()
}

$sky = Brush 201 185 141
$grass = Brush 116 111 63
$mountain = Brush 141 134 121
$snow = Brush 236 232 223
$riverBrush = Brush 71 127 150
$hud = Brush 20 24 22

Fill-Rect 0 0 $width $height $sky

for ($i = 0; $i -lt 7; $i++) {
    $x = 50 + $i * 170
    $peak = 45 + ($i % 2) * 20
    $poly = @(
        [System.Drawing.Point]::new($x, 160),
        [System.Drawing.Point]::new($x + 90, $peak),
        [System.Drawing.Point]::new($x + 190, 165)
    )
    $g.FillPolygon($mountain, $poly)
    $snowPoly = @(
        [System.Drawing.Point]::new($x + 68, $peak + 36),
        [System.Drawing.Point]::new($x + 90, $peak),
        [System.Drawing.Point]::new($x + 118, $peak + 38)
    )
    $g.FillPolygon($snow, $snowPoly)
}

Fill-Rect 0 155 $width ($height - 155) $grass

$regions = @(
    @{n="Srinagar Lake District";x=210;y=455;w=250;h=155;c=(Brush 74 111 115)},
    @{n="Budgam Orchard Plain";x=430;y=420;w=205;h=135;c=(Brush 104 121 63)},
    @{n="Pahalgam Shepherd River";x=690;y=360;w=230;h=150;c=(Brush 82 109 69)},
    @{n="Gulmarg Flower Meadow";x=405;y=155;w=260;h=170;c=(Brush 96 124 84)},
    @{n="Baramulla Trade Road";x=755;y=175;w=210;h=115;c=(Brush 107 101 74)},
    @{n="Jammu Warm Foothills";x=865;y=520;w=230;h=120;c=(Brush 140 112 67)}
)

foreach ($r in $regions) {
    Fill-Rect $r.x $r.y $r.w $r.h $r.c
    Draw-Label $r.n ($r.x + 12) ($r.y + 10)
}

$riverPen = PenC 71 127 150 30
$riverHi = PenC 210 232 236 3
$g.DrawLine($riverPen, 40, 575, 565, 385)
$g.DrawLine($riverPen, 565, 385, 1160, 315)
$g.DrawLine($riverHi, 40, 575, 565, 385)
$g.DrawLine($riverHi, 565, 385, 1160, 315)

Fill-Rect 523 376 84 18 (Brush 79 61 46)

for ($i = 0; $i -lt 34; $i++) {
    $x = 80 + (($i * 89) % 1030)
    $y = 210 + (($i * 53) % 390)
    Fill-Rect ($x - 4) ($y + 12) 8 24 (Brush 75 53 39)
    if (($i % 3) -eq 0) {
        Fill-Ellipse $x $y 21 21 (Brush 180 87 43)
    } else {
        Fill-Ellipse $x $y 16 16 (Brush 38 61 52)
    }
}

$houses = @(
    @{x=175;y=500;old=$true}, @{x=235;y=520;old=$false}, @{x=318;y=350;old=$true},
    @{x=492;y=470;old=$true}, @{x=548;y=505;old=$false}, @{x=850;y=220;old=$false},
    @{x=920;y=560;old=$false}
)

foreach ($h in $houses) {
    Fill-Rect ($h.x - 22) ($h.y - 14) 44 32 $(if ($h.old) { Brush 139 98 67 } else { Brush 184 180 167 })
    $roof = @(
        [System.Drawing.Point]::new($h.x - 28, $h.y - 14),
        [System.Drawing.Point]::new($h.x, $h.y - 40),
        [System.Drawing.Point]::new($h.x + 28, $h.y - 14)
    )
    $g.FillPolygon($(if ($h.old) { Brush 90 50 39 } else { Brush 91 96 92 }), $roof)
}

$resources = @(
    @{x=455;y=485;n="Wood";c=(Brush 134 90 52)}, @{x=430;y=510;n="Wood";c=(Brush 134 90 52)},
    @{x=610;y=360;n="Stone";c=(Brush 135 132 122)}, @{x=705;y=455;n="Herbs";c=(Brush 87 151 76)},
    @{x=735;y=470;n="Herbs";c=(Brush 87 151 76)}
)

foreach ($res in $resources) {
    Fill-Ellipse $res.x $res.y 10 10 $res.c
    Draw-Label $res.n ($res.x + 13) ($res.y - 13) 12
}

$npcs = @(
    @{x=525;y=455;n="Ghulam Nabi"}, @{x=345;y=330;n="Zooni"},
    @{x=780;y=455;n="Rafiq"}, @{x=895;y=250;n="Nargis"}
)

foreach ($npc in $npcs) {
    Fill-Ellipse $npc.x $npc.y 10 10 (Brush 62 76 118)
    Fill-Ellipse $npc.x ($npc.y - 12) 6 6 (Brush 229 191 151)
    Draw-Label $npc.n ($npc.x + 13) ($npc.y - 20) 12
}

$animals = @(
    @{x=760;y=420;k="sheep"}, @{x=805;y=438;k="sheep"}, @{x=825;y=395;k="sheep"},
    @{x=515;y=520;k="cow"}, @{x=555;y=492;k="cow"}
)

foreach ($a in $animals) {
    if ($a.k -eq "sheep") {
        Fill-Ellipse $a.x $a.y 15 10 (Brush 238 231 217)
        Fill-Ellipse ($a.x + 14) ($a.y - 2) 7 7 (Brush 216 205 187)
    } else {
        Fill-Ellipse $a.x $a.y 20 13 (Brush 138 106 74)
        Fill-Ellipse ($a.x + 18) ($a.y - 2) 9 9 (Brush 91 63 47)
    }
}

$debris = @(
    @{x=548;y=385;r=15;k="branch"}, @{x=583;y=398;r=18;k="log"}, @{x=573;y=365;r=13;k="stone"}
)

foreach ($d in $debris) {
    if ($d.k -eq "stone") {
        Fill-Ellipse $d.x $d.y $d.r $d.r (Brush 104 103 95)
    } else {
        Fill-Rect ($d.x - $d.r - 12) ($d.y - 5) ($d.r * 2 + 24) 10 $(if ($d.k -eq "log") { Brush 109 67 40 } else { Brush 130 81 47 })
    }
}

$markers = @(
    @{x=565;y=385;n="Broken crossing";dx=16;dy=-12}, @{x=455;y=485;n="Wood pile";dx=16;dy=-6},
    @{x=330;y=342;n="Family house";dx=18;dy=-22}, @{x=318;y=350;n="Roof repair";dx=18;dy=8},
    @{x=795;y=410;n="Stray sheep";dx=18;dy=-4}
)
foreach ($m in $markers) {
    Fill-Ellipse $m.x $m.y 9 9 (Brush 232 195 90)
    Draw-Label $m.n ($m.x + $m.dx) ($m.y + $m.dy) 12 ([System.Drawing.Color]::FromArgb(255,247,214))
}

Fill-Ellipse 260 400 17 17 (Brush 34 39 37)
Fill-Ellipse 260 400 13 13 (Brush 40 93 114)
Fill-Ellipse 260 385 8 8 (Brush 243 211 174)

Fill-Rect 0 0 $width 72 $hud
Draw-Label "Valleybound C++ Native Prototype | Season: Autumn | Weather: Clear | Fixed 60 Hz Simulation | F5 Save / F9 Load" 16 10 14
Draw-Label "Task Flow: crossing -> resources -> bridge -> family house -> sheep -> roof repair -> home base" 16 38 13 ([System.Drawing.Color]::FromArgb(214,198,140))
Draw-Label "Preview render generated from the current prototype layout. The executable still needs MSVC/CMake installed to run." 16 746 12 ([System.Drawing.Color]::FromArgb(238,231,204))

$outFull = [System.IO.Path]::GetFullPath($OutputPath)
$outDir = [System.IO.Path]::GetDirectoryName($outFull)
if (-not [System.IO.Directory]::Exists($outDir)) {
    [System.IO.Directory]::CreateDirectory($outDir) | Out-Null
}

$bitmap.Save($outFull, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bitmap.Dispose()

Write-Output $outFull
