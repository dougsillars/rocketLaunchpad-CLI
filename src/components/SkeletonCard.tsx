const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
`;

function SkeletonLine({ width, height = 14 }: { width: string; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: 'linear-gradient(90deg, #2a2a4a 25%, #3a3a5a 50%, #2a2a4a 75%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: 12,
          padding: '1.25rem',
          border: '1px solid #2a2a4a',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonLine width="60px" height={22} />
          <SkeletonLine width="80px" />
        </div>
        <SkeletonLine width="85%" height={20} />
        <SkeletonLine width="70%" />
        <SkeletonLine width="60%" />
        <SkeletonLine width="75%" />
        <SkeletonLine width="90%" />
        <SkeletonLine width="65%" />
      </div>
    </>
  );
}
