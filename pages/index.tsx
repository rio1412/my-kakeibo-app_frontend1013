import { useEffect, useState } from "react";
import axios from "axios";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transactions`,
          { withCredentials: true } // ← ここ必須
        );
        setTransactions(res.data);
      } catch (err: any) {
        alert(err.response?.data?.detail || "取得失敗");
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "50px auto" }}>
      <h2>取引一覧</h2>
      <ul>
        {transactions.map((tx: any) => (
          <li key={tx.id}>
            {tx.date} — {tx.category} — {tx.amount}円
          </li>
        ))}
      </ul>
    </div>
  );
}
