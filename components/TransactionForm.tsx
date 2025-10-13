// frontend/components/TransactionForm.tsx
import { useState } from "react";
import axios from "axios";

type Props = {
  onAdded: () => void;
};

export default function TransactionForm({ onAdded }: Props) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const add = async () => {
    if (!category || !amount) {
      alert("カテゴリと金額は必須です");
      return;
    }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transactions`, {
        category,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        note
      }, { withCredentials: true });
      setCategory(""); setAmount(""); setNote("");
      onAdded();
    } catch (err: any) {
      alert(err.response?.data?.detail || "追加失敗");
    }
  };

  return (
    <div style={{ marginBottom: 20, padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
      <h3>支出を追加</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input placeholder="カテゴリ" value={category} onChange={e => setCategory(e.target.value)} />
        <input placeholder="金額" value={amount} onChange={e => setAmount(Number(e.target.value) || "")} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="メモ" value={note} onChange={e => setNote(e.target.value)} style={{ width: "100%" }} />
      </div>
      <button onClick={add}>登録</button>
    </div>
  );
}
