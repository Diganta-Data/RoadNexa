import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsApi';
import { healthService } from '../services/api';
import { DEMO_STATS } from './config';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

export function useIsDesktop(minWidth = 1024) {
  const [desktop, setDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= minWidth;
  });

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [minWidth]);

  return desktop;
}

export function useFinePointer() {
  const [fine, setFine] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return fine;
}

export function useDemoStats() {
  const [stats, setStats] = useState({ ...DEMO_STATS, source: 'demo' });

  useEffect(() => {
    let active = true;
    analyticsService.getKPIs()
      .then((kpi) => {
        if (!active || !kpi) return;
        const hasValues = [kpi.total_accidents, kpi.average_risk_score, kpi.total_roads]
          .some((value) => value !== undefined && value !== null);
        if (!hasValues) return;
        setStats((current) => ({
          ...current,
          accidents: kpi.total_accidents ?? current.accidents,
          riskScore: Math.round(kpi.average_risk_score ?? current.riskScore),
          roads: kpi.total_roads ?? current.roads,
          potholes: kpi.total_potholes ?? current.potholes,
          fatal: kpi.fatal_accidents ?? current.fatal,
          source: 'live',
        }));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return stats;
}

export function useSystemHealth() {
  const [health, setHealth] = useState({
    api: 'checking',
    database: 'checking',
    postgis: 'checking',
    demo: 'available',
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      healthService.checkHealth().catch(() => ({ status: 'error' })),
      healthService.checkDbHealth().catch(() => ({ database: 'error' })),
    ]).then(([app, db]) => {
      if (!active) return;
      const apiOk = app?.status === 'healthy' || app?.status === 'ok';
      const dbValue = db?.database || 'error';
      const dbOk = dbValue === 'connected' || dbValue === 'healthy' || dbValue === 'ok';
      setHealth({
        api: apiOk ? 'operational' : 'degraded',
        database: dbOk ? 'connected' : 'degraded',
        postgis: dbOk ? 'available' : 'unknown',
        demo: 'available',
      });
    });
    return () => { active = false; };
  }, []);

  return health;
}
