import sanitize from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "h2",
  "h3",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "img",
  "pre",
  "code",
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
};

export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    disallowedTagsMode: "discard",
  });
}
