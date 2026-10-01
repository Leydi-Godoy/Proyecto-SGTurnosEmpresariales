[CmdletBinding()]
param(
  [string]$MysqlDumpPath = 'C:\xampp\mysql\bin\mysqldump.exe',
  [string]$Database = 'sgturnos_empresas',
  [string]$HostName = '127.0.0.1',
  [int]$Port = 3306,
  [string]$User = 'root',
  [switch]$PromptForPassword
)

if (-not (Test-Path -LiteralPath $MysqlDumpPath)) {
  throw "No se encontro mysqldump.exe en '$MysqlDumpPath'. Ajusta -MysqlDumpPath a la ruta de XAMPP."
}

$outputPath = Join-Path $PSScriptRoot 'sgturnos_empresas_schema.sql'
$dumpArguments = @(
  "--host=$HostName",
  "--port=$Port",
  "--user=$User",
  '--no-data',
  '--skip-add-drop-table',
  '--skip-comments',
  '--routines',
  '--triggers',
  '--events',
  '--default-character-set=utf8mb4',
  "--result-file=$outputPath"
)

if ($PromptForPassword) {
  $dumpArguments += '--password'
} else {
  $dumpArguments += '--password='
}

$dumpArguments += $Database
& $MysqlDumpPath @dumpArguments

if ($LASTEXITCODE -ne 0) {
  throw "mysqldump termino con codigo $LASTEXITCODE. No se actualizo correctamente el esquema."
}

Write-Output "Esquema exportado a $outputPath"