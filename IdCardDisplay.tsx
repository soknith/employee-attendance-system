import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { IdCard } from '@/lib/apiClient';

type IdCardDisplayProps = {
  card: IdCard;
  schoolName?: string;
  schoolNameKm?: string;
  schoolAddress?: string;

  lang: 'km' | 'en';
  side?: 'front' | 'back' | 'both';
};

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#6b7280',
  expired: '#ef4444',
  lost: '#f97316',
  replaced: '#3b82f6',
};

const STATUS_LABELS: Record<string, { en: string; km: string }> = {
  active: { en: 'ACTIVE', km: 'សកម្ម' },
  inactive: { en: 'INACTIVE', km: 'មិនសកម្ម' },
  expired: { en: 'EXPIRED', km: 'ផុតកំណត់' },
  lost: { en: 'LOST', km: 'បាត់' },
  replaced: { en: 'REPLACED', km: 'បានជំនួស' },
};

function BarcodeSVG({ value }: { value: string }) {
  const bars: { x: number; w: number; black: boolean }[] = [];
  let x = 0;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const widths = [1, 2, 1, 3, 1, 2, 2, 1, 3, 1];
    for (let j = 0; j < 5; j++) {
      const w = widths[(code + j * 7) % 10] + 1;
      bars.push({ x, w, black: j % 2 === 0 });
      x += w;
    }
  }
  return (
    <svg
      width="100%"
      height="44"
      viewBox={`0 0 ${x} 44`}
      preserveAspectRatio="none"
      className="w-full"
    >
      {bars.map((b, i) =>
        b.black ? (
          <rect key={i} x={b.x} y={0} width={b.w} height={34} fill="#111" />
        ) : null
      )}
      <text
        x={x / 2}
        y={43}
        textAnchor="middle"
        fontSize="8"
        fontFamily="monospace"
        fill="#111"
        letterSpacing="1"
      >
        {value}
      </text>
    </svg>
  );
}

/* ========== FRONT ========== */
export const IdCardFront = forwardRef<HTMLDivElement, IdCardDisplayProps>(
  (props, ref) => {
    const { card, lang, schoolName, schoolNameKm } = props;
    const teacher = card.teacher;
    const name = teacher?.full_name_kh ?? teacher?.full_name_en ?? '—';
    const rawPosition = teacher?.position ?? null;
    const teachingClass = teacher?.teaching_class ?? null;
    const displayPosition = rawPosition ?? (lang === 'km' ? 'គ្រូបង្រៀន' : 'Teacher');
    const gender =
      teacher?.gender === 'female'
        ? lang === 'km' ? 'ស្រី' : 'Female'
        : lang === 'km' ? 'ប្រុស' : 'Male';
    const statusColor = STATUS_COLORS[card.status] ?? '#6b7280';
    const statusLabel = STATUS_LABELS[card.status]?.[lang] ?? card.status;
    const verifyUrl = `${window.location.origin}/?qr=${card.qr_code ?? ''}`;
    const sName = lang === 'km'
      ? (schoolNameKm ?? 'សាលាបឋមសិក្សាសុវណ្ណគីរី ខេត្តបាត់ដំបង')
      : (schoolName ?? 'SovannKiri Primary School, Battambang');

    return (
      <div
        ref={ref}
        className="id-card-physical"
        style={{
          width: '300px',
          minHeight: '460px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          background: '#fff',
          fontFamily: "'Noto Sans Khmer', 'Khmer OS', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          border: '1.5px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #502D55 0%, #7a3f61 60%, #935073 100%)',
            padding: '14px 12px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Logo circle */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '4px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9l11 6 11-6-11-6z" fill="white" opacity="0.9"/>
              <path d="M1 9v6l11 6 11-6V9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
              <path d="M7 12v5l5 3 5-3v-5" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.3)"/>
            </svg>
          </div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '12px', textAlign: 'center', lineHeight: 1.3, margin: 0 }}>
            {sName}
          </p>
          <div style={{ width: '60px', height: '1.5px', background: 'rgba(255,255,255,0.4)', margin: '2px 0' }} />
          <p style={{
            color: 'rgba(255,255,255,0.9)', fontSize: '9px', fontWeight: 600,
            letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0,
          }}>
            {lang === 'km' ? 'ប័ណ្ណសម្គាល់បុគ្គលិក' : 'STAFF IDENTITY CARD'}
          </p>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '14px 16px 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Photo + Name block */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {/* Photo */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                width: '88px', height: '108px',
                border: '2.5px solid #502D55',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#f3f4f6',
              }}>
                {card.photo_url ? (
                  <img src={card.photo_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#9ca3af"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                )}
              </div>
              {/* Status badge under photo */}
              <div style={{
                marginTop: '4px',
                background: statusColor,
                borderRadius: '4px',
                padding: '2px 6px',
                textAlign: 'center',
              }}>
                <span style={{ color: 'white', fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingTop: '2px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 2px', lineHeight: 1.3 }}>
                {name}
              </p>
              <p style={{ fontSize: '10px', color: '#502D55', fontWeight: 600, margin: '0 0 4px' }}>
                {displayPosition}
              </p>
              {teachingClass && (
                <p style={{ fontSize: '9px', color: '#7a3f61', fontWeight: 500, margin: '0 0 6px' }}>
                  {lang === 'km' ? 'ថ្នាក់ដែលបង្រៀន' : 'Class'}: {teachingClass}
                </p>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
                <tbody>
                  {[
                    [lang === 'km' ? 'ភេទ' : 'Gender', gender],
                    [lang === 'km' ? 'លេខកូដ' : 'Code', teacher?.teacher_code ?? '—'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ color: '#6b7280', paddingBottom: '3px', paddingRight: '4px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                        {label}:
                      </td>
                      <td style={{ color: '#111827', fontWeight: 500, paddingBottom: '3px', wordBreak: 'break-word' }}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee ID strip */}
          <div style={{
            background: '#fdf6ff',
            border: '1px solid #f0d9f2',
            borderRadius: '6px',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '9px', color: '#502D55', fontWeight: 600 }}>
              {lang === 'km' ? 'លេខបុគ្គលិក' : 'EMPLOYEE ID'}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#3a1f3e', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {card.employee_id ?? '—'}
            </span>
          </div>

          {/* Email strip */}
          {teacher?.email && (
            <div style={{
              background: '#f0f7ff',
              border: '1px solid #d0e0f0',
              borderRadius: '6px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 600, flexShrink: 0 }}>
                {lang === 'km' ? 'អ៊ីមែល' : 'Email'}:
              </span>
              <span style={{ fontSize: '9px', color: '#1e40af', fontWeight: 500, wordBreak: 'break-all' }}>
                {teacher.email}
              </span>
            </div>
          )}

          {/* Signature + Stamp row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: '48px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '32px',
                borderBottom: '1px solid #374151',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '2px',
              }}>
                <span style={{ fontSize: '8px', color: '#6b7280', fontStyle: 'italic' }}>
                  {lang === 'km' ? 'ហត្ថលេខានាយក' : 'Principal Signature'}
                </span>
              </div>
            </div>
            {/* Round stamp */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              border: '2px dashed #dc2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.6,
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '1px solid #dc2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '7px', color: '#dc2626', textAlign: 'center', fontWeight: 700, lineHeight: 1.2 }}>
                  {lang === 'km' ? 'ត្រា' : 'SEAL'}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: '#374151' }}>
            <span><span style={{ color: '#6b7280' }}>{lang === 'km' ? 'ចេញ:' : 'Issue:'}</span> <strong>{card.issue_date ?? '—'}</strong></span>
            {card.expiry_date && (
              <span><span style={{ color: '#6b7280' }}>{lang === 'km' ? 'ផុត:' : 'Exp:'}</span> <strong>{card.expiry_date}</strong></span>
            )}
          </div>
        </div>

        {/* Footer: Barcode */}
        <div style={{
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '8px 12px 4px',
        }}>
          <BarcodeSVG value={card.card_number ?? card.employee_id ?? 'SK-ID'} />
        </div>

        {/* QR below barcode */}
        <div style={{
          background: '#f9fafb',
          padding: '6px 12px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderTop: '1px solid #e5e7eb',
        }}>
          <div style={{ background: 'white', padding: '3px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <QRCodeSVG value={verifyUrl} size={44} level="M" />
          </div>
          <div>
            <p style={{ fontSize: '8px', color: '#6b7280', margin: 0 }}>
              {lang === 'km' ? 'ស្កេន QR ដើម្បីផ្ទៀងផ្ទាត់' : 'Scan to Verify'}
            </p>
            <p style={{ fontSize: '8px', fontFamily: 'monospace', color: '#374151', fontWeight: 600, margin: '2px 0 0' }}>
              {card.card_number ?? '—'}
            </p>
          </div>
        </div>
      </div>
    );
  }
);
IdCardFront.displayName = 'IdCardFront';

/* ========== BACK ========== */
export const IdCardBack = forwardRef<HTMLDivElement, IdCardDisplayProps>(
  (props, ref) => {
    const { card, lang, schoolName, schoolNameKm, schoolAddress } = props;
    const sName = lang === 'km'
      ? (schoolNameKm ?? 'សាលាបឋមសិក្សាសុវណ្ណគីរី ខេត្តបាត់ដំបង')
      : (schoolName ?? 'SovannKiri Primary School, Battambang');
    const verifyUrl = `${window.location.origin}/?qr=${card.qr_code ?? ''}`;

    return (
      <div
        ref={ref}
        style={{
          width: '300px',
          minHeight: '460px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          background: '#fff',
          fontFamily: "'Noto Sans Khmer', 'Khmer OS', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          border: '1.5px solid #e2e8f0',
        }}
      >
        {/* Top band */}
        <div style={{ height: '12px', background: 'linear-gradient(135deg, #502D55, #935073)' }} />

        {/* School name */}
        <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#502D55', margin: 0 }}>{sName}</p>
        </div>

        {/* Contact info */}
        <div style={{ padding: '12px 16px', flex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#374151', marginBottom: '8px', letterSpacing: '0.5px' }}>
            {lang === 'km' ? 'ព័ត៌មានទំនាក់ទំនង' : 'CONTACT INFORMATION'}
          </p>
          {[
            { icon: '📍', label: schoolAddress ?? (lang === 'km' ? 'ខេត្តបាត់ដំបង ប្រទេសកម្ពុជា' : 'Battambang Province, Cambodia') },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
              <span style={{ fontSize: '9.5px', color: '#374151' }}>{item.label}</span>
            </div>
          ))}

          {/* QR Verify */}
          <div style={{
            marginTop: '10px',
            background: '#fdf6ff',
            borderRadius: '8px',
            padding: '10px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}>
            <div style={{ background: 'white', padding: '3px', borderRadius: '4px', border: '1px solid #f0d9f2' }}>
              <QRCodeSVG value={verifyUrl} size={56} level="H" />
            </div>
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#502D55', margin: '0 0 3px' }}>
                {lang === 'km' ? 'ផ្ទៀងផ្ទាត់ប័ណ្ណ' : 'VERIFY CARD'}
              </p>
              <p style={{ fontSize: '8px', color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                {lang === 'km'
                  ? 'ស្កេន QR ដើម្បីផ្ទៀងផ្ទាត់ អត្តសញ្ញាណបុគ្គលិក'
                  : 'Scan QR code to verify staff identity'}
              </p>
            </div>
          </div>

          {/* Terms */}
          <div style={{ marginTop: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '8px 10px' }}>
            <p style={{ fontSize: '8.5px', fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>
              {lang === 'km' ? 'លក្ខខណ្ឌ' : 'TERMS & CONDITIONS'}
            </p>
            <p style={{ fontSize: '8px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
              {lang === 'km'
                ? 'ប័ណ្ណនេះជាកម្មសិទ្ធិរបស់សាលា។ ប្រើប្រាស់ ជំនួស មិនត្រូវផ្ទេរ។ បើបាត់ ត្រូវជូន ដំណឹងភ្លាមៗ។'
                : 'This card is property of the school. Not transferable. Report loss immediately.'}
            </p>
          </div>
        </div>

        {/* Bottom band */}
        <div style={{ height: '12px', background: 'linear-gradient(135deg, #502D55, #935073)' }} />
      </div>
    );
  }
);
IdCardBack.displayName = 'IdCardBack';

/* ========== COMBINED ========== */
export const IdCardDisplay = forwardRef<HTMLDivElement, IdCardDisplayProps>(
  (props, ref) => {
    const { side = 'both' } = props;
    if (side === 'front') return <IdCardFront ref={ref} {...props} />;
    if (side === 'back') return <IdCardBack ref={ref} {...props} />;
    return (
      <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <IdCardFront {...props} />
        <IdCardBack {...props} />
      </div>
    );
  }
);
IdCardDisplay.displayName = 'IdCardDisplay';
