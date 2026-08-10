import { useMemo, useState } from 'react';
import { CheckIcon, EditIcon, TrashIcon } from './Icons';
import { PHASE_LABEL } from '../../shared/constants';
import { dayKey, formatDayLabel, formatDuration, formatTime } from '../../shared/format';
import { recentSessions } from '../../shared/stats';
import type { SessionRecord } from '../../shared/types';

interface HistoryScreenProps {
  sessions: SessionRecord[];
  onUpdate: (id: string, patch: { title: string; notes: string }) => void;
  onRemove: (id: string) => void;
}

const OUTCOME_LABEL: Record<SessionRecord['outcome'], string> = {
  completed: 'Concluída',
  skipped: 'Pulada',
  abandoned: 'Interrompida',
};

export function HistoryScreen({ sessions, onUpdate, onRemove }: HistoryScreenProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', notes: '' });

  const grouped = useMemo(() => {
    const list = recentSessions(sessions, 60);
    const groups = new Map<string, SessionRecord[]>();
    for (const session of list) {
      const key = dayKey(session.startedAt);
      const bucket = groups.get(key) ?? [];
      bucket.push(session);
      groups.set(key, bucket);
    }
    return [...groups.entries()];
  }, [sessions]);

  const startEdit = (session: SessionRecord) => {
    setEditing(session.id);
    setDraft({ title: session.title, notes: session.notes });
  };

  const commit = (id: string) => {
    onUpdate(id, { title: draft.title.trim(), notes: draft.notes.trim() });
    setEditing(null);
  };

  return (
    <div className="screen screen--scroll">
      <h2 className="screen__title">Histórico</h2>

      {grouped.length === 0 && (
        <p className="empty">Ainda não há sessões registradas. Comece o primeiro pomodoro.</p>
      )}

      {grouped.map(([key, list]) => {
        const focusSeconds = list
          .filter((s) => s.kind === 'focus')
          .reduce((sum, s) => sum + s.actualSeconds, 0);
        return (
          <section key={key} className="daygroup">
            <header className="daygroup__head">
              <h3>{formatDayLabel(list[0].startedAt)}</h3>
              <span>{formatDuration(focusSeconds)}</span>
            </header>
            <ul className="sessionlist">
              {list.map((session) => (
                <li key={session.id} className={`sessionitem sessionitem--${session.kind}`}>
                  <div className="sessionitem__time">
                    <span>{formatTime(session.startedAt)}</span>
                    <span className="sessionitem__dur">
                      {formatDuration(session.actualSeconds)}
                    </span>
                  </div>

                  {editing === session.id ? (
                    <div className="sessionitem__edit">
                      <input
                        className="input"
                        value={draft.title}
                        maxLength={80}
                        placeholder="Nome da sessão"
                        onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                      />
                      <textarea
                        className="input input--area"
                        value={draft.notes}
                        maxLength={400}
                        rows={2}
                        placeholder="Descrição"
                        onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn--primary btn--small"
                        onClick={() => commit(session.id)}
                      >
                        <CheckIcon width={14} height={14} />
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="sessionitem__body">
                      <p className="sessionitem__title">
                        {session.kind === 'focus'
                          ? session.title || 'Sessão sem nome'
                          : PHASE_LABEL[session.kind]}
                      </p>
                      {session.notes && <p className="sessionitem__notes">{session.notes}</p>}
                      {/* A completed session is the norm — only exceptions get a badge. */}
                      {session.outcome !== 'completed' && (
                        <span className={`badge badge--${session.outcome}`}>
                          {OUTCOME_LABEL[session.outcome]}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="sessionitem__actions">
                    {session.kind === 'focus' && editing !== session.id && (
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => startEdit(session)}
                        title="Editar nome e descrição"
                      >
                        <EditIcon width={14} height={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="iconbtn iconbtn--danger"
                      onClick={() => onRemove(session.id)}
                      title="Remover do histórico"
                    >
                      <TrashIcon width={14} height={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
