import { useState, type FormEvent } from "react";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export function TodoList({ initial = [] }: { initial?: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initial);
  const [draft, setDraft] = useState("");

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setTodos(ts => [...ts, { id: Date.now(), text: draft, done: false }]);
    setDraft("");
  };

  const toggle = (id: number) =>
    setTodos(ts => ts.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <form onSubmit={add} className="todo-list">
      <input value={draft} onChange={e => setDraft(e.target.value)} aria-label="New todo" />
      <ul>
        {todos.map(todo => (
          <li key={todo.id} data-done={todo.done} onClick={() => toggle(todo.id)}>
            {todo.done ? <s>{todo.text}</s> : todo.text}
          </li>
        ))}
      </ul>
      <p>{todos.filter(t => !t.done).length} left &mdash; keep going</p>
    </form>
  );
}
