"use client";

import { useState, useEffect, useRef } from "react";

interface Sms {
  _id: string;
  mobileNumber: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [message, setMessage] = useState("");
  const [smsList, setSmsList] = useState<Sms[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [showFailedPopup, setShowFailedPopup] = useState(false);
  const isFirstLoad = useRef(true);
  const previousFailedCount = useRef(0);

  const fetchSmsList = async () => {
    try {
      const res = await fetch("/api/admin/sms");
      const data = await res.json();
      if (res.ok && data.success) {
        setSmsList(data.data);
        const currentFailedCount = data.data.filter((sms: Sms) => sms.status === "failed").length;
        
        if (!isFirstLoad.current && currentFailedCount > previousFailedCount.current) {
          setShowFailedPopup(true);
        }
        
        previousFailedCount.current = currentFailedCount;
        isFirstLoad.current = false;
      }
    } catch (error) {
      console.error("Failed to fetch SMS list", error);
    }
  };

  useEffect(() => {
    fetchSmsList();
    const interval = setInterval(fetchSmsList, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsSending(true);
    setCountdown(6); 
    try {
      const res = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: "success", text: "SMS Queued Successfully!" });
        setMobileNumber(""); setMessage(""); fetchSmsList(); 
      }
    } catch (error) {
      setNotification({ type: "error", text: "Error connecting to server." });
    }
    let timer = 6;
    const interval = setInterval(() => {
      timer -= 1; setCountdown(timer);
      if (timer <= 0) { clearInterval(interval); setIsSending(false); }
    }, 1000);
  };

  const handleDeleteSms = async (id: string) => {
    if (!window.confirm("Delete this log?")) return;
    await fetch(`/api/admin/sms?id=${id}`, { method: "DELETE" });
    fetchSmsList();
  };

  const handleLogout = async () => {
    try {
      // Call server-side logout API to delete httpOnly cookie
      await fetch("/api/admin/logout", { method: "POST" });
      // Redirect to login page after successful logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Force redirect even if API call fails
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-indigo-400">SMS Portal</h2>
          <p className="text-xs text-slate-400">Admin Dashboard v2.0</p>
        </div>
        <nav className="flex-grow px-4 space-y-2">
          <div className="bg-indigo-600 p-3 rounded-lg flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold transition w-full text-left p-2 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow overflow-y-auto h-screen p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome Back, Tanvir</h1>
            <p className="text-slate-500 text-sm">Monitor your coaching SMS gateway status.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">System Live</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500">
            <p className="text-sm text-slate-500 font-medium">Total Sent</p>
            <h3 className="text-3xl font-bold text-slate-800">{smsList.filter(s => s.status === 'sent').length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500">
            <p className="text-sm text-slate-500 font-medium">Queue / Pending</p>
            <h3 className="text-3xl font-bold text-slate-800">{smsList.filter(s => s.status === 'pending' || s.status === 'processing').length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-slate-500 font-medium">Failed Delivery</p>
            <h3 className="text-3xl font-bold text-slate-800">{smsList.filter(s => s.status === 'failed').length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-md border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Compose Message</h2>
            {notification && (
              <div className={`p-4 rounded-xl mb-6 text-sm ${notification.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {notification.text}
              </div>
            )}
            <form onSubmit={handleSendSms} className="space-y-5">
              <input type="text" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="017XXXXXXXX" />
              <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Type message..."></textarea>
              <button type="submit" disabled={isSending} 
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${isSending ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {isSending ? `Wait (${countdown}s)` : "Send SMS"}
              </button>
            </form>
          </div>

          <div className="xl:col-span-2 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
              <button onClick={fetchSmsList} className="text-indigo-600 text-xs font-bold">Refresh</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {smsList.map((sms) => (
                    <tr key={sms._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{sms.mobileNumber}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-[150px]">{sms.message}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${sms.status === 'sent' ? 'bg-green-100 text-green-700' : sms.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
                          {sms.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-400">
                        {new Date(sms.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteSms(sms._id)} className="text-slate-300 hover:text-red-500">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showFailedPopup && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delivery Failed!</h2>
              <p className="text-slate-500 text-sm mb-8">আপনার মোবাইলে সিমের ব্যালেন্স শেষ। দয়া করে রিচার্জ করে আবার চেষ্টা করুন।</p>
              <button onClick={() => setShowFailedPopup(false)} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold">Dismiss</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}