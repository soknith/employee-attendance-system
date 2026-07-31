import { useEffect, useState } from 'react';
import { GraduationCap, ShieldCheck, ShieldAlert, Loader2, Phone, Mail, Building2 } from 'lucide-react';
import { api, type IdCard } from '@/lib/apiClient';

export function QrVerifyPage({ qrToken }: { qrToken: string }) {
  const [card, setCard] = useState<IdCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.verifyQrCode(qrToken)
      .then((c) => {
        if (!c) setError('Card not found or invalid QR code.');
        setCard(c);
      })
      .catch(() => setError('Verification failed.'))
      .finally(() => setLoading(false));
  }, [qrToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Verification Failed</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error ?? 'Invalid card.'}</p>
      </div>
    );
  }

  const teacher = card.teacher;
  const dept = teacher?.department as { name_en?: string; name_km?: string } | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Verified badge */}
        <div className="mb-4 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <ShieldCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">Card Verified</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">SovannKiri Primary School, Battambang</p>
        </div>

        {/* Photo */}
        <div className="mb-4 flex justify-center">
          <div className="h-28 w-24 overflow-hidden rounded-xl border-2 border-brand-200 bg-gray-100">
            {card.photo_url ? (
              <img src={card.photo_url} alt={teacher?.full_name_en ?? ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <GraduationCap className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">{teacher?.full_name_kh ?? teacher?.full_name_en ?? '—'}</p>
            <p className="text-xs text-gray-500">{teacher?.position ?? '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
            <div>
              <p className="text-xs text-gray-400">Employee ID</p>
              <p className="font-medium text-gray-900 dark:text-white">{card.employee_id ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Teacher Code</p>
              <p className="font-medium text-gray-900 dark:text-white">{teacher?.teacher_code ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Department</p>
              <p className="font-medium text-gray-900 dark:text-white">{dept?.name_en ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-medium capitalize text-gray-900 dark:text-white">{card.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone className="h-3 w-3" /> {teacher?.phone ?? '—'}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="h-3 w-3" /> {teacher?.email ?? '—'}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Building2 className="h-3 w-3" /> {card.card_number ?? '—'}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Issued: {card.issue_date ?? '—'} {card.expiry_date ? `• Expires: ${card.expiry_date}` : ''}
        </p>
      </div>
    </div>
  );
}
