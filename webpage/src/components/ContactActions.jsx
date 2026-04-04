import { MessageCircle, Phone } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/916264682508?text=Hello%20Crusherbook%2C%20I%20want%20a%20demo%20for%20crusher%20software.';
const CALL_URL = 'tel:+916264682508';

export default function ContactActions({
  align = 'center',
  compact = false,
  primaryLabel = 'Chat on WhatsApp',
  secondaryLabel = 'Call Now',
}) {
  const wrapperClass = align === 'left'
    ? 'flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3'
    : 'flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3';
  const sizeClass = compact ? 'px-4 py-3 text-sm' : 'px-5 py-3.5 text-sm sm:text-base';

  return (
    <div className={wrapperClass}>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-green-600 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-green-700 ${sizeClass}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{primaryLabel}</span>
      </a>
      <a
        href={CALL_URL}
        className={`inline-flex items-center justify-center gap-2 rounded-full border border-brand-orange bg-white font-semibold text-brand-orange transition hover:-translate-y-0.5 hover:bg-orange-50 ${sizeClass}`}
      >
        <Phone className="h-4 w-4" />
        <span>{secondaryLabel}</span>
      </a>
    </div>
  );
}
