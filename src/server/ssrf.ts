import { promises as dns } from "node:dns";
import { BlockList, isIP } from "node:net";

export type SsrfCheckResult =
  | { ok: true; url: URL }
  | { ok: false; code: "INVALID_URL" }
  | { ok: false; code: "SSRF_BLOCKED" };

export interface SsrfResolver {
  resolveAddresses(hostname: string): Promise<string[]>;
}

const blockList = new BlockList();
// IPv4 — RFC 1918, loopback, link-local, CGNAT, TEST-NET, multicast, reserved.
blockList.addSubnet("0.0.0.0", 8);
blockList.addSubnet("10.0.0.0", 8);
blockList.addSubnet("100.64.0.0", 10);
blockList.addSubnet("127.0.0.0", 8);
blockList.addSubnet("169.254.0.0", 16);
blockList.addSubnet("172.16.0.0", 12);
blockList.addSubnet("192.0.0.0", 24);
blockList.addSubnet("192.0.2.0", 24);
blockList.addSubnet("192.168.0.0", 16);
blockList.addSubnet("198.18.0.0", 15);
blockList.addSubnet("198.51.100.0", 24);
blockList.addSubnet("203.0.113.0", 24);
blockList.addSubnet("224.0.0.0", 4);
blockList.addSubnet("240.0.0.0", 4);
blockList.addAddress("255.255.255.255");
// IPv6 — unspecified, loopback, IPv4-mapped, NAT64, discard, TEREDO/ORCHID,
// documentation, ULA, link-local, multicast.
blockList.addSubnet("::", 128, "ipv6");
blockList.addSubnet("::1", 128, "ipv6");
blockList.addSubnet("64:ff9b::", 96, "ipv6");
blockList.addSubnet("100::", 64, "ipv6");
blockList.addSubnet("2001::", 32, "ipv6");
blockList.addSubnet("2001:10::", 28, "ipv6");
blockList.addSubnet("2001:db8::", 32, "ipv6");
blockList.addSubnet("fc00::", 7, "ipv6");
blockList.addSubnet("fe80::", 10, "ipv6");
blockList.addSubnet("ff00::", 8, "ipv6");

export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return blockList.check(address, "ipv4");
  if (family === 6) {
    if (blockList.check(address, "ipv6")) return true;
    const v4 = mappedIpv4(address);
    return v4 ? blockList.check(v4, "ipv4") : false;
  }
  return false;
}

function mappedIpv4(address: string): string | undefined {
  const dotted = /^::ffff:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address);
  if (dotted) {
    return `${dotted[1]}.${dotted[2]}.${dotted[3]}.${dotted[4]}`;
  }
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(address);
  if (hex) {
    const hi = parseInt(hex[1]!, 16);
    const lo = parseInt(hex[2]!, 16);
    return `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
  }
  return undefined;
}

function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "localhost" || host.endsWith(".localhost");
}

function stripIpv6Brackets(hostname: string): string {
  return hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

const defaultResolver: SsrfResolver = {
  async resolveAddresses(hostname: string): Promise<string[]> {
    const [ipv4, ipv6] = await Promise.allSettled([
      dns.resolve4(hostname),
      dns.resolve6(hostname),
    ]);
    const addresses: string[] = [];
    if (ipv4.status === "fulfilled") addresses.push(...ipv4.value);
    if (ipv6.status === "fulfilled") addresses.push(...ipv6.value);
    return addresses;
  },
};

export async function validateTargetUrl(
  raw: string,
  resolver: SsrfResolver = defaultResolver,
): Promise<SsrfCheckResult> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, code: "INVALID_URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, code: "INVALID_URL" };
  }

  const hostname = stripIpv6Brackets(url.hostname);
  if (!hostname) {
    return { ok: false, code: "INVALID_URL" };
  }
  if (isLocalHostname(hostname)) {
    return { ok: false, code: "SSRF_BLOCKED" };
  }

  const addresses =
    isIP(hostname) !== 0 ? [hostname] : await resolver.resolveAddresses(hostname);

  if (addresses.some(isBlockedAddress)) {
    return { ok: false, code: "SSRF_BLOCKED" };
  }

  return { ok: true, url };
}
