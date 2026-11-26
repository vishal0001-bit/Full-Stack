import { execFile } from "node:child_process";
import dns from "node:dns";
import { promisify } from "node:util";
import mongoose from "mongoose";

const execFileAsync = promisify(execFile);

async function resolveSrvAndTxtViaSystem(host) {
  if (process.platform !== "win32") {
    throw new Error(`System SRV fallback is only supported on Windows (failed to resolve ${host})`);
  }
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    throw new Error(`Invalid MongoDB hostname: ${host}`);
  }
  const script = [
    `$srv = Resolve-DnsName -Name '_mongodb._tcp.${host}' -Type SRV -ErrorAction Stop | Select-Object NameTarget, Port`,
    `$txt = Resolve-DnsName -Name '${host}' -Type TXT -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Strings`,
    `@{ srv = @($srv); txt = @($txt) } | ConvertTo-Json -Compress`,
  ].join("; ");

  const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-Command", script], {
    timeout: 10000,
  });
  const parsed = JSON.parse(stdout.trim());
  const srvRecords = Array.isArray(parsed.srv) ? parsed.srv : parsed.srv ? [parsed.srv] : [];
  if (!srvRecords.length) {
    throw new Error(`No SRV records found for _mongodb._tcp.${host}`);
  }
  const hosts = srvRecords.map((r) => `${r.NameTarget}:${r.Port || 27017}`);
  const txtRaw = (Array.isArray(parsed.txt) ? parsed.txt : [parsed.txt]).filter(Boolean).join("&");
  return { hosts, txtParams: new URLSearchParams(txtRaw) };
}

function buildStandardMongoUri(srvUri, hosts, txtParams) {
  const parsed = new URL(srvUri);
  const auth = parsed.username
    ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@`
    : "";
  const params = new URLSearchParams(txtParams);
  for (const [key, value] of parsed.searchParams.entries()) {
    params.set(key, value);
  }
  if (!params.has("tls") && !params.has("ssl")) {
    params.set("tls", "true");
  }
  const query = params.toString();
  return `mongodb://${auth}${hosts.join(",")}${parsed.pathname || "/"}${query ? `?${query}` : ""}`;
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean) ?? [];
  if (dnsServers.length) dns.setServers(dnsServers);

  try {
    await mongoose.connect(uri);
  } catch (error) {
    const isSrvDnsError =
      uri.startsWith("mongodb+srv://") &&
      (error?.syscall === "querySrv" || error?.syscall === "queryTxt");
    if (!isSrvDnsError) throw error;

    const { hostname } = new URL(uri);
    const { hosts, txtParams } = await resolveSrvAndTxtViaSystem(hostname);
    const fallbackUri = buildStandardMongoUri(uri, hosts, txtParams);
    await mongoose.connect(fallbackUri);
  }

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
