import { useEffect, useId, useState } from 'react';
import { EditIcon } from './Icons';
import type { TaskItem } from '../../shared/types';

interface SessionComposerProps {
  title: string;
  notes: string;
  taskId: string | null;
  tasks: TaskItem[];
  suggestions: string[];
  /** Breaks do not get a name — the composer becomes a quiet reminder. */
  readOnly: boolean;
  onChange: (meta: { title?: string; notes?: string; taskId?: string | null }) => void;
}

/**
 * Naming the session is the point of this app: every focus block carries a
 * title and, optionally, a description of what is actually being done.
 */
export function SessionComposer({
  title,
  notes,
  taskId,
  tasks,
  suggestions,
  readOnly,
  onChange,
}: SessionComposerProps) {
  const [expanded, setExpanded] = useState(notes.trim().length > 0);
  const listId = useId();
  const openTasks = tasks.filter((task) => !task.done);

  useEffect(() => {
    if (notes.trim().length > 0) setExpanded(true);
  }, [notes]);

  if (readOnly) {
    return (
      <section className="composer composer--rest">
        <p className="composer__rest-text">
          {title ? (
            <>
              Depois da pausa: <strong>{title}</strong>
            </>
          ) : (
            'Aproveite a pausa. O foco volta depois.'
          )}
        </p>
      </section>
    );
  }

  const linkTask = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) {
      onChange({ taskId: null });
      return;
    }
    onChange({ taskId: task.id, title: task.title, notes: task.notes || notes });
  };

  return (
    <section className="composer">
      <label className="composer__label" htmlFor={`${listId}-title`}>
        No que você está trabalhando?
      </label>
      <input
        id={`${listId}-title`}
        className="composer__title"
        list={`${listId}-suggestions`}
        value={title}
        maxLength={80}
        placeholder="Ex.: Revisar proposta do cliente"
        onChange={(event) => onChange({ title: event.target.value })}
        autoComplete="off"
        spellCheck={false}
      />
      <datalist id={`${listId}-suggestions`}>
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      {expanded ? (
        <textarea
          className="composer__notes"
          value={notes}
          maxLength={400}
          rows={2}
          placeholder="Descreva a sessão: objetivo, próximo passo, o que precisa ficar pronto…"
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      ) : (
        <button type="button" className="composer__toggle" onClick={() => setExpanded(true)}>
          <EditIcon width={14} height={14} />
          Descrever a sessão
        </button>
      )}

      {openTasks.length > 0 && (
        <div className="composer__tasks">
          <span className="composer__tasks-label">Tarefa:</span>
          <select
            className="composer__select"
            value={taskId ?? ''}
            onChange={(event) => linkTask(event.target.value)}
          >
            <option value="">Sem vínculo</option>
            {openTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}
