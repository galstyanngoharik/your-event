import { api } from '../../services/api';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
}

export interface CreateExpensePayload {
  eventId: number;
  title: string;
  amount: number;
  category: string;
}

export interface DeleteExpensePayload {
  eventId: number;
  expenseId: number;
}

export const expensesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<Expense[], number>({
      query: (eventId) => `/events/${eventId}/expenses`,
      providesTags: ['Expenses'],
    }),

    createExpense: builder.mutation<Expense, CreateExpensePayload>({
      query: ({ eventId, title, amount, category }) => ({
        url: `events/${eventId}/expenses`,
        method: 'POST',
        body: { title, amount, category }
      }),
      invalidatesTags: ['Expenses'],
    }),

    deleteExpense: builder.mutation<void, DeleteExpensePayload>({
      query: ({ eventId, expenseId }) => ({
        // TODO 1: Գրիր URL-ը՝ eventId և expenseId օգտագործելով
        url: `events/${eventId}/expenses/${expenseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses'],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;