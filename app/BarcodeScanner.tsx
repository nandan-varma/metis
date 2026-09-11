'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (hasStarted.current) return;
    hasStarted.current = true;

    const scanner = new Html5Qrcode('barcode-scanner');
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scanner
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Error callback - this fires frequently, so we don't show it
        }
      )
      .then(() => {
        setIsScanning(true);
        setError(null);
      })
      .catch((err) => {
        setError(
          'Unable to access camera. Please ensure camera permissions are granted.'
        );
        console.error('Camera error:', err);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err);
        });
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="barcode-scanner-title"
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-2 sm:p-4"
    >
      <div className="bg-card text-card-foreground rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 id="barcode-scanner-title" className="text-xl sm:text-2xl font-bold">Scan Barcode</h2>
          <button
            onClick={handleClose}
            aria-label="Close scanner"
            className="text-muted-foreground hover:text-foreground text-3xl sm:text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border-l-4 border-destructive p-3 sm:p-4 mb-3 sm:mb-4 rounded">
            <p className="text-destructive text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <div className="mb-3 sm:mb-4">
          <div
            id="barcode-scanner"
            className="rounded-lg overflow-hidden border-2 sm:border-4 border-primary w-full"
          />
        </div>

        {isScanning && (
          <p className="flex items-center justify-center gap-1.5 text-center text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-0">
            <Camera className="size-4" aria-hidden="true" />
            Position the barcode within the frame
          </p>
        )}

        <button
          onClick={handleClose}
          className="w-full mt-3 sm:mt-4 px-4 py-2 sm:py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm sm:text-base font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
