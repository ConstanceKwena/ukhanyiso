param([string]$Base = "http://localhost:8080")

if (-not $env:DEMO_EMAIL -or -not $env:DEMO_PASSWORD) {
    Write-Host "Set DEMO_EMAIL and DEMO_PASSWORD first." -ForegroundColor Red
    exit 1
}

$failed = $false

function Check($name, $expected, $actual) {
    if ($expected -eq $actual) { Write-Host "PASS  $name" -ForegroundColor Green }
    else { Write-Host "FAIL  $name (expected $expected, got $actual)" -ForegroundColor Red; $script:failed = $true }
}

function Get-Status($method, $path, $body, $session) {
    $p = @{ Uri = "$Base$path"; Method = $method; UseBasicParsing = $true }
    if ($body) { $p.Body = $body; $p.ContentType = "application/json" }
    if ($session) { $p.WebSession = $session }
    try { return [int](Invoke-WebRequest @p).StatusCode }
    catch { if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode } else { return 0 } }
}

$good = '{"marks":[{"subject":"English Home Language","mark":72},{"subject":"Mathematics","mark":74},{"subject":"Life Orientation","mark":80}]}'
$bad  = '{"marks":[{"subject":"Mathematics","mark":150}]}'

Check "home page"             200 (Get-Status GET "/index.html")
Check "bursaries"             200 (Get-Status GET "/api/bursaries")
Check "match, good marks"     200 (Get-Status POST "/api/match" $good)
Check "match, bad marks"      400 (Get-Status POST "/api/match" $bad)
Check "checklist, logged out" 401 (Get-Status GET "/api/checklist")

$login = @{ email = $env:DEMO_EMAIL; password = $env:DEMO_PASSWORD } | ConvertTo-Json -Compress
$web = $null
try {
    $r = Invoke-WebRequest -Uri "$Base/api/auth/login" -Method POST -Body $login -ContentType "application/json" -SessionVariable web -UseBasicParsing
    Check "demo login" 200 ([int]$r.StatusCode)
} catch {
    Check "demo login" 200 ([int]$_.Exception.Response.StatusCode)
}
if ($web) { Check "checklist, logged in" 200 (Get-Status GET "/api/checklist" $null $web) }

if ($failed) { exit 1 }