import { useMemo } from 'react';
import { FlameIcon, TargetIcon, TimerIcon } from './Icons';
import { formatDuration } from '../../shared/format';
import { dailySeries, summarize, topTopics } from '../../shared/stats';
import type { SessionRecord } from '../../shared/types';

interface StatsScreenProps {
  sessions: SessionRecord[];
  dailyGoal: number;
}

const WEEKDAY = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function StatsScreen({ sessions, dailyGoal }: StatsScreenProps) {
  const summary = useMemo(() => summarize(sessions), [sessions]);
  const series = useMemo(() => dailySeries(sessions, 14), [sessions]);
  const topics = useMemo(() => topTopics(sessions, 6), [sessions]);
  const peak = Math.max(dailyGoal, ...series.map((day) => day.count), 1);

  return (
    <div className="screen screen--scroll">
      <h2 className="screen__title">Estatísticas</h2>

      <div className="statgrid">
        <article className="card stat">
          <TimerIcon width={16} height={16} />
          <strong>{summary.todayCount}</strong>
          <span>pomodoros hoje</span>
        </article>
        <article className="card stat">
          <TargetIcon width={16} height={16} />
          <strong>{formatDuration(summary.weekSeconds)}</strong>
          <span>foco nos 7 dias</span>
        </article>
        <article className="card stat">
          <FlameIcon width={16} height={16} />
          <strong>{summary.streak}</strong>
          <span>dias seguidos</span>
        </article>
        <article className="card stat">
          <TimerIcon width={16} height={16} />
          <strong>{summary.totalCount}</strong>
          <span>no total</span>
        </article>
      </div>

      <section className="card">
        <h3 className="card__title">Últimos 14 dias</h3>
        <div className="chart">
          {series.map((day) => {
            const height = Math.round((day.count / peak) * 100);
            return (
              <div key={day.key} className="chart__col" title={`${day.count} pomodoros`}>
                <div className="chart__bar-wrap">
                  <span
                    className={`chart__bar ${day.count >= dailyGoal ? 'is-goal' : ''}`}
                    style={{ height: `${Math.max(day.count > 0 ? 6 : 2, height)}%` }}
                  />
                </div>
                <span className="chart__label">{WEEKDAY[day.date.getDay()]}</span>
              </div>
            );
          })}
        </div>
        <p className="chart__foot">
          Média por dia ativo: <strong>{formatDuration(summary.averageSeconds)}</strong> · Melhor
          dia: <strong>{summary.bestDayCount}</strong> pomodoros
        </p>
      </section>

      <section className="card">
        <h3 className="card__title">Onde foi seu foco</h3>
        {topics.length === 0 ? (
          <p className="empty empty--inline">Nomeie suas sessões para ver este resumo.</p>
        ) : (
          <ul className="topics">
            {topics.map((topic) => {
              const ratio = summary.totalSeconds > 0 ? topic.seconds / summary.totalSeconds : 0;
              return (
                <li key={topic.title} className="topic">
                  <div className="topic__head">
                    <span className="topic__name">{topic.title}</span>
                    <span className="topic__value">{formatDuration(topic.seconds)}</span>
                  </div>
                  <div className="topic__bar">
                    <span style={{ width: `${Math.max(3, ratio * 100)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
