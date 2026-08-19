const ROADS = [
  'M 20 70 C 80 40, 140 110, 220 90 S 340 40, 420 80',
  'M 30 140 C 120 160, 180 90, 280 120 S 390 180, 470 150',
  'M 40 210 C 110 190, 170 240, 250 220 S 360 180, 460 230',
  'M 90 20 C 110 90, 100 170, 130 250',
  'M 200 16 C 190 90, 220 150, 210 260',
  'M 310 24 C 330 100, 300 170, 340 250',
  'M 60 110 L 180 125 L 250 80 L 360 110 L 430 70',
];

const NODES = [
  [92, 58, '#EF4444'],
  [214, 94, '#EF4444'],
  [318, 72, '#F59E0B'],
  [148, 148, '#EF4444'],
  [268, 126, '#F59E0B'],
  [402, 154, '#22C55E'],
  [188, 214, '#EF4444'],
  [340, 222, '#F59E0B'],
];

export default function RoadNetwork({ className = '', animate = true }) {
  return (
    <svg className={className} viewBox="0 0 480 280" fill="none" aria-hidden="true">
      {ROADS.map((d, index) => (
        <path
          key={d}
          d={d}
          stroke={index < 3 ? '#22D3EE' : '#3B82F6'}
          strokeWidth={index < 3 ? 1.4 : 1}
          opacity="0.85"
          className={animate ? 'iris-road-draw' : ''}
        />
      ))}
      {NODES.map(([x, y, color], index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="10" fill={color} opacity="0.12">
            {animate && (
              <animate attributeName="r" values="8;14;8" dur={`${2 + index * 0.15}s`} repeatCount="indefinite" />
            )}
          </circle>
          <circle cx={x} cy={y} r="3" fill={color} />
        </g>
      ))}
    </svg>
  );
}
