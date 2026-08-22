export function Skeleton({ className = '', variant = 'rect', width, height, animation = 'pulse' }) {
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const baseStyles = `
    bg-staff-200 rounded
    ${animations[animation]}
    ${className}
  `;

  const variants = {
    rect: `${baseStyles}`,
    circle: `${baseStyles} rounded-full`,
    text: `${baseStyles} h-4`,
    card: `${baseStyles}`,
    avatar: `${baseStyles} rounded-full`,
    button: `${baseStyles} rounded-lg`,
    input: `${baseStyles} rounded-lg`,
  };

  if (variant === 'card') {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-32 w-full rounded-lg bg-staff-200" />
        <div className="space-y-2 px-2">
          <div className="h-5 w-3/4 bg-staff-200 rounded" />
          <div className="h-4 w-1/2 bg-staff-200 rounded" />
          <div className="h-4 w-1/3 bg-staff-200 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'menu-item') {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-32 w-full rounded-lg bg-staff-200" />
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-staff-200 rounded" />
          <div className="h-4 w-1/2 bg-staff-200 rounded" />
          <div className="h-4 w-1/3 bg-staff-200 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'order-card') {
    return (
      <div className="animate-pulse space-y-3 p-4">
        <div className="flex justify-between">
          <div className="h-5 w-24 bg-staff-200 rounded" />
          <div className="h-5 w-20 bg-staff-200 rounded" />
        </div>
        <div className="h-4 w-full bg-staff-200 rounded" />
        <div className="h-4 w-3/4 bg-staff-200 rounded" />
      </div>
    );
  }

  if (variant === 'table-card') {
    return (
      <div className="animate-pulse space-y-3 p-4">
        <div className="flex justify-between">
          <div className="h-6 w-20 bg-staff-200 rounded" />
          <div className="h-5 w-16 bg-staff-200 rounded" />
        </div>
        <div className="h-4 w-24 bg-staff-200 rounded" />
      </div>
    );
  }

  return (
    <div
      style={{ width, height }}
      className={variants[variant] || variants.rect}
      aria-hidden="true"
    />
  );
}

export function SkeletonGrid({ count = 6, variant = 'menu-item', columns = 2, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

export function PageSkeleton({ variant = 'default' }) {
  if (variant === 'customer') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pulse">
        <div className="flex justify-between">
          <div className="h-8 w-48 bg-staff-200 rounded" />
          <div className="h-8 w-24 bg-staff-200 rounded" />
        </div>
        <div className="h-8 w-64 bg-staff-200 rounded" />
        <SkeletonGrid count={6} variant="menu-item" columns={2} />
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-staff-200" />
      </div>
    );
  }

  if (variant === 'staff') {
    return (
      <div className="p-6 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-staff-200 rounded" />
          <div className="h-10 w-24 bg-staff-200 rounded" />
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-staff-200 rounded-xl" />
          ))}
        </div>
        <SkeletonGrid count={5} variant="order-card" columns={1} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-staff-200 rounded" />
      <SkeletonGrid count={4} variant="card" columns={2} />
    </div>
  );
}