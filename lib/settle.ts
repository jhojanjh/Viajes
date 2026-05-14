// Calcula quién debe a quién con el mínimo de transacciones
export type Balance = { userId: string; amount: number };
export type Settlement = { from: string; to: string; amount: number };

export function settle(balances: Balance[]): Settlement[] {
  const out: Settlement[] = [];
  const debtors = balances.filter(b => b.amount < -0.01).map(b => ({ ...b })).sort((a, b) => a.amount - b.amount);
  const creditors = balances.filter(b => b.amount > 0.01).map(b => ({ ...b })).sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(-debtors[i].amount, creditors[j].amount);
    if (pay > 0.01) {
      out.push({ from: debtors[i].userId, to: creditors[j].userId, amount: Math.round(pay * 100) / 100 });
      debtors[i].amount += pay;
      creditors[j].amount -= pay;
    }
    if (Math.abs(debtors[i].amount) < 0.01) i++;
    if (Math.abs(creditors[j].amount) < 0.01) j++;
  }
  return out;
}

export function calculateBalances(
  expenses: { payerId: string; shares: { userId: string; amount: number }[]; amount: number }[],
  memberIds: string[]
): Balance[] {
  const map = new Map<string, number>(memberIds.map(id => [id, 0]));
  for (const e of expenses) {
    map.set(e.payerId, (map.get(e.payerId) ?? 0) + e.amount);
    for (const s of e.shares) {
      map.set(s.userId, (map.get(s.userId) ?? 0) - s.amount);
    }
  }
  return [...map.entries()].map(([userId, amount]) => ({ userId, amount: Math.round(amount * 100) / 100 }));
}
