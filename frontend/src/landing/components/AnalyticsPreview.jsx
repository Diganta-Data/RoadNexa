import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { SectionHeading } from './ui';

const LINE = [
  { m: 'Jan', v: 42 }, { m: 'Feb', v: 38 }, { m: 'Mar', v: 51 },
  { m: 'Apr', v: 47 }, { m: 'May', v: 63 }, { m: 'Jun', v: 58 },
];
const BARS = [
  { city: 'Delhi', v: 81 },
  { city: 'Mumbai', v: 78 },
  { city: 'Bengaluru', v: 72 },
  { city: 'Kolkata', v: 69 },
];
const ROADS = [
  { name: 'NH-48', risk: 91 },
  { name: 'SV Road', risk: 84 },
  { name: 'ORR', risk: 77 },
  { name: 'Anna Salai', risk: 71 },
];

const tooltip = { background: '#070B1A', border: '1px solid rgba(148,163,184,0.2)', color: '#F8FAFC' };

export default function AnalyticsPreview() {
  return (
    <section className="iris-section iris-section-violet">
      <div className="iris-wrap">
        <SectionHeading
          kicker="12 / Analytics"
          title="Operational charts,"
          highlight="not vanity graphs."
          demo="Interactive Demo"
        />
        <div className="grid md:grid-cols-2 gap-6">
          <ChartFrame title="Monthly accident trend">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={LINE}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="m" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={tooltip} />
                <Line type="monotone" dataKey="v" stroke="#22D3EE" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
          <ChartFrame title="City risk comparison">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={BARS}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="city" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={tooltip} />
                <Bar dataKey="v">
                  {BARS.map((entry) => (
                    <Cell key={entry.city} fill={entry.v > 75 ? '#EF4444' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
          <ChartFrame title="Corridor heatmap">
            <div className="grid grid-cols-12 gap-1 h-[220px]">
              {Array.from({ length: 84 }).map((_, index) => (
                <span
                  key={index}
                  className="block"
                  style={{ background: `hsla(${200 - (index % 17) * 8}, 80%, 55%, ${0.15 + (index % 7) * 0.1})` }}
                />
              ))}
            </div>
          </ChartFrame>
          <ChartFrame title="Road ranking">
            <ul className="space-y-3">
              {ROADS.map((road) => (
                <li key={road.name} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>{road.name}</span>
                  <strong>{road.risk}</strong>
                </li>
              ))}
            </ul>
          </ChartFrame>
        </div>
      </div>
    </section>
  );
}

function ChartFrame({ title, children }) {
  return (
    <div className="border border-white/10 p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
