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

interface OpenverseApiResponse {
  results?: OpenverseImageResult[] | null;
}

const OPENVERSE_API_URL = "https://api.openverse.org/v1/images/";
let shouldUsePowerShellFallback = false;

export async function searchOpenverseImages(
  query: string,
  pageSize = 8
): Promise<OpenverseImageResult[]> {
  if (shouldUsePowerShellFallback) {
    return searchOpenverseImagesViaPowerShell(query, pageSize);
  }

  const url = new URL(OPENVERSE_API_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", String(pageSize));

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Openverse responded with ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as OpenverseApiResponse;
    return Array.isArray(payload.results) ? payload.results : [];
  } catch (error) {
    if (!shouldFallbackToPowerShell(error)) {
      throw error;
    }

    shouldUsePowerShellFallback = true;
    return searchOpenverseImagesViaPowerShell(query, pageSize);
  }
}

async function searchOpenverseImagesViaPowerShell(
  query: string,
  pageSize: number
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

function shouldFallbackToPowerShell(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /fetch failed|network|tls|certificate|socket/i.test(message);
}
