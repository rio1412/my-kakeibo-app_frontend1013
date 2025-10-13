// frontend/pages/admin/users.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";

type User = { id: number; username: string; role: string; };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const fetch = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      alert("管理者のみアクセス可能");
      window.location.href = "/";
    }
  };

  useEffect(() => { fetch(); }, []);

  const createUser = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users`, { username, password, role }, { withCredentials: true });
      setUsername(""); setPassword("");
      fetch();
    } catch (err: any) {
      alert(err.response?.data?.detail || "作成失敗");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: 12 }}>
      <Header />
      <h2>ユーザー管理</h2>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="ユーザー名" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button onClick={createUser}>作成</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th>ID</th><th>ユーザー名</th><th>ロール</th></tr></thead>
        <tbody>
          {users.map(u => (<tr key={u.id}><td>{u.id}</td><td>{u.username}</td><td>{u.role}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
}
