// frontend/pages/transactions.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

type Tx = {
  id: number;
  user_id: number;
  category: string;
  amount: number;
  date: string;
  note?: string;
  type?: string; // 'income' or 'expense'
};

const EXPENSE_CATEGORIES = [
  { value: "食費", label: "食費 🍔", emoji: "🍔" },
  { value: "交通費", label: "交通費 🚌", emoji: "🚌" },
  { value: "光熱費", label: "光熱費 💡", emoji: "💡" },
  { value: "家賃", label: "家賃 🏠", emoji: "🏠" },
  { value: "遊び", label: "遊び 🎮", emoji: "🎮" },
  { value: "その他", label: "その他 📝", emoji: "📝" }
];

const INCOME_CATEGORIES = [
  { value: "給与", label: "給与 💰", emoji: "💰" },
  { value: "副業", label: "副業 💻", emoji: "💻" },
  { value: "ボーナス", label: "ボーナス 🎁", emoji: "🎁" },
  { value: "その他収入", label: "その他収入 ✨", emoji: "✨" }
];

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // 今日の日付をデフォルト設定
  const [note, setNote] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // リアルタイム時計
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transactions`, { withCredentials: true });
      // バックエンドがtypeをサポートしていない場合の暫定対応
      // カテゴリ名で収入を判定
      const processedTxs = res.data.map((tx: Tx) => ({
        ...tx,
        type: tx.type || (["給与", "副業", "ボーナス", "その他収入"].includes(tx.category) ? "income" : "expense")
      }));
      setTxs(processedTxs);
    } catch (err) {
      alert("認証エラーかAPI接続エラー");
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !date) return;
    
    setFormLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transactions`,
        { category, amount: Number(amount), date, note, type: transactionType },
        { withCredentials: true }
      );
      setCategory("");
      setAmount("");
      setDate("");
      setNote("");
      fetch();
    } catch (err) {
      alert("追加に失敗しました");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transactions/${id}`,
        { withCredentials: true }
      );
      fetch();
    } catch (err) {
      alert("削除に失敗しました");
    }
  };

  const pieData = () => {
    const map: Record<string, number> = {};
    txs.filter(t => t.type !== 'income').forEach(t => { 
      map[t.category] = (map[t.category] || 0) + t.amount; 
    });
    return {
      labels: Object.keys(map),
      datasets: [{
        data: Object.values(map),
        backgroundColor: ["#B5E8C7", "#B5DEFF", "#E5D4FF", "#FFDEB5", "#FFD4E5", "#C7FFED"],
        borderWidth: 3,
        borderColor: "#ffffff"
      }]
    };
  };

  const totalIncome = txs.filter(t => t.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = txs.filter(t => t.type !== 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  const downloadCSV = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transactions/csv`, { withCredentials: true, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
    } catch (err) {
      alert("CSV取得失敗");
    }
  };

  const getCategoryEmoji = (cat: string, type: string) => {
    if (type === 'income') {
      const found = INCOME_CATEGORIES.find(c => c.value === cat);
      return found ? found.emoji : "✨";
    }
    const found = EXPENSE_CATEGORIES.find(c => c.value === cat);
    return found ? found.emoji : "📝";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  };

  const currentCategories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap');
        
        body {
          font-family: 'M PLUS Rounded 1c', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-up { animation: slideUp 0.6s ease-out; }
        .bounce { animation: bounce 2s ease-in-out infinite; }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .spinner {
          animation: spin 1s linear infinite;
          border: 4px solid #E5F5ED;
          border-top-color: #7BE3A8;
          border-radius: 50%;
          width: 48px;
          height: 48px;
        }
        
        .scrollbar::-webkit-scrollbar { width: 10px; }
        .scrollbar::-webkit-scrollbar-track { background: #E5F5ED; border-radius: 10px; }
        .scrollbar::-webkit-scrollbar-thumb { background: #7BE3A8; border-radius: 10px; }
        .scrollbar::-webkit-scrollbar-thumb:hover { background: #5FD88D; }

        .cute-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%2352C77A' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 40px;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F0FFF4 0%, #E5F5ED 25%, #E5F5FF 50%, #F5E5FF 75%, #FFF5E5 100%)",
        padding: "32px 16px"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          
          {/* Header */}
          <div className="fade-in" style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="bounce" style={{
                width: 64, height: 64,
                background: "linear-gradient(135deg, #7BE3A8 0%, #5FD88D 100%)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(123, 227, 168, 0.4)",
                fontSize: 32
              }}>
                🌿
              </div>
              <div>
                <h1 style={{
                  fontSize: 36, fontWeight: 800, margin: 0,
                  background: "linear-gradient(90deg, #52C77A 0%, #7BE3A8 50%, #B5DEFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "1px"
                }}>家計簿アプリ</h1>
                <p style={{ fontSize: 14, color: "#52C77A", margin: 0, fontWeight: 500 }}>
                  ✨ 毎日のお金をすっきり管理 ✨
                </p>
              </div>
            </div>
            <div style={{ 
              background: "white",
              padding: "12px 24px",
              borderRadius: 20,
              boxShadow: "0 4px 16px rgba(82, 199, 122, 0.15)",
              border: "2px solid #B5E8C7"
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#52C77A", marginBottom: 4 }}>
                {formatTime(currentTime)}
              </div>
              <div style={{ fontSize: 12, color: "#7BE3A8" }}>
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Balance Dashboard - 収支が一目でわかる3カードデザイン */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: 20, 
            marginBottom: 32 
          }}>
            {/* 収入カード */}
            <div className="fade-in" style={{
              background: "linear-gradient(135deg, #7BE3A8 0%, #A8F5C8 100%)",
              borderRadius: 24,
              padding: 28,
              border: "3px solid white",
              boxShadow: "0 8px 32px rgba(123, 227, 168, 0.3)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: -20, right: -20,
                fontSize: 100,
                opacity: 0.1
              }}>💰</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 16, color: "white", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>📈</span>
                  収入
                </div>
                <div style={{ fontSize: 40, fontWeight: 800, color: "white", textShadow: "0 2px 8px rgba(82, 199, 122, 0.3)" }}>
                  ¥{totalIncome.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 支出カード */}
            <div className="fade-in" style={{
              background: "linear-gradient(135deg, #FFB5B5 0%, #FFD4D4 100%)",
              borderRadius: 24,
              padding: 28,
              border: "3px solid white",
              boxShadow: "0 8px 32px rgba(255, 181, 181, 0.3)",
              position: "relative",
              overflow: "hidden",
              animationDelay: "0.1s"
            }}>
              <div style={{
                position: "absolute",
                top: -20, right: -20,
                fontSize: 100,
                opacity: 0.1
              }}>💸</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 16, color: "white", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>📉</span>
                  支出
                </div>
                <div style={{ fontSize: 40, fontWeight: 800, color: "white", textShadow: "0 2px 8px rgba(255, 105, 105, 0.3)" }}>
                  ¥{totalExpense.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 残高カード - 大きく目立つデザイン */}
            <div className={balance >= 0 ? "fade-in pulse" : "fade-in"} style={{
              background: balance >= 0 
                ? "linear-gradient(135deg, #FFD700 0%, #FFF176 100%)" 
                : "linear-gradient(135deg, #FF9999 0%, #FFB5B5 100%)",
              borderRadius: 24,
              padding: 28,
              border: "3px solid white",
              boxShadow: balance >= 0 
                ? "0 12px 48px rgba(255, 215, 0, 0.4)" 
                : "0 12px 48px rgba(255, 153, 153, 0.4)",
              position: "relative",
              overflow: "hidden",
              animationDelay: "0.2s"
            }}>
              <div style={{
                position: "absolute",
                top: -20, right: -20,
                fontSize: 100,
                opacity: 0.15
              }}>{balance >= 0 ? "✨" : "⚠️"}</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 16, color: "white", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{balance >= 0 ? "🎉" : "😰"}</span>
                  残高
                </div>
                <div style={{ 
                  fontSize: 40, 
                  fontWeight: 800, 
                  color: "white", 
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  {balance >= 0 ? "+" : ""}¥{balance.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Form */}
          <div className="slide-up" style={{
            background: "white",
            borderRadius: 30,
            padding: 32,
            marginBottom: 32,
            border: "3px solid #E5F5ED",
            boxShadow: "0 12px 40px rgba(123, 227, 168, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 28 }}>✏️</span>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#52C77A", margin: 0 }}>新しい取引を追加</h2>
            </div>

            {/* 収入/支出 切り替えボタン */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => {
                  setTransactionType("income");
                  setCategory("");
                }}
                style={{
                  flex: 1,
                  background: transactionType === "income" 
                    ? "linear-gradient(135deg, #7BE3A8 0%, #5FD88D 100%)" 
                    : "#F0FFF4",
                  color: transactionType === "income" ? "white" : "#52C77A",
                  border: "2px solid #B5E8C7",
                  borderRadius: 16,
                  padding: "14px 24px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: transactionType === "income" ? "0 4px 16px rgba(123, 227, 168, 0.3)" : "none"
                }}
              >
                💰 収入
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionType("expense");
                  setCategory("");
                }}
                style={{
                  flex: 1,
                  background: transactionType === "expense" 
                    ? "linear-gradient(135deg, #FFB5B5 0%, #FF99A8 100%)" 
                    : "#FFF5F5",
                  color: transactionType === "expense" ? "white" : "#FF6B6B",
                  border: "2px solid #FFD4D4",
                  borderRadius: 16,
                  padding: "14px 24px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: transactionType === "expense" ? "0 4px 16px rgba(255, 181, 181, 0.3)" : "none"
                }}
              >
                💸 支出
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="cute-select"
                style={{
                  background: transactionType === "income" ? "#F0FFF4" : "#FFF5F5",
                  border: transactionType === "income" ? "2px solid #E5F5ED" : "2px solid #FFE5E5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: transactionType === "income" ? "#52C77A" : "#FF6B6B",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#7BE3A8" : "#FFB5B5";
                  e.target.style.boxShadow = transactionType === "income" 
                    ? "0 0 0 4px rgba(123, 227, 168, 0.2)" 
                    : "0 0 0 4px rgba(255, 181, 181, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#E5F5ED" : "#FFE5E5";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">カテゴリを選択 ✨</option>
                {currentCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="金額を入力 💴"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  background: transactionType === "income" ? "#F0FFF4" : "#FFF5F5",
                  border: transactionType === "income" ? "2px solid #E5F5ED" : "2px solid #FFE5E5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: transactionType === "income" ? "#52C77A" : "#FF6B6B",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  transition: "all 0.3s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#7BE3A8" : "#FFB5B5";
                  e.target.style.boxShadow = transactionType === "income" 
                    ? "0 0 0 4px rgba(123, 227, 168, 0.2)" 
                    : "0 0 0 4px rgba(255, 181, 181, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#E5F5ED" : "#FFE5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  background: transactionType === "income" ? "#F0FFF4" : "#FFF5F5",
                  border: transactionType === "income" ? "2px solid #E5F5ED" : "2px solid #FFE5E5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: transactionType === "income" ? "#52C77A" : "#FF6B6B",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  transition: "all 0.3s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#7BE3A8" : "#FFB5B5";
                  e.target.style.boxShadow = transactionType === "income" 
                    ? "0 0 0 4px rgba(123, 227, 168, 0.2)" 
                    : "0 0 0 4px rgba(255, 181, 181, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#E5F5ED" : "#FFE5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  background: transactionType === "income"
                    ? "linear-gradient(135deg, #7BE3A8 0%, #5FD88D 100%)"
                    : "linear-gradient(135deg, #FFB5B5 0%, #FF99A8 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 16,
                  padding: "14px 24px",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: formLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                  opacity: formLoading ? 0.5 : 1,
                  boxShadow: transactionType === "income"
                    ? "0 4px 16px rgba(123, 227, 168, 0.3)"
                    : "0 4px 16px rgba(255, 181, 181, 0.3)"
                }}
                onMouseEnter={(e) => !formLoading && (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                {formLoading ? "追加中... ⏳" : "追加する 🎀"}
              </button>
              <input
                type="text"
                placeholder="メモ（任意）📝"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  background: transactionType === "income" ? "#F0FFF4" : "#FFF5F5",
                  border: transactionType === "income" ? "2px solid #E5F5ED" : "2px solid #FFE5E5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: transactionType === "income" ? "#52C77A" : "#FF6B6B",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  gridColumn: "1 / -1",
                  transition: "all 0.3s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#7BE3A8" : "#FFB5B5";
                  e.target.style.boxShadow = transactionType === "income" 
                    ? "0 0 0 4px rgba(123, 227, 168, 0.2)" 
                    : "0 0 0 4px rgba(255, 181, 181, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = transactionType === "income" ? "#E5F5ED" : "#FFE5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
            </form>
          </div>

          {/* Main Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
            
            {/* Transaction List */}
            <div style={{ gridColumn: "1 / -1", maxWidth: "100%" }}>
              <div style={{
                background: "white",
                borderRadius: 30,
                padding: 32,
                border: "3px solid #E5F5ED",
                boxShadow: "0 12px 40px rgba(181, 232, 199, 0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 28 }}>📋</span>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: "#52C77A", margin: 0 }}>取引リスト</h3>
                </div>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <div className="scrollbar" style={{ maxHeight: 600, overflowY: "auto", paddingRight: 8 }}>
                    {txs.length === 0 ? (
                      <div style={{ 
                        textAlign: "center", 
                        padding: "60px 20px",
                        color: "#7BE3A8",
                        fontSize: 18,
                        fontWeight: 600
                      }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🌈</div>
                        まだ取引がありません
                      </div>
                    ) : (
                      txs.map((tx, idx) => (
                        <div
                          key={tx.id}
                          className="fade-in"
                          style={{
                            background: tx.type === 'income'
                              ? "linear-gradient(135deg, #F0FFF9 0%, #F0FFF4 100%)"
                              : "linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%)",
                            border: tx.type === 'income' ? "2px solid #E5F5ED" : "2px solid #FFE5E5",
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 12,
                            transition: "all 0.3s",
                            animationDelay: `${idx * 0.05}s`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = tx.type === 'income'
                              ? "0 8px 24px rgba(123, 227, 168, 0.3)"
                              : "0 8px 24px rgba(255, 181, 181, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                <span style={{ fontSize: 24 }}>{getCategoryEmoji(tx.category, tx.type || 'expense')}</span>
                                <span style={{
                                  background: tx.type === 'income'
                                    ? "linear-gradient(135deg, #7BE3A8, #A8F5C8)"
                                    : "linear-gradient(135deg, #FFB5B5, #FFD4D4)",
                                  color: "white",
                                  padding: "6px 16px",
                                  borderRadius: 12,
                                  fontSize: 14,
                                  fontWeight: 700
                                }}>{tx.category}</span>
                                <span style={{
                                  background: tx.type === 'income' ? "#E5F5ED" : "#FFE5E5",
                                  color: tx.type === 'income' ? "#52C77A" : "#FF6B6B",
                                  padding: "4px 12px",
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700
                                }}>
                                  {tx.type === 'income' ? '収入' : '支出'}
                                </span>
                                <span style={{ color: "#B5DEFF", fontSize: 14, fontWeight: 600 }}>📅 {new Date(tx.date).toLocaleDateString('ja-JP')}</span>
                              </div>
                              {tx.note && <p style={{ color: tx.type === 'income' ? "#7BE3A8" : "#FF99A8", fontSize: 14, margin: "4px 0 0 36px", fontWeight: 500 }}>{tx.note}</p>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                              <span style={{ 
                                fontSize: 28, 
                                fontWeight: 800, 
                                color: tx.type === 'income' ? "#52C77A" : "#FF6B6B"
                              }}>
                                {tx.type === 'income' ? '+' : '-'}¥{tx.amount.toLocaleString()}
                              </span>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                style={{
                                  background: "linear-gradient(135deg, #FFB5B5, #FFD4D4)",
                                  border: "none",
                                  color: "white",
                                  cursor: "pointer",
                                  padding: "10px 14px",
                                  borderRadius: 12,
                                  transition: "all 0.3s",
                                  fontSize: 18,
                                  fontWeight: 700
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.1)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 181, 181, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CSV Download */}
            <div>
              <button
                onClick={downloadCSV}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #C7FFED 0%, #B5DEFF 100%)",
                  border: "3px solid white",
                  borderRadius: 20,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  color: "#4A9FFF",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 8px 24px rgba(181, 210, 255, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(181, 210, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(181, 210, 255, 0.3)";
                }}
              >
                <span style={{ fontSize: 24 }}>📥</span>
                CSVダウンロード
              </button>
            </div>

            {/* Pie Chart */}
            <div style={{
              background: "white",
              borderRadius: 30,
              padding: 32,
              border: "3px solid #E5F5ED",
              boxShadow: "0 12px 40px rgba(199, 232, 231, 0.25)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 28 }}>🥧</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#52C77A", margin: 0 }}>支出カテゴリ別</h3>
              </div>
              {txs.filter(t => t.type !== 'income').length > 0 ? (
                <Pie
                  data={pieData()}
                  options={{
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "#52C77A",
                          padding: 15,
                          font: { size: 13, weight: "bold" }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px 20px",
                  color: "#7BE3A8",
                  fontSize: 16,
                  fontWeight: 600
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
                  支出データがありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
