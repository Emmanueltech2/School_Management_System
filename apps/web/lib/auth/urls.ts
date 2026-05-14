const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;
}

export function getConfirmUrl(type: "invite" | "recovery") {
  return `${getSiteUrl()}/auth/confirm?type=${type}&next=/auth/callback`;
}
