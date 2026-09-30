import "server-only";

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_MAX_CHARS = 30_000;

export class ResumeFileError extends Error {}

/** Extract plain text from an uploaded resume (PDF, DOCX or TXT). */
export async function extractResumeText(file: File): Promise<string> {
  if (file.size > RESUME_MAX_BYTES) throw new ResumeFileError("Resumes must be 5 MB or smaller.");
  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: true });
      return text;
    } catch {
      throw new ResumeFileError("We couldn't read that PDF. If it's password-protected, remove the password and try again.");
    }
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    try {
      const { value } = await mammoth.extractRawText({ buffer: buf });
      return value;
    } catch {
      throw new ResumeFileError("We couldn't read that Word file. Try saving it again as .docx or PDF.");
    }
  }
  if (name.endsWith(".doc")) {
    throw new ResumeFileError("Old .doc files aren't supported — most ATS struggle with them too. Save as .docx or PDF.");
  }
  if (name.endsWith(".txt") || file.type.startsWith("text/")) return buf.toString("utf8");
  throw new ResumeFileError("Upload a PDF, DOCX or TXT file.");
}
