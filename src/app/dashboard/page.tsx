"use client";

import { useState, useEffect, useRef } from "react";

interface Sms {
  _id: string;
  mobileNumber: string;
  message: string;
  status: string;
  createdAt: string;
}

interface InboxSms {
  _id: string;
  sender: string;
  message: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [message, setMessage] = useState("");
  const [smsList, setSmsList] = useState<Sms[]>([]);
  const [inboxList, setInboxList] = useState<InboxSms[]>([]);
  const [readInboxIds, setReadInboxIds] = useState<Set<string>>(new Set());
  const [selectedInbox, setSelectedInbox] = useState<InboxSms | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox">("dashboard");

  const [showFailedPopup, setShowFailedPopup] = useState(false);
  const isFirstLoad = useRef(true);
  const previousFailedCount = useRef(0);

  /* ================= FETCH FUNCTIONS ================= */

  const fetchSmsList = async () => {
    try {
      const res = await fetch("/api/admin/sms");
      const data = await res.json();
      if (res.ok && data.success) {
        setSmsList(data.data);

        const currentFailedCount = data.data.filter(
          (sms: Sms) => sms.status === "failed"
        ).length;

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

  const fetchInboxList = async () => {
    try {
      const res = await fetch("/api/admin/inbox");
      const data = await res.json();
      if (res.ok && data.success) {
        setInboxList(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch Inbox list", error);
    }
  };

  useEffect(() => {
    fetchSmsList();
    fetchInboxList();

    const interval = setInterval(() => {
      fetchSmsList();
      fetchInboxList();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /* ================= SEND SMS ================= */

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsSending(true);

    try {
      const res = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({ type: "success", text: "SMS Queued Successfully!" });
        setMobileNumber("");
        setMessage("");
        fetchSmsList();
      }
    } catch {
      setNotification({ type: "error", text: "Error connecting to server." });
    }
    setIsSending(false);
  };

  const handleDeleteSms = async (id: string) => {
    if (!window.confirm("Delete this log?")) return;
    await fetch(`/api/admin/sms?id=${id}`, { method: "DELETE" });
    fetchSmsList();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.replace("/login");
    }
  };

  /* ================= SIDEBAR STYLE ================= */

  const sidebarItemBase =
    "w-full h-12 px-4 rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-200 select-none box-border";
  const activeSidebar = "bg-indigo-600 text-white shadow-md";
  const inactiveSidebar = "text-slate-400 hover:bg-slate-800 hover:text-white";
  const unreadCount = inboxList.filter((m) => !readInboxIds.has(m._id)).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 min-w-[16rem] max-w-[16rem] flex-shrink-0 bg-slate-900 text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-indigo-400">SMS Portal</h2>
          <p className="text-xs text-slate-400">Admin Dashboard v2.0</p>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {/* Dashboard Button */}
          <div
            onClick={() => setActiveTab("dashboard")}
            className={`${sidebarItemBase} ${activeTab === "dashboard" ? activeSidebar : inactiveSidebar}`}
          >
            <span className="text-sm font-medium tracking-wide">Dashboard</span>
            {/* Invisible placeholder matching the exact size of the badge container */}
            <div className="w-8 h-5"></div>
          </div>

          {/* Inbox Button */}
          <div
            onClick={() => setActiveTab("inbox")}
            className={`${sidebarItemBase} ${activeTab === "inbox" ? activeSidebar : inactiveSidebar}`}
          >
            <span className="text-sm font-medium tracking-wide">Inbox</span>
            {/* Fixed width container for badge so it doesn't shift the layout */}
            <div className="w-8 h-5 flex justify-end items-center">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold w-full text-left p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
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

        {activeTab === "dashboard" ? (
          <>
            {/* Dashboard Cards */}
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
              {/* Compose Message Form */}
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
                  <button
                    type="submit"
                    disabled={isSending}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isSending ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l14-7-4 14-3-4-4-3z"></path>
                    </svg>
                    {isSending ? "Sending..." : "Send SMS"}
                  </button>
                </form>
              </div>

              {/* Recent Activity Table */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                  <button onClick={fetchSmsList} className="text-indigo-600 text-xs font-bold hover:underline">Refresh</button>
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
                            <button onClick={() => handleDeleteSms(sms._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                               <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* --- INBOX UI --- */
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                Incoming Messages
              </h2>
              <button
                onClick={fetchInboxList}
                className="text-indigo-600 text-xs font-bold px-4 py-2 rounded-lg border border-indigo-100 bg-white shadow-sm hover:bg-indigo-50 transition-colors"
              >
                Refresh Inbox
              </button>
            </div>
            <div className="overflow-x-auto">
              {inboxList.length === 0 ? (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                  <svg className="w-12 h-12 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  <p>No incoming messages yet.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Sender</th>
                      <th className="px-6 py-4">Message Content</th>
                      <th className="px-6 py-4 text-right">Received Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {inboxList.map((msg) => (
                      <tr
                        key={msg._id}
                        className={`transition cursor-pointer ${readInboxIds.has(msg._id) ? "hover:bg-slate-50" : "bg-indigo-50/40 hover:bg-indigo-50"}`}
                        onClick={() => {
                          setSelectedInbox(msg);
                          setReadInboxIds((prev) => {
                            const next = new Set(prev);
                            next.add(msg._id);
                            return next;
                          });
                        }}
                      >
                        <td className={`px-6 py-4 text-sm ${readInboxIds.has(msg._id) ? "font-medium text-slate-700" : "font-bold text-slate-800"}`}>{msg.sender}</td>
                        <td className={`px-6 py-4 text-sm ${readInboxIds.has(msg._id) ? "text-slate-600" : "text-slate-800"}`}>{msg.message}</td>
                        <td className="px-6 py-4 text-[10px] text-slate-400 text-right">
                          {new Date(msg.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {showFailedPopup && activeTab === "dashboard" && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delivery Failed!</h2>
              <p className="text-slate-500 text-sm mb-8">আপনার মোবাইলে সিমের ব্যালেন্স শেষ। দয়া করে রিচার্জ করে আবার চেষ্টা করুন।</p>
              <button onClick={() => setShowFailedPopup(false)} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-colors">Dismiss</button>
            </div>
          </div>
        )}

        {selectedInbox && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedInbox(null)}>
            <div
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Sender</p>
                  <h3 className="text-xl font-bold text-slate-800">{selectedInbox.sender}</h3>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Message</p>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedInbox.message}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Received</p>
                  <p>{new Date(selectedInbox.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-indigo-600 font-semibold">Inbox</div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setSelectedInbox(null)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}