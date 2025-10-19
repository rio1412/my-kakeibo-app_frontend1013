// frontend/pages/index.tsx
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = async () => {
    try {
      await axios.post(${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/login, { username, password }, { withCredentials: true });
      router.push("/transactions");
    } catch (err: any) {
      alert(err.response?.data?.detail || "ログイン失敗");
    }
  };
  return (
    <div style={{ maxWidth: 420, margin: "50px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>家計簿アプリ — ログイン</h2>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="ユーザー名" value={username} onChange={e => setUsername(e.target.value)} style={{ width: "100%", padding: 8 }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="パスワード" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: 8 }} />
      </div>
      <div>
        <button onClick={login} style={{ padding: "8px 16px" }}>ログイン</button>
      </div>
      <p style={{ marginTop: 12, color: "#666" }}>初期ユーザー: alice / bob (password: username + "_pass" としてローカルで使えます)</p>
    </div>
  );
}
