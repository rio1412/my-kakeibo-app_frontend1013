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
};

const CATEGORIES = [
  { value: "食費", label: "食費 🍔", emoji: "🍔" },
  { value: "交通費", label: "交通費 🚌", emoji: "🚌" },
  { value: "光熱費", label: "光熱費 💡", emoji: "💡" },
  { value: "家賃", label: "家賃 🏠", emoji: "🏠" },
  { value: "遊び", label: "遊び 🎮", emoji: "🎮" },
  { value: "その他", label: "その他 📝", emoji: "📝" }
];

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  // ✅ 初期値を現在時刻の "YYYY-MM-DD" 形式で設定
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
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
      setTxs(res.data);
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
        { category, amount: Number(amount), date, note },
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
    txs.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return {
      labels: Object.keys(map),
      datasets: [{
        data: Object.values(map),
        backgroundColor: ["#FFB5E8", "#B5DEFF", "#C7FFED", "#FFDEB5", "#E7C6FF", "#FFD4D4"],
        borderWidth: 3,
        borderColor: "#ffffff"
      }]
    };
  };

  const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0);

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

  const getCategoryEmoji = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.emoji : "📝";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  };

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
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-up { animation: slideUp 0.6s ease-out; }
        .bounce { animation: bounce 2s ease-in-out infinite; }
        .spinner {
          animation: spin 1s linear infinite;
          border: 4px solid #FFE5F5;
          border-top-color: #FFB5E8;
          border-radius: 50%;
          width: 48px;
          height: 48px;
        }
        
        .scrollbar::-webkit-scrollbar { width: 10px; }
        .scrollbar::-webkit-scrollbar-track { background: #FFE5F5; border-radius: 10px; }
        .scrollbar::-webkit-scrollbar-thumb { background: #FFB5E8; border-radius: 10px; }
        .scrollbar::-webkit-scrollbar-thumb:hover { background: #FF99DD; }

        .cute-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23FF69B4' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 40px;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFF5F7 0%, #FFE5F5 25%, #E5F5FF 50%, #F5E5FF 75%, #FFF5E5 100%)",
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
                background: "linear-gradient(135deg, #FFB5E8 0%, #FF99DD 100%)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(255, 181, 232, 0.4)",
                fontSize: 32
              }}>
                💰
              </div>
              <div>
                <h1 style={{
                  fontSize: 36, fontWeight: 800, margin: 0,
                  background: "linear-gradient(90deg, #FF69B4 0%, #FFB5E8 50%, #B5DEFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "1px"
                }}>家計簿アプリ</h1>
                <p style={{ fontSize: 14, color: "#FF69B4", margin: 0, fontWeight: 500 }}>
                  ✨ 毎日の支出を管理 ✨
                </p>
              </div>
            </div>
            <div style={{ 
              background: "white",
              padding: "12px 24px",
              borderRadius: 20,
              boxShadow: "0 4px 16px rgba(255, 105, 180, 0.15)",
              border: "2px solid #FFB5E8"
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#FF69B4", marginBottom: 4 }}>
                {formatTime(currentTime)}
              </div>
              <div style={{ fontSize: 12, color: "#FF99DD" }}>
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="fade-in" style={{
            background: "linear-gradient(135deg, #FFB5E8 0%, #FFD4E5 100%)",
            borderRadius: 30,
            padding: 40,
            marginBottom: 32,
            border: "3px solid white",
            boxShadow: "0 12px 40px rgba(255, 105, 180, 0.25)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: -20, right: -20,
              fontSize: 120,
              opacity: 0.1
            }}>🌸</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, position: "relative" }}>
              <span style={{ fontSize: 32 }}></span>
              <h2 style={{ fontSize: 20, color: "white", margin: 0, fontWeight: 700 }}>今月の総支出</h2>
            </div>
            <p style={{
              fontSize: 56, fontWeight: 800, margin: 0,
              color: "white",
              textShadow: "0 2px 8px rgba(255, 105, 180, 0.3)",
              position: "relative"
            }}>¥{totalAmount.toLocaleString()}</p>
          </div>

          {/* Transaction Form */}
          <div className="slide-up" style={{
            background: "white",
            borderRadius: 30,
            padding: 32,
            marginBottom: 32,
            border: "3px solid #FFE5F5",
            boxShadow: "0 12px 40px rgba(255, 181, 232, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 28 }}>✏️</span>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#FF69B4", margin: 0 }}>新しい支出を追加</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="cute-select"
                style={{
                  background: "#FFF5F7",
                  border: "2px solid #FFE5F5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#FF69B4",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FFB5E8";
                  e.target.style.boxShadow = "0 0 0 4px rgba(255, 181, 232, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#FFE5F5";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">カテゴリを選択 ✨</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="金額を入力 💴"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  background: "#FFF5F7",
                  border: "2px solid #FFE5F5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#FF69B4",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FFB5E8";
                  e.target.style.boxShadow = "0 0 0 4px rgba(255, 181, 232, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#FFE5F5";
                  e.target.style.boxShadow = "none";
                }}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  background: "#FFF5F7",
                  border: "2px solid #FFE5F5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#FF69B4",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FFB5E8";
                  e.target.style.boxShadow = "0 0 0 4px rgba(255, 181, 232, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#FFE5F5";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  background: "linear-gradient(135deg, #FFB5E8 0%, #FF99DD 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 16,
                  padding: "14px 24px",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: formLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                  opacity: formLoading ? 0.5 : 1,
                  boxShadow: "0 4px 16px rgba(255, 181, 232, 0.3)"
                }}
                onMouseEnter={(e) => !formLoading && (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                {formLoading ? "追加中... ⏳" : "追加する"}
              </button>
              <input
                type="text"
                placeholder="メモ（任意）📝"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  background: "#FFF5F7",
                  border: "2px solid #FFE5F5",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#FF69B4",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                  gridColumn: "1 / -1"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FFB5E8";
                  e.target.style.boxShadow = "0 0 0 4px rgba(255, 181, 232, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#FFE5F5";
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
                border: "3px solid #FFE5F5",
                boxShadow: "0 12px 40px rgba(181, 210, 255, 0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 28 }}>📋</span>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: "#69B4FF", margin: 0 }}>支出リスト</h3>
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
                        color: "#FFB5E8",
                        fontSize: 18,
                        fontWeight: 600
                      }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🌈</div>
                        まだ支出がありません
                      </div>
                    ) : (
                      txs.map((tx, idx) => (
                        <div
                          key={tx.id}
                          className="fade-in"
                          style={{
                            background: "linear-gradient(135deg, #FFF5F7 0%, #F5F5FF 100%)",
                            border: "2px solid #FFE5F5",
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 12,
                            transition: "all 0.3s",
                            animationDelay: `${idx * 0.05}s`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 181, 232, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                <span style={{ fontSize: 24 }}>{getCategoryEmoji(tx.category)}</span>
                                <span style={{
                                  background: "linear-gradient(135deg, #FFB5E8, #FFD4E5)",
                                  color: "white",
                                  padding: "6px 16px",
                                  borderRadius: 12,
                                  fontSize: 14,
                                  fontWeight: 700
                                }}>{tx.category}</span>
                                <span style={{ color: "#B5DEFF", fontSize: 14, fontWeight: 600 }}>📅 {formatDate(new Date(tx.date))}</span>
                              </div>
                              {tx.note && <p style={{ color: "#FF99DD", fontSize: 14, margin: "4px 0 0 36px", fontWeight: 500 }}>{tx.note}</p>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                              <span style={{ fontSize: 28, fontWeight: 800, color: "#FF69B4" }}>
                                ¥{tx.amount.toLocaleString()}
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
              border: "3px solid #FFE5F5",
              boxShadow: "0 12px 40px rgba(231, 198, 255, 0.25)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 28 }}>🥧</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#C599FF", margin: 0 }}>カテゴリ別</h3>
              </div>
              {txs.length > 0 ? (
                <Pie
                  data={pieData()}
                  options={{
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "#FF69B4",
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
                  color: "#FFB5E8",
                  fontSize: 16,
                  fontWeight: 600
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
                  データがありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
