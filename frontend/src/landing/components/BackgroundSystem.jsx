export default function BackgroundSystem() {
  return (
    <div className="iris-bg" aria-hidden="true" data-hero="bg">
      <div className="absolute inset-0 bg-[#050816]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_70%_10%,rgba(99,102,241,0.16),transparent_55%),radial-gradient(700px_400px_at_10%_30%,rgba(34,211,238,0.08),transparent_50%)]" />
      <div className="iris-bg-grid" data-hero="grid" />
      <div className="iris-blob iris-blob-a" />
      <div className="iris-blob iris-blob-b" />
      <div className="iris-blob iris-blob-c" />
      <svg className="iris-bg-roads" viewBox="0 0 1400 900" preserveAspectRatio="none">
        <path d="M0 220 C 220 180, 380 340, 620 300 S 980 140, 1400 210" stroke="rgba(34,211,238,0.25)" strokeWidth="1" fill="none" />
        <path d="M0 480 C 260 520, 420 360, 700 410 S 1100 620, 1400 540" stroke="rgba(99,102,241,0.22)" strokeWidth="1" fill="none" />
        <path d="M180 0 C 240 220, 160 480, 280 900" stroke="rgba(59,130,246,0.18)" strokeWidth="1" fill="none" />
      </svg>
      <div className="iris-bg-noise" />
    </div>
  );
}
