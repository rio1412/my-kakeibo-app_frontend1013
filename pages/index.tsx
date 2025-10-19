// frontend/pages/index.tsx
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/login`,
        { username, password },
        { withCredentials: true }
      );
      router.push("/transactions");
    } catch (err: any) {
      alert(err.response?.data?.detail || "ログイン失敗");
    } finally {
      setLoading(false);
    }
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
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F0FFF4 0%, #E5F5ED 25%, #E5F5FF 50%, #F5E5FF 75%, #FFF5E5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div className="fade-in" style={{
          maxWidth: 440,
          width: "100%",
          background: "white",
          borderRadius: 32,
          padding: 48,
          boxShadow: "0 20px 60px rgba(123, 227, 168, 0.2)",
          border: "3px solid #E5F5ED"
        }}>
          
          {/* Logo & Title */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="float" style={{
              width: 80,
              height: 80,
              background: "linear-gradient(135deg, #7BE3A8 0%, #5FD88D 100%)",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginBottom: 20,
              boxShadow: "0 10px 30px rgba(123, 227, 168, 0.3)"
            }}>
              🌿
            </div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              margin: "0 0 8px 0",
              background: "linear-gradient(90deg, #52C77A 0%, #7BE3A8 50%, #B5DEFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              さわやか家計簿
            </h1>
            <p style={{
              fontSize: 14,
              color: "#52C77A",
              margin: 0,
              fontWeight: 500
            }}>
              ✨ ログインして始めましょう ✨
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={login}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#52C77A",
                marginBottom: 8
              }}>
                👤 ユーザー名
              </label>
              <input
                type="text"
                placeholder="ユーザー名を入力"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "#F0FFF4",
                  border: "2px solid #E5F5ED",
                  borderRadius: 16,
                  padding: "14px 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#52C77A",
                  outline: "none",
                  transition: "all 0.3s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7BE3A8";
                  e.target.style.boxShadow = "0 0 0 4px rgba(123, 227, 168, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5F5ED";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#52C77A",
                marginBottom: 8
              }}>
                🔒 パスワード
              </label>
              <input
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "#F0FFF4",
                  border: "2px solid #E5F5ED",
                  borderRadius: 16,
                  padding: "14px 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#52C77A",
                  outline: "none",
                  transition: "all 0.3s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7BE3A8";
                  e.target.style.boxShadow = "0 0 0 4px rgba(123, 227, 168, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5F5ED";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #7BE3A8 0%, #5FD88D 100%)",
                color: "white",
                border: "none",
                borderRadius: 16,
                padding: "16px",
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 16px rgba(123, 227, 168, 0.3)",
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(123, 227, 168, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(123, 227, 168, 0.3)";
              }}
            >
              {loading ? "ログイン中... ⏳" : "ログイン 🚀"}
            </button>
          </form>

          {/* Footer Note - 本番環境では削除推奨 */}
          {process.env.NODE_ENV === "development" && (
            <div style={{
              marginTop: 24,
              padding: 16,
              background: "#F0FFF4",
              borderRadius: 12,
              border: "2px solid #E5F5ED"
            }}>
              <p style={{
                fontSize: 12,
                color: "#52C77A",
                margin: 0,
                textAlign: "center",
                fontWeight: 500
              }}>
                🧪 開発環境<br />
                テストユーザー: alice / bob<br />
                パスワード: ユーザー名 + "_pass"
              </p>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div style={{
          position: "fixed",
          top: 40,
          right: 40,
          fontSize: 60,
          opacity: 0.3,
          animation: "float 4s ease-in-out infinite"
        }}>
          🌸
        </div>
        <div style={{
          position: "fixed",
          bottom: 60,
          left: 60,
          fontSize: 50,
          opacity: 0.3,
          animation: "float 3s ease-in-out infinite",
          animationDelay: "0.5s"
        }}>
          🍃
        </div>
      </div>
    </>
  );
}
