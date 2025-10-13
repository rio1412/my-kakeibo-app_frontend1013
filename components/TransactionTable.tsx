// frontend/components/TransactionTable.tsx
import axios from "axios";

type Tx = {
  id: number;
  user_id: number;
  category: string;
  amount: number;
  date: string;
  note?: string;
};

export default function TransactionTable({ txs, onDeleted }: { txs: Tx[], onDeleted: () => void }) {
  const del = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transactions/${id}`, { withCredentials: true });
      onDeleted();
    } catch (err: any) {
      alert(err.response?.data?.detail || "削除失敗");
    }
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ddd", padding: 6 }}>ID</th>
          <th style={{ border: "1px solid #ddd", padding: 6 }}>日付</th>
          <th style={{ border: "1px solid #ddd", padding: 6 }}>カテゴリ</th>
          <th style={{ border: "1px solid #ddd", padding: 6 }}>金額</th>
          <th style={{ border: "1px solid #ddd", padding: 6 }}>メモ</th>
          <th style={{ border: "1px solid #ddd", padding: 6 }}>操作</th>
        </tr>
      </thead>
      <tbody>
        {txs.map(tx => (
          <tr key={tx.id}>
            <td style={{ border: "1px solid #eee", padding: 6 }}>{tx.id}</td>
            <td style={{ border: "1px solid #eee", padding: 6 }}>{new Date(tx.date).toLocaleString()}</td>
            <td style={{ border: "1px solid #eee", padding: 6 }}>{tx.category}</td>
            <td style={{ border: "1px solid #eee", padding: 6 }}>¥{tx.amount}</td>
            <td style={{ border: "1px solid #eee", padding: 6 }}>{tx.note}</td>
            <td style={{ border: "1px solid #eee", padding: 6 }}><button onClick={() => del(tx.id)}>削除</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
