import { useState } from 'react';
import Button from '../ui/Button';

type Props = {
  onPdf: () => Promise<void>;
  onCsv?: () => Promise<void>;
};

export default function ExportButtons({ onPdf, onCsv }: Props) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async (fn: () => Promise<void>, setLoading: (v: boolean) => void) => {
    setErr(null);
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al exportar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        loading={loadingPdf}
        onClick={() => handle(onPdf, setLoadingPdf)}
      >
        Descargar reporte PDF
      </Button>
      {onCsv && (
        <Button
          type="button"
          variant="secondary"
          loading={loadingCsv}
          onClick={() => handle(onCsv, setLoadingCsv)}
        >
          Exportar CSV
        </Button>
      )}
      {err && <p className="w-full text-xs text-red-600 dark:text-red-400">{err}</p>}
    </div>
  );
}
