import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

export function useMoodboardExport(eventId: number, setError: (message: string) => void) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const saveImage = async () => {
    if (!boardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await document.fonts.ready;
      const board = boardRef.current;
      await Promise.all(Array.from(board.querySelectorAll('img')).map((image) => image.decode()));
      const data = await toPng(board, {
        pixelRatio: 2, backgroundColor: '#FFF8F1',
        width: board.offsetWidth, height: board.offsetHeight,
        style: { transform: 'none' },
        filter: (node) => !(node instanceof Element && node.hasAttribute('data-export-ignore')),
      });
      const anchor = document.createElement('a');
      anchor.download = `yourevent-moodboard-event-${eventId}.png`;
      anchor.href = data;
      anchor.click();
    } catch { setError('Could not export the moodboard. Check that all images have loaded, then try again.'); }
    finally { setIsExporting(false); }
  };
  return { boardRef, isExporting, saveImage };
}
