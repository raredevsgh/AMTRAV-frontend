export function validSection(section: string[]) {
  if (!section.length) return true;
  if (section.length === 1)
    return [
      "devices",
      "register",
      "manufacturers",
      "files",
      "firmware",
      "map",
      "security",
      "provision",
      "travellers",
      "messages",
      "fleet",
      "impacts",
      "alerts",
      "leads",
      "shop",
      "support",
      "profile",
    ].includes(section[0]);
  return (
    section.length === 2 &&
    (section[0] === "devices" ||
      section[0] === "provision" ||
      section[0] === "travellers" ||
      section[0] === "support") &&
    /^[0-9a-f-]{36}$/i.test(section[1])
  );
}
