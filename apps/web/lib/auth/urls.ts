const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;
}

export function getAuthCallbackUrl() {
  return `${getSiteUrl()}/auth/callback`;
}

export function getEmailTemplateLink(type: "invite" | "recovery") {
  return `${getSiteUrl()}/auth/confirm?token_hash={{ .TokenHash }}&type=${type}&next=/auth/callback`;
}
