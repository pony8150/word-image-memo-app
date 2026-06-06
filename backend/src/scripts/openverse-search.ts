import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface OpenverseImageResult {
  id?: string;
  title?: string | null;
  foreign_landing_url?: string | null;
  url?: string | null;
  creator?: string | null;
  license?: string | null;
  license_version?: string | null;
  license_url?: string | null;
  source?: string | null;
  provider?: string | null;
  width?: number | null;
  height?: number | null;
  mature?: boolean | null;
  filetype?: string | null;
}

export async function searchOpenverseImages(
  query: string,
  pageSize = 8
): Promise<OpenverseImageResult[]> {
  const queryBase64 = Buffer.from(query, "utf8").toString("base64");
  const script = `
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'
$queryText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${queryBase64}'))
$url = 'https://api.openverse.org/v1/images/?q=' + [uri]::EscapeDataString($queryText) + '&page_size=${pageSize}'
$result = Invoke-RestMethod -UseBasicParsing $url
@($result.results) | ConvertTo-Json -Depth 8 -Compress
`;

  const { stdout } = await execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-Command", script],
    {
      timeout: 30000,
      maxBuffer: 4 * 1024 * 1024
    }
  );

  const trimmedOutput = stdout.trim();

  if (!trimmedOutput) {
    return [];
  }

  const parsed = JSON.parse(trimmedOutput) as OpenverseImageResult | OpenverseImageResult[];
  return Array.isArray(parsed) ? parsed : [parsed];
}
