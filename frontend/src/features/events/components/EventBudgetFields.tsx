import { Wallet } from 'lucide-react';
import { currencies, currencyCode, type CurrencyCode } from '../currency';

export default function EventBudgetFields({ budget, currency, setBudget, setCurrency, inputClass, labelClass }: {
  budget: number;
  currency: CurrencyCode;
  setBudget: (value: number) => void;
  setCurrency: (value: CurrencyCode) => void;
  inputClass: string;
  labelClass: string;
}) {
  return (
    <>
      <div>
        <label htmlFor="event-budget" className={labelClass}>
          <span className="flex items-center gap-2"><Wallet size={16} />Total Budget ({currency})</span>
        </label>
        <input id="event-budget" type="number" min="0" step="0.01" className={inputClass}
          value={budget} onChange={event => setBudget(Number(event.target.value))} />
      </div>
      <div>
        <label htmlFor="event-currency" className={labelClass}>Currency</label>
        <select id="event-currency" className={inputClass} value={currency}
          onChange={event => setCurrency(currencyCode(event.target.value))}>
          {currencies.map(item => <option key={item.code} value={item.code}>{item.code} — {item.name}</option>)}
        </select>
      </div>
    </>
  );
}
