import { useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from '../expensesApi';
interface Props {
  eventId: number;
  budget: number;
}

export default function ExpensesTab({ eventId, budget }: Props) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [category, setCategory] = useState('');
    const {
        data: expenses = [],
    } = useGetExpensesQuery(eventId);

    const [createExpense] = useCreateExpenseMutation();
    const [deleteExpense] = useDeleteExpenseMutation();
    const spent = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const remaining = budget - spent;

    const handleAdd = async () => {
        setError('');
        if (!title.trim() || 
            !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
                setError('Enter a valid amount');
            return;
        }
        try {
            await createExpense({eventId, title: title.trim(), amount: Number(amount), category}).unwrap();
            setTitle('');
            setAmount('');
            setCategory('');
        } catch(err) {
            console.log(err);
        }
    };

    const handleDelete = async (expenseId: number) => {
         try {
            await deleteExpense({eventId, expenseId}).unwrap();
        } catch(err) {
            console.log(err);
            setError('Failed to add expense');
        }
    };

    return (
        <div className="space-y-6">
        <h2 className="text-xl font-semibold text-[#351018]">
            Budget & Expenses
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
            {[
            { label: 'Total Budget', value: budget },
            { label: 'Spent', value: spent },
            { label: 'Remaining', value: remaining },
            ].map((item) => (
            <div
                key={item.label}
                className="rounded-xl border border-[#351018]/10 p-5"
            >
                <Wallet size={20} className="mb-3 text-[#351018]" />
                <p className="text-xs text-[#351018]/50">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-[#351018]">
                {item.value.toLocaleString()} AMD
                </p>
            </div>
            ))}
            {remaining < 0 && (
            <p className="text-sm text-red-600">
                Budget exceeded by {Math.abs(remaining).toLocaleString()} AMD
            </p>
            )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_160px_auto]">
            <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Expense title"
            className="rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none"
            />

            <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none"
            />
            <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none"
            >
            <option value="">Select category</option>
            <option value="venue">Venue</option>
            <option value="catering">Catering</option>
            <option value="decoration">Decoration</option>
            <option value="photography">Photography</option>
            <option value="music">Music</option>
            <option value="other">Other</option>
            </select>

            <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#351018] px-5 py-3 text-sm text-white"
            >
            <Plus size={18} />
            Add
            </button>
            {error && (
  <p className="text-sm text-red-600">
    {error}
  </p>
)}
        </div>

        <div className="space-y-3">
            {expenses.length === 0 && (
            <p className="py-8 text-center text-sm text-[#351018]/50">
                No expenses yet.
            </p>
            )}

            {expenses.map((expense) => (
            <div
                key={expense.id}
                className="flex items-center justify-between rounded-xl border border-[#351018]/10 p-4"
            >
                <div>
                <p className="text-sm font-medium text-[#351018]">
                    {expense.title}
                </p>

                <p className="mt-1 text-xs capitalize text-[#351018]/50">
                    {expense.category}
                </p>
                </div>

                <div className="flex items-center gap-5">
                <span className="text-sm font-semibold text-[#351018]">
                    {Number(expense.amount).toLocaleString()} AMD
                </span>

                <button
                    onClick={() => handleDelete(expense.id)}
                    aria-label="Delete expense"
                >
                    <Trash2 size={18} className="text-[#351018]/50" />
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
    }