import { motion } from 'motion/react';
import { FileJson, FileSpreadsheet, FileText, Map } from 'lucide-react';
import { ROUTES } from '../config';
import { useDemoStats } from '../hooks';
import { IrisButton, SectionHeading } from './ui';

const FILES = [
  { label: 'CSV', icon: FileText },
  { label: 'XLSX', icon: FileSpreadsheet },
  { label: 'JSON', icon: FileJson },
  { label: 'GeoJSON', icon: Map },
];

const STEPS = ['UPLOAD', 'PROFILE', 'VALIDATE', 'MAP', 'ANALYZE', 'TRAIN'];

export default function UploadShowcase() {
  const stats = useDemoStats();

  return (
    <section id="upload" className="iris-section iris-section-green">
      <div className="iris-wrap">
        <SectionHeading
          kicker="08 / Bring data in"
          title="Bring Your Own Data."
          copy="Upload CSV, Excel, JSON or GeoJSON and turn it into road intelligence."
        />
        <div className="grid lg:grid-cols-[1fr_0.8fr] gap-10 items-center">
          <motion.div
            className="iris-upload-box"
            whileHover={{ borderColor: 'rgba(34,211,238,0.7)' }}
            data-cursor="button"
          >
            <div>
              <p className="text-2xl font-bold mb-2">Upload Dataset</p>
              <p className="text-[#94A3B8] mb-6">Drag a city file onto the pipeline.</p>
              <div className="flex justify-center gap-4">
                {FILES.map((file, index) => (
                  <motion.span
                    key={file.label}
                    className="grid place-items-center w-16 h-16 border border-white/10"
                    whileHover={{ y: -18 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <file.icon size={18} />
                    <small className="iris-mono text-[10px] mt-1">{file.label}</small>
                  </motion.span>
                ))}
              </div>
              <div className="mt-8">
                <IrisButton to={ROUTES.upload} icon="upload">Upload Dataset</IrisButton>
              </div>
            </div>
          </motion.div>
          <div>
            <div className="flex flex-wrap gap-2 mb-8">
              {STEPS.map((step, index) => (
                <span key={step} className="iris-mono text-[11px] text-[#22D3EE]">
                  {step}{index < STEPS.length - 1 ? ' → ' : ''}
                </span>
              ))}
            </div>
            <p className="iris-kicker"><i aria-hidden="true" />09 / Data quality engine</p>
            <DataQuality stats={stats} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DataQuality({ stats }) {
  const score = stats.qualityScore;
  return (
    <div className="iris-quality">
      <div className="relative w-[160px] h-[160px]">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" stroke="rgba(148,163,184,0.15)" strokeWidth="8" fill="none" />
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="#22C55E"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(score / 100) * 314} 314`}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-3xl font-extrabold">{score}</p>
            <p className="iris-mono text-[9px] text-[#94A3B8]">QUALITY</p>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-[#94A3B8]">Rows</dt><dd className="text-xl font-semibold">{stats.rows.toLocaleString()}</dd></div>
        <div><dt className="text-[#94A3B8]">Missing</dt><dd className="text-xl font-semibold">{stats.missing}%</dd></div>
        <div><dt className="text-[#94A3B8]">Invalid coordinates</dt><dd className="text-xl font-semibold">{stats.invalidCoords}%</dd></div>
        <div><dt className="text-[#94A3B8]">Duplicates</dt><dd className="text-xl font-semibold">{stats.duplicates}%</dd></div>
      </dl>
    </div>
  );
}
