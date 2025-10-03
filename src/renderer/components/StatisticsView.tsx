import type { Statistics } from '@shared/types';

interface StatisticsViewProps {
  statistics: Statistics | null;
  isLoading: boolean;
}

export function StatisticsView({ statistics, isLoading }: StatisticsViewProps) {
  if (isLoading) {
    return <div className="statistics-view">Carregando estatísticas...</div>;
  }

  if (!statistics) {
    return <div className="statistics-view">Nenhuma estatística disponível.</div>;
  }

  return (
    <div className="statistics-view">
      <h2>📊 Estatísticas</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Hoje</div>
          <div className="stat-value">{statistics.todayFocusMinutes} min</div>
          <div className="stat-sublabel">{statistics.todaySessionsCompleted} sessões</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Esta Semana</div>
          <div className="stat-value">{statistics.weekFocusMinutes} min</div>
          <div className="stat-sublabel">{statistics.weekSessionsCompleted} sessões</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Sequência Atual</div>
          <div className="stat-value">{statistics.currentStreak} dias</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Melhor Sequência</div>
          <div className="stat-value">{statistics.longestStreak} dias</div>
        </div>
      </div>
    </div>
  );
}
