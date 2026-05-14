import { initials, colorFromId } from '@/lib/utils';

export function Avatar({
  user,
  size = 36,
}: {
  user: { id?: string; name?: string | null; image?: string | null };
  size?: number;
}) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name || ''}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        background: colorFromId(user.id || user.name || 'x'),
        fontSize: size * 0.38,
      }}
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 font-display"
    >
      {initials(user.name)}
    </div>
  );
}
