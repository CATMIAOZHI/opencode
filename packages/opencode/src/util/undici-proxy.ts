import { ProxyEnv } from "./proxy-env"

let _ProxyAgent: any
let _loadError = false

function getProxyAgent() {
  if (_ProxyAgent) return _ProxyAgent
  if (_loadError) return
  try {
    _ProxyAgent = require("undici").ProxyAgent
  } catch {
    _loadError = true
  }
  return _ProxyAgent
}

export function createProxyFetch(proxyUrl: string) {
  const ProxyAgent = getProxyAgent()
  if (!ProxyAgent) return

  const proxyAgent = new ProxyAgent({
    uri: proxyUrl,
    allowH2: false,
  })

  return (input: any, init?: any) => {
    return (globalThis.fetch as any)(input, { ...init, dispatcher: proxyAgent })
  }
}

export function getProxyForUrl(url: string): string | undefined {
  const explicit = ProxyEnv.getProxyForUrl(url)
  if (explicit) return explicit

  if (process.platform === "win32") {
    return "http://127.0.0.1:7890"
  }
}
