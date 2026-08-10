import { useState, type FormEvent } from 'react';
import { CheckIcon, PlayIcon, PlusIcon, TrashIcon } from './Icons';
import { cleanText } from '../../shared/format';
import type { TaskItem } from '../../shared/types';

interface TasksScreenProps {
  tasks: TaskItem[];
  activeTaskId: string | null;
  onAdd: (draft: { title: string; notes: string; estimatedPomodoros: number }) => void;
  onToggleDone: (id: string) => void;
  onRemove: (id: string) => void;
  onFocus: (task: TaskItem) => void;
}

export function TasksScreen({
  tasks,
  activeTaskId,
  onAdd,
  onToggleDone,
  onRemove,
  onFocus,
}: TasksScreenProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [estimate, setEstimate] = useState(1);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const clean = cleanText(title, 80);
    if (!clean) return;
    onAdd({ title: clean, notes: cleanText(notes), estimatedPomodoros: estimate });
    setTitle('');
    setNotes('');
    setEstimate(1);
  };

  const pending = tasks.filter((task) => !task.done);
  const done = tasks.filter((task) => task.done);

  return (
    <div className="screen screen--scroll">
      <h2 className="screen__title">Tarefas</h2>

      <form className="card taskform" onSubmit={submit}>
        <input
          className="input"
          value={title}
          maxLength={80}
          placeholder="Nome da tarefa"
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          className="input input--area"
          value={notes}
          maxLength={400}
          rows={2}
          placeholder="Descrição (opcional)"
          onChange={(event) => setNotes(event.target.value)}
        />
        <div className="taskform__row">
          <label className="taskform__estimate">
            Pomodoros previstos
            <input
              type="number"
              min={1}
              max={24}
              value={estimate}
              onChange={(event) => setEstimate(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={!title.trim()}>
            <PlusIcon width={16} height={16} />
            Adicionar
          </button>
        </div>
      </form>

      {pending.length === 0 && done.length === 0 && (
        <p className="empty">Nenhuma tarefa ainda. Planeje o dia em blocos de 25 minutos.</p>
      )}

      <ul className="tasklist">
        {pending.map((task) => (
          <li key={task.id} className={`taskitem ${activeTaskId === task.id ? 'is-active' : ''}`}>
            <button
              type="button"
              className="taskitem__check"
              onClick={() => onToggleDone(task.id)}
              title="Concluir tarefa"
            >
              <CheckIcon width={14} height={14} />
            </button>
            <div className="taskitem__body">
              <p className="taskitem__title">{task.title}</p>
              {task.notes && <p className="taskitem__notes">{task.notes}</p>}
              <p className="taskitem__meta">
                {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
              </p>
            </div>
            <div className="taskitem__actions">
              <button
                type="button"
                className="iconbtn"
                onClick={() => onFocus(task)}
                title="Focar nesta tarefa"
              >
                <PlayIcon width={14} height={14} />
              </button>
              <button
                type="button"
                className="iconbtn iconbtn--danger"
                onClick={() => onRemove(task.id)}
                title="Remover"
              >
                <TrashIcon width={14} height={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <>
          <h3 className="screen__subtitle">Concluídas</h3>
          <ul className="tasklist tasklist--done">
            {done.map((task) => (
              <li key={task.id} className="taskitem is-done">
                <button
                  type="button"
                  className="taskitem__check is-checked"
                  onClick={() => onToggleDone(task.id)}
                  title="Reabrir tarefa"
                >
                  <CheckIcon width={14} height={14} />
                </button>
                <div className="taskitem__body">
                  <p className="taskitem__title">{task.title}</p>
                  <p className="taskitem__meta">{task.completedPomodoros} pomodoros</p>
                </div>
                <button
                  type="button"
                  className="iconbtn iconbtn--danger"
                  onClick={() => onRemove(task.id)}
                  title="Remover"
                >
                  <TrashIcon width={14} height={14} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
