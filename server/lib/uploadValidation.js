import path from "path";

export const MAX_UPLOAD_SIZE_BYTES = 3 * 1024 * 1024;

const FILE_RULES = {
  "image/png": {
    extensions: [".png"],
    matches: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  "image/jpeg": {
    extensions: [".jpg", ".jpeg"],
    matches: (buffer) => buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255])),
  },
  "image/webp": {
    extensions: [".webp"],
    matches: (buffer) => buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP",
  },
  "application/pdf": {
    extensions: [".pdf"],
    matches: (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
  },
  "application/msword": {
    extensions: [".doc"],
    matches: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225])),
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extensions: [".docx"],
    matches: (buffer) => buffer.subarray(0, 4).toString("ascii") === "PK\u0003\u0004" && buffer.includes(Buffer.from("[Content_Types].xml")),
  },
  "text/plain": {
    extensions: [".txt"],
    matches: (buffer) => !buffer.includes(0),
  },
};

const parseDataUrl = (dataUrl) => {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/\r\n]+={0,2})$/.exec(dataUrl);
  if (!match) return null;

  const [, mimeType, encoded] = match;
  const normalizedEncoded = encoded.replace(/[\r\n]/g, "");
  const buffer = Buffer.from(normalizedEncoded, "base64");
  if (!buffer.length || buffer.toString("base64") !== normalizedEncoded) return null;

  return { mimeType: mimeType.toLowerCase(), buffer };
};

export const validateUpload = ({ data, mimeType, fileName, allowedMimeTypes }) => {
  if (typeof data !== "string" || typeof mimeType !== "string" || typeof fileName !== "string") {
    return { valid: false, message: "Invalid upload" };
  }

  const normalizedMimeType = mimeType.toLowerCase();
  const rule = FILE_RULES[normalizedMimeType];
  const extension = path.extname(fileName).toLowerCase();
  const parsed = parseDataUrl(data);

  if (!rule || !allowedMimeTypes.has(normalizedMimeType) || !parsed || parsed.mimeType !== normalizedMimeType) {
    return { valid: false, message: "Invalid upload type" };
  }
  if (fileName.length > 120 || !rule.extensions.includes(extension)) {
    return { valid: false, message: "Invalid upload filename" };
  }
  if (parsed.buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    return { valid: false, message: "File size must be 3MB or less" };
  }
  if (!rule.matches(parsed.buffer)) {
    return { valid: false, message: "Invalid file content" };
  }
  if (normalizedMimeType === "text/plain") {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(parsed.buffer);
    } catch {
      return { valid: false, message: "Invalid text content" };
    }
  }

  return { valid: true, buffer: parsed.buffer, mimeType: normalizedMimeType, size: parsed.buffer.length };
};

export const validateImageUpload = (data) => {
  const match = typeof data === "string" ? /^data:([^;,]+);base64,/.exec(data) : null;
  if (!match) return { valid: false, message: "Invalid upload type" };

  const extensionByMimeType = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
  };
  const mimeType = match[1].toLowerCase();
  const extension = extensionByMimeType[mimeType];
  if (!extension) return { valid: false, message: "Invalid upload type" };

  return validateUpload({
    data,
    mimeType,
    fileName: `upload${extension}`,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  });
};

export const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
export const ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
