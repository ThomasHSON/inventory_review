interface Config {
  domain: string;
  homepage: string;
}

export async function getConfig(): Promise<Config> {
  const response = await fetch('/config.txt');
  const text = await response.text();
  return JSON.parse(text);
}

let configCache: Config | null = null;

export async function getDomain(): Promise<string> {
  if (!configCache) {
    configCache = await getConfig();
  }
  return configCache.domain;
}