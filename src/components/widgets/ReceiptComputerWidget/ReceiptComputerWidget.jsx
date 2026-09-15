import { useEffect, useRef, useState } from 'react';
import receiptSlot from '../../../assets/receipt-computer/receipt-slot.png';
import receiptDivider from '../../../assets/receipt-computer/receipt-divider.svg';
import receiptEdge from '../../../assets/receipt-computer/receipt-edge.svg';
import './ReceiptComputerWidget.css';

const MESSAGES = ['Hello', ':-)', 'Hi there!', '(^_^)', 'Howdy!', '<3'];
const DEFAULT_RECEIPT = [
  ['Hello', '2025/10/28'],
  [':)', '2025/10/28'],
];
const RECEIPT_BASE_HEIGHT = 103;
const RECEIPT_FEED_DISTANCE = 33;
const RECEIPT_ENTRY_STEP = 33;

export default function ReceiptComputerWidget() {
  const [screenText, setScreenText] = useState(MESSAGES[0]);
  const [draft, setDraft] = useState('');
  const [printedItems, setPrintedItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const inputRef = useRef(null);
  const screenTextRef = useRef(screenText);

  useEffect(() => {
    screenTextRef.current = screenText;
  }, [screenText]);

  useEffect(() => {
    if (isEditing || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let messageIndex = MESSAGES.indexOf(screenTextRef.current);
    let currentMessage = messageIndex >= 0 ? MESSAGES[messageIndex] : screenTextRef.current;
    let position = currentMessage.length;
    let deleting = true;
    let timerId;

    const tick = () => {
      let typedComplete = false;

      if (deleting) {
        position -= 1;
        setScreenText(currentMessage.slice(0, position));
        if (position === 0) {
          messageIndex = messageIndex >= 0 ? (messageIndex + 1) % MESSAGES.length : 0;
          currentMessage = MESSAGES[messageIndex];
          deleting = false;
        }
      } else {
        position += 1;
        setScreenText(currentMessage.slice(0, position));
        typedComplete = position === currentMessage.length;
        if (typedComplete) deleting = true;
      }

      const delay = position === 0 ? 400 : typedComplete ? 1300 : deleting ? 85 : 115;
      timerId = window.setTimeout(tick, delay);
    };

    timerId = window.setTimeout(tick, 1500);
    return () => window.clearTimeout(timerId);
  }, [isEditing]);

  const handleAddNew = () => {
    setDraft('');
    setScreenText('');
    setIsEditing(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!printedItems.length) setIsPrinting(false);
    setDraft('');
    setScreenText(MESSAGES[0]);
    inputRef.current?.blur();
  };

  const handlePrint = () => {
    const value = draft.trim() || screenText.trim();
    if (!value) {
      inputRef.current?.focus();
      return;
    }

    setIsPrinting(false);
    setPrintedItems((items) => [value, ...items]);
    setDraft('');
    setScreenText(value);
    setIsEditing(false);
    inputRef.current?.blur();
    window.requestAnimationFrame(() => setIsPrinting(true));
  };

  const receiptPrintCount = printedItems.length;
  const receiptPaperHeight = RECEIPT_BASE_HEIGHT + receiptPrintCount * RECEIPT_ENTRY_STEP;
  const receiptEdgeStart = receiptPrintCount
    ? 98 + (receiptPrintCount - 1) * RECEIPT_ENTRY_STEP
    : 98;
  const receiptFinalDividerOffset = 12 + (receiptPrintCount + DEFAULT_RECEIPT.length) * RECEIPT_ENTRY_STEP;
  const receiptOldDividerOffset = receiptPrintCount
    ? receiptFinalDividerOffset - RECEIPT_ENTRY_STEP
    : receiptFinalDividerOffset;

  return (
    <div
      className={`widget receipt-computer-widget${isEditing ? ' is-editing' : ''}${printedItems.length ? ' has-printed' : ''}${isPrinting ? ' is-printing' : ''}`}
      aria-label="Interactive receipt computer"
    >
      <div className="receipt-computer-body">
        <div className="receipt-computer-screen-shell">
          <div className="receipt-computer-screen">
            <div className="receipt-computer-screen-glass" aria-hidden="true" />
            <span className="receipt-computer-screen-text" aria-live="polite">
              {screenText || '\u00a0'}
            </span>
            <input
              ref={inputRef}
              className="receipt-computer-input"
              value={draft}
              onChange={(event) => {
                const value = event.target.value.slice(0, 24);
                setDraft(value);
                setScreenText(value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handlePrint();
                if (event.key === 'Escape') handleCancel();
              }}
              aria-label="Type a message for the receipt"
              tabIndex={isEditing ? 0 : -1}
              maxLength={24}
            />
          </div>
        </div>

        <div className="receipt-computer-controls">
          <button type="button" className="receipt-computer-add" onClick={handleAddNew}>
            + ADD NEW
          </button>
          <button type="button" className="receipt-computer-print" onClick={handlePrint}>
            PRINT
          </button>
        </div>

        <div className="receipt-computer-printer-slot">
          <img src={receiptSlot} alt="" draggable={false} />
        </div>

        <div
          className="receipt-computer-receipt"
          aria-live="polite"
          style={{
            '--receipt-feed-distance': `${RECEIPT_FEED_DISTANCE}px`,
            '--receipt-paper-height': `${receiptPaperHeight}px`,
            '--receipt-edge-start': `${receiptEdgeStart}px`,
            '--receipt-final-divider-offset': `${receiptFinalDividerOffset}px`,
            '--receipt-old-divider-offset': `${receiptOldDividerOffset}px`,
          }}
        >
          {printedItems.map((content, index) => (
            <div
              className={`receipt-computer-entry${index === 0 ? ' is-new' : ''}`}
              key={`printed-${index}-${content}`}
              style={{
                '--entry-final-offset': `${12 + index * RECEIPT_ENTRY_STEP}px`,
                '--entry-old-offset': `${12 + Math.max(index - 1, 0) * RECEIPT_ENTRY_STEP}px`,
              }}
            >
              <img className="receipt-computer-divider" src={receiptDivider} alt="" draggable={false} />
              <div className="receipt-computer-transaction">
                <strong>{content}</strong>
                <div className="receipt-computer-transaction-details">
                  <span>2025/10/28</span>
                </div>
              </div>
            </div>
          ))}
          {DEFAULT_RECEIPT.map(([content, date], index) => {
            const entryIndex = printedItems.length + index;

            return (
              <div
                className="receipt-computer-entry"
                key={`default-${content}-${index}`}
                style={{
                  '--entry-final-offset': `${12 + entryIndex * RECEIPT_ENTRY_STEP}px`,
                  '--entry-old-offset': `${12 + Math.max(entryIndex - 1, 0) * RECEIPT_ENTRY_STEP}px`,
                }}
              >
                <img className="receipt-computer-divider" src={receiptDivider} alt="" draggable={false} />
                <div className="receipt-computer-transaction">
                  <strong>{content}</strong>
                  <div className="receipt-computer-transaction-details">
                    <span>{date}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="receipt-computer-final-divider">
            <img className="receipt-computer-divider" src={receiptDivider} alt="" draggable={false} />
          </div>
          <img className="receipt-computer-edge" src={receiptEdge} alt="" draggable={false} />
        </div>
      </div>
    </div>
  );
}
