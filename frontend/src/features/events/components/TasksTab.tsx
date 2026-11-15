import { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '../tasksApi';
interface Props {
  eventId: number;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function TasksTab({ eventId }: Props) {
  const [title, setTitle] = useState('');
  const {
    data: tasks = [],
} = useGetTasksQuery(eventId);

const [createTask] = useCreateTaskMutation();
const [updateTask] = useUpdateTaskMutation();
const [deleteTask] = useDeleteTaskMutation();

  const handleAdd = async () => {
    if(!title.trim()) return;
    try {
        await createTask({ eventId, title: title.trim() }).unwrap()
        setTitle('');
    } catch(err) {console.log(err)}
};

const handleToggle = async (task: Task) => {
    try {
        await updateTask({ eventId, taskId: task.id, completed: !task.completed }).unwrap()
    } catch(err) { console.log(err) }
};

const handleDelete = async (taskId: number) => {
    try {
        await deleteTask({  eventId, taskId }).unwrap()
    } catch(err) { console.log(err) }
};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#351018]">Event Tasks</h2>
        <p className="mt-1 text-sm text-[#351018]/60">
          Keep track of everything you need to prepare.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none focus:border-[#351018]"
        />

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm text-white"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-[#351018]/50">
            No tasks yet.
          </p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-xl border border-[#351018]/10 p-4"
          >
            <button
                onClick={() => handleToggle(task)}
              className="flex items-center gap-3 text-left"
            >
              <CheckCircle2
                size={21}
                className={
                  task.completed
                    ? 'text-green-600'
                    : 'text-[#351018]/30'
                }
              />
              <span
                className={
                  task.completed
                    ? 'text-[#351018]/40 line-through'
                    : 'text-[#351018]'
                }
              >
                {task.title}
              </span>
            </button>

            <button
              onClick={() => handleDelete(task.id)}
              className="text-[#351018]/50 hover:text-red-600"
              aria-label="Delete task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}