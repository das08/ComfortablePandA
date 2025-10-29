import React, { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure pdf.js worker source.
// For production, bundle pdf.worker.min.js with your extension and declare it as a web_accessible_resource.
// This path is resolved relative to the extension's root directory.
pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.mjs');

interface PdfThumbnailProps {
  pdfUrl: string;
  width?: number;
  height?: number;
}

const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ pdfUrl, width = 150, height }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error("Failed to load PDF document:", err);
    setError("Failed to load PDF. It might be corrupted or not a PDF.");
    setLoading(false);
  };

  if (error) {
    return (
      <div className="cs-pdf-thumbnail-error" style={{ width, height: height || 'auto', border: '1px solid #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', color: 'red', padding: '5px', textAlign: 'center', boxSizing: 'border-box' }}>
        <span style={{ marginBottom: '5px' }}>Error loading PDF</span>
        <span style={{ fontSize: '0.6em', color: '#888' }}>{error}</span>
      </div>
    );
  }
  // console.log("loading:" + loading);
  return (
    <div className="cs-pdf-thumbnail-container" style={{ width, height: height || 'auto', border: '1px solid #ccc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', position: 'relative' }}>
      {loading && (
        <div className="cs-pdf-thumbnail-loading" style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
          Loading...
        </div>
      )}
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null} // Custom loading handled by parent div
        error={null} // Custom error handled by parent div
      >
        {numPages && (
          <Page
            pageNumber={1} // Always render the first page for a thumbnail
            width={width}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading={null} // Custom loading handled by parent div
          />
        )}
      </Document>
      {!numPages && !loading && !error && (
        <div className="cs-pdf-thumbnail-placeholder" style={{ width, height: height || 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', color: '#666' }}>
          No PDF pages.
        </div>
      )}
    </div>
  );
};

const ImageThumbnail: React.FC<{ imageUrl: string; width?: number }> = ({ imageUrl, width = 150 }) => {
  return (
    <div className="cs-image-thumbnail-container" style={{ width, border: '1px solid #ccc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
      <img
        src={imageUrl}
        alt="Image thumbnail"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onError={(e) => {
          (e.target as HTMLImageElement).alt = 'Error loading image';
        }}
      />
    </div>
  );
};
/**
 * Injects PDF thumbnails into the assignment submission list on the assignment page.
 * This function should be called when the assignment page content is loaded.
 */
export function injectPdfThumbnails(): void {
  const assignmentPageDiv = document.getElementById('StudentAssignmentCurrent');
  if (!assignmentPageDiv) {
    // console.log("Not on an assignment page with StudentAssignmentCurrent div. Skipping thumbnail injection.");
    return;
  }

  const attachList = assignmentPageDiv.querySelector('UL.attachList.indnt1');
  if (!attachList) {
    // console.log("No attachment list found on this assignment page.");
    return;
  }

  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];

  const attachments = Array.from(attachList.querySelectorAll('li'))
    .map(li => {
      const anchor = li.querySelector('a');
      const href = anchor?.getAttribute('href');
      if (href) {
        const lowerHref = href.toLowerCase();
        const isPdf = lowerHref.endsWith('.pdf');
        const isImage = imageExtensions.some(ext => lowerHref.endsWith(ext));
        if (isPdf || isImage) {
          return { li, href, isPdf };
        }
      }
      return null;
    })
    .filter((item): item is { li: HTMLLIElement; href: string; isPdf: boolean } => item !== null);

  if (attachments.length === 0) {
    return; // No PDFs, do nothing.
  }

  const button = document.createElement('button');
  button.textContent = 'サムネイルを表示';
  button.className = 'btn btn-sm';
  button.style.marginBottom = '10px';
  button.style.fontWeight = 'bold';


  button.onclick = () => {
    attachments.forEach(({ li, href, isPdf }) => {
      const anchorTag = li.querySelector('a');
      if (anchorTag) {
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'cs-pdf-thumbnail-wrapper';
        thumbnailContainer.style.marginTop = '8px'; // Add some spacing below the link
        thumbnailContainer.style.marginBottom = '8px';

        // Insert the container after the anchor tag, but still within the LI
        anchorTag.parentNode?.insertBefore(thumbnailContainer, anchorTag.nextSibling);

        // Render the React component into the new container
        const root = createRoot(thumbnailContainer);
        if (isPdf) {
          root.render(<PdfThumbnail pdfUrl={href} width={150} />);
        } else {
          root.render(<ImageThumbnail imageUrl={href} width={150} />);
        }
      }
    });
    button.remove();
  };

  attachList.parentNode?.insertBefore(button, attachList);
}

/**
 * Injects PDF thumbnails on the assignment editing/submission page.
 * This function should be called when the page content is loaded.
 */
export function injectThumbnailsToOngoingAssignment(): void {
  const attachmentsPanel = document.getElementById('attachmentspanel');
  if (!attachmentsPanel) {
    // console.log("Not on an assignment submission page. Skipping thumbnail injection.");
    return;
  }

  // Find the table element among the direct children of attachmentsPanel, ignoring classes.
  const attachTable = Array.from(attachmentsPanel.children).find(
    (child) => child.tagName === 'TABLE'
  );

  if (!attachTable) {
    // console.log("No attachment list found on this assignment submission page.");
    return;
  }

  // console.log(Array.from(attachTable.querySelectorAll('tbody > tr')));

  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];

  const attachments = Array.from(attachTable.querySelectorAll('tbody > tr'))
    .map(tr => {
      const anchor = tr.querySelector('td:first-child a');
      const href = anchor?.getAttribute('href');
      // console.log(href);
      // Ensure it's a file link and not a javascript action
      if (anchor && href && !href.startsWith('javascript:')) {
        const lowerHref = href.toLowerCase();
        const isPdf = lowerHref.endsWith('.pdf');
        const isImage = imageExtensions.some(ext => lowerHref.endsWith(ext));
        if (isPdf || isImage) {
          return { tr, anchor, href, isPdf };
        }
      }
      return null;
    })
    .filter((item): item is { tr: HTMLTableRowElement; anchor: HTMLAnchorElement; href: string; isPdf: boolean } => item !== null);

  if (attachments.length === 0) {
    return; // No PDFs, do nothing.
  }

  const button = document.createElement('button');
  button.textContent = 'サムネイルを表示';
  button.className = 'btn btn-sm';
  button.style.marginBottom = '10px';
  button.style.fontWeight = 'bold';

  button.onclick = () => {
    attachments.forEach(({ tr, anchor, href, isPdf }) => {
      const thumbnailContainer = document.createElement('div');
      thumbnailContainer.className = 'cs-pdf-thumbnail-wrapper';
      thumbnailContainer.style.marginTop = '8px';
      thumbnailContainer.style.marginBottom = '8px';

      // The anchor is inside the first TD. Insert the thumbnail container
      // into the same TD, right after the anchor element.
      anchor.parentNode?.insertBefore(thumbnailContainer, anchor.nextSibling);

      const root = createRoot(thumbnailContainer);
      if (isPdf) {
        root.render(<PdfThumbnail pdfUrl={href} width={150} />);
      } else {
        root.render(<ImageThumbnail imageUrl={href} width={150} />);
      }
    });
    button.remove();
  };

  attachTable.parentNode?.insertBefore(button, attachTable);
}
