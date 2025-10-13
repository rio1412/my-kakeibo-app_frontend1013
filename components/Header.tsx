// frontend/components/Header.tsx
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();

  const logout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/logout`, {}, { withCredentials: true });
      router.push("/");
    } catch (e) {
      router.push("/");
    }
  };

  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div><Link href="/transactions">家計簿</Link></div>
      <div>
        <button onClick={logout} style={{ padding: "6px 12px" }}>ログアウト</button>
      </div>
    </header>
  );
}
