import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

type Testimonial = {
  id: string;
  name: string;
  property?: string;
  text: string;
  createdAt?: string | number;
};

interface Props {
  pollInterval?: number; // milliseconds
}

export const TestimonialsRealtime: React.FC<Props> = ({ pollInterval = 10000 }) => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  // Vite exposes env via import.meta.env. Cast to any for TS compatibility in this repo.
  const wsUrl = (import.meta as any).env?.VITE_WS_URL as string | undefined;
  const sseUrl = (import.meta as any).env?.VITE_SSE_URL as string | undefined;

    let pollingId: number | undefined;
    let es: EventSource | null = null;
    let ws: WebSocket | null = null;

    const fetchOnce = async () => {
      try {
        const res = await api.get('/testimonials');
        // Expecting an array in res.data; cast defensively
        const data = (res.data as any) || [];
        setItems(Array.isArray(data) ? (data as Testimonial[]) : []);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Gagal memuat testimoni');
      } finally {
        setLoading(false);
      }
    };

    // Prefer WebSocket if configured
    if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);
        ws.addEventListener('open', () => {
          // optionally request initial list
          ws?.send(JSON.stringify({ type: 'testimonials:subscribe' }));
        });
        ws.addEventListener('message', (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            // server may send full list or incremental updates
            if (Array.isArray(payload)) setItems(payload);
            else if (payload.type === 'testimonials:update' && Array.isArray(payload.data)) setItems(payload.data);
            else if (payload.type === 'testimonial:added' && payload.data) setItems((s) => [payload.data, ...s]);
            setLoading(false);
          } catch (e) {
            // ignore malformed messages
          }
        });
        ws.addEventListener('error', () => {
          // fallback to polling if WS fails
          ws?.close();
          fetchOnce();
          pollingId = window.setInterval(fetchOnce, pollInterval);
        });
      } catch (e) {
        // fallback
        fetchOnce();
        pollingId = window.setInterval(fetchOnce, pollInterval);
      }
    } else if (sseUrl && typeof EventSource !== 'undefined') {
      // Server-Sent Events
      try {
        es = new EventSource(sseUrl);
        es.addEventListener('message', (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (Array.isArray(payload)) setItems(payload);
            else if (payload.type === 'testimonials:update' && Array.isArray(payload.data)) setItems(payload.data);
            else if (payload.type === 'testimonial:added' && payload.data) setItems((s) => [payload.data, ...s]);
            setLoading(false);
          } catch (e) {}
        });
        es.addEventListener('error', () => {
          es?.close();
          // fallback to polling
          fetchOnce();
          pollingId = window.setInterval(fetchOnce, pollInterval);
        });
      } catch (e) {
        fetchOnce();
        pollingId = window.setInterval(fetchOnce, pollInterval);
      }
    } else {
      // polling fallback
      fetchOnce();
      pollingId = window.setInterval(fetchOnce, pollInterval);
    }

    return () => {
      if (pollingId) clearInterval(pollingId);
      if (es) es.close();
      if (ws) ws.close();
    };
  }, [pollInterval]);

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Testimoni Pengguna</h4>
      </div>

      {loading && <p className="text-sm text-gray-500">Memuat testimoni...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {items.length === 0 && !loading && <p className="text-sm text-gray-500">Belum ada testimoni.</p>}
        {items.map((t) => (
          <div key={t.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                <span className="text-primary-700 font-semibold">{t.name?.[0] || 'U'}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                {t.property && <p className="text-sm text-gray-500">{t.property}</p>}
              </div>
            </div>
            <p className="text-sm text-gray-700">{t.text}</p>
            {t.createdAt && <p className="text-xs text-gray-400 mt-2">{new Date(t.createdAt).toLocaleString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsRealtime;
