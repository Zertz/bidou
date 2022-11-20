import dayjs from "dayjs";

export function formatTransactionToSave<
  Transaction extends { amount: number; date: Date }
>(data: Transaction): Override<Transaction, { date: string }> {
  return {
    ...data,
    amount: Math.round(Number(`${data.amount}`.replace(",", ".")) * 100),
    date: dayjs(data.date).format(),
  };
}
