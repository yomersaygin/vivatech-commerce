type AdminFeedbackProps = {
  message: string;
  tone: 'success' | 'error';
};

export default function AdminFeedback({ message, tone }: AdminFeedbackProps) {
  if (!message) return null;

  return (
    <div
      className={tone === 'success' ? 'ok' : 'error'}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      {message}
    </div>
  );
}
