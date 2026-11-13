const uuid = "[0-9a-fA-F-]{36}";

// Keep the same-origin gateway limited to the console's supported operations.
export function allowsEndpoint(path: string, method: string) {
  const rules: [RegExp, string[]][] = [
    [/^auth\/(login|refresh|logout)$/, ["POST"]],
    [/^auth\/password\/(forgot|reset)$/, ["POST"]],
    [/^auth\/me$/, ["GET"]],
    [/^auth\/me\/profile$/, ["PATCH"]],
    [/^auth\/me\/photo(\/delete)?$/, ["POST"]],
    [/^auth\/password\/change$/, ["POST"]],
    [/^auth\/sessions$/, ["GET"]],
    [/^auth\/sessions\/revoke-all$/, ["POST"]],
    [new RegExp(`^auth/sessions/${uuid}/revoke$`), ["POST"]],
    [/^admin\/security-events$/, ["GET"]],
    [/^admin\/travellers$/, ["GET"]],
    [new RegExp(`^admin/travellers/${uuid}$`), ["GET"]],
    [new RegExp(`^users/${uuid}/photo$`), ["GET"]],
    [/^admin\/messages$/, ["GET", "POST"]],
    [new RegExp(`^admin/travellers/${uuid}/messages$`), ["POST"]],
    [new RegExp(`^admin/travellers/${uuid}/(suspend|restore)$`), ["POST"]],
    [/^auth\/mfa$/, ["GET"]],
    [
      /^auth\/mfa\/(totp\/(setup|confirm|disable)|recovery-codes|verify|passkey\/(start|finish))$/,
      ["POST"],
    ],
    [/^auth\/passkeys\/(register|login)\/(start|finish)$/, ["POST"]],
    [new RegExp(`^auth/passkeys/${uuid}/delete$`), ["POST"]],
    [new RegExp(`^admin/users/${uuid}/mfa/reset$`), ["POST"]],
    [/^devices\/batches$/, ["GET", "POST"]],
    [new RegExp(`^devices/batches/${uuid}$`), ["GET"]],
    [new RegExp(`^admin/users/${uuid}/sessions/revoke$`), ["POST"]],
    [new RegExp(`^auth/jobs/${uuid}$`), ["GET"]],
    [/^admin\/users$/, ["GET"]],
    [/^admin\/manufacturers$/, ["POST"]],
    [/^admin\/locations\/ticket$/, ["POST"]],
    [new RegExp(`^admin/users/${uuid}/role$`), ["PATCH"]],
    [/^devices$/, ["GET", "POST"]],
    [new RegExp(`^devices/${uuid}$`), ["GET", "PATCH"]],
    [new RegExp(`^devices/${uuid}/(revoke|claim-code)$`), ["POST"]],
    [new RegExp(`^devices/${uuid}/audit$`), ["GET"]],
    [/^admin\/(impacts|alerts|leads)$/, ["GET"]],
    [/^admin\/shop\/orders$/, ["GET"]],
    [/^admin\/shop\/products$/, ["GET", "POST"]],
    [new RegExp(`^admin/shop/orders/${uuid}/(ship|refund|resolve)$`), ["POST"]],
    [/^admin\/shop\/returns$/, ["GET"]],
    [new RegExp(`^admin/shop/returns/${uuid}$`), ["POST"]],
    [/^admin\/shop\/products\/[a-z0-9-]{2,40}$/, ["PATCH"]],
    [/^admin\/shop\/products\/[a-z0-9-]{2,40}\/image$/, ["POST"]],
    [/^admin\/fleet\/(health|firmware)$/, ["GET"]],
    [new RegExp(`^admin/devices/${uuid}/config$`), ["GET", "PATCH"]],
    [new RegExp(`^admin/devices/${uuid}/timeline$`), ["GET"]],
    [new RegExp(`^admin/devices/${uuid}/impact-readings$`), ["GET"]],
    [new RegExp(`^admin/devices/${uuid}/replace$`), ["POST"]],
    [/^admin\/firmware\/releases$/, ["GET", "POST"]],
    [new RegExp(`^admin/firmware/releases/${uuid}$`), ["GET", "PATCH"]],
    [/^admin\/firmware\/signing-key$/, ["GET"]],
    [new RegExp(`^devices/${uuid}/status$`), ["GET"]],
    [/^files$/, ["GET", "POST"]],
    [new RegExp(`^files/${uuid}/download$`), ["GET"]],
    // Incidents: taking alerts on, and working them through to resolution.
    [/^admin\/alerts\/\d{1,19}\/incident$/, ["POST"]],
    [/^admin\/incidents$/, ["GET"]],
    [new RegExp(`^admin/incidents/${uuid}$`), ["GET"]],
    [new RegExp(`^admin/incidents/${uuid}/actions$`), ["POST"]],
    // Support: the staff queue, conversations, warranty claims and their attachments.
    [/^admin\/support\/tickets$/, ["GET"]],
    [new RegExp(`^admin/support/tickets/${uuid}$`), ["GET", "PATCH"]],
    [new RegExp(`^admin/support/tickets/${uuid}/messages$`), ["POST"]],
    [new RegExp(`^admin/support/tickets/${uuid}/claim/(decision|progress)$`), ["POST"]],
    [new RegExp(`^support/tickets/${uuid}/files/${uuid}$`), ["GET"]],
  ];
  return rules.some(
    ([pattern, methods]) => pattern.test(path) && methods.includes(method),
  );
}

export function isSameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export function isStaff(role: unknown): role is "admin" | "manufacturer" {
  return role === "admin" || role === "manufacturer";
}
