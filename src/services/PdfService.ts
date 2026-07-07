/**
 * PdfService downloads a management-report PDF (typically from the fund's
 * official Investor Relations page) and extracts its plain text client-side.
 * Only the extracted text — never the binary file — is later sent to the AI,
 * per the brief.
 *
 * Note: fetching an arbitrary cross-origin PDF from the browser is subject to
 * CORS. Many IR pages serve PDFs with permissive CORS headers, but if a
 * specific host blocks it, the UI surfaces a clear error asking the user to
 * download the PDF and use the "Colar texto manualmente" fallback instead.
 */

let pdfjsLibPromise: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
      return lib;
    });
  }
  return pdfjsLibPromise;
}

export const PdfService = {
  async extractTextFromUrl(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Não foi possível baixar o PDF (status ${res.status}).`);
    const buffer = await res.arrayBuffer();
    return this.extractTextFromArrayBuffer(buffer);
  },

  async extractTextFromArrayBuffer(buffer: ArrayBuffer): Promise<string> {
    const pdfjsLib = await getPdfjs();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pageTexts.push(text);
    }

    return pageTexts.join('\n\n').trim();
  },
};
