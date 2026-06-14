export const ALLOWED_TEXT_EXTENSIONS = ['.txt', '.md', '.markdown'];
export const ALLOWED_UPLOAD_EXTENSIONS = [...ALLOWED_TEXT_EXTENSIONS, '.pdf'];
export const MAX_PDF_SIZE_MB = 5;

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function isTextFile(file: File): boolean {
  return ALLOWED_TEXT_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

export function validateUploadFile(file: File): string | null {
  if (isPdfFile(file)) {
    if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
      return `El PDF supera ${MAX_PDF_SIZE_MB} MB.`;
    }
    return null;
  }
  if (isTextFile(file)) return null;
  return 'Formato no soportado. Usa .txt, .md o .pdf';
}
