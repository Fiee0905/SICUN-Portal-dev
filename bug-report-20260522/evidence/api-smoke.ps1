$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api/v1'
$results = @{}
foreach ($name in @('portal/home','portal/courses','portal/categories/tree','portal/search-keywords','admin/users')) {
  try {
    $r = Invoke-WebRequest -Uri "$base/$name" -Method GET -UseBasicParsing -TimeoutSec 10
    $results[$name] = @{ status = [int]$r.StatusCode; bodySample = $r.Content.Substring(0, [Math]::Min(200, $r.Content.Length)) }
  } catch {
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    $results[$name] = @{ status = $status; error = $_.Exception.Message }
  }
}
try {
  $login = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body (@{username='admin';password='123456'} | ConvertTo-Json) -TimeoutSec 10
  $results['auth/login admin'] = @{ code = $login.code; keys = @($login.data.PSObject.Properties.Name) }
} catch {
  $results['auth/login admin'] = @{ status = 0; error = $_.Exception.Message }
}
$results | ConvertTo-Json -Depth 5
