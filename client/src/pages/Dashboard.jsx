import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import { url } from "../constants/url";
import { showToast } from "../utils/toast";

export default function Dashboard() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const fetchCVs = async () => {
    try {
      const { data } = await axios.get(`${url}/cvs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setCvs(data);
    } catch (error) {
      console.log(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  const handleDelete = async (e, cvId) => {
    e.preventDefault();
    e.stopPropagation();

    const ok = window.confirm("Hapus CV ini?");
    if (!ok) return;

    try {
      await axios.delete(`${url}/cvs/${cvId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setCvs((prev) => prev.filter((item) => item.id !== cvId));
      showToast("CV berhasil dihapus");
    } catch (error) {
      console.log(error.response?.data?.message);
      showToast("Gagal menghapus CV", "error");
    }
  };

  const handleUploadClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Hanya file PDF yang didukung", "error");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const { data } = await axios.post(`${url}/cvs/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("PDF berhasil diupload");
      navigate(`/cvs/${data.id}`);
    } catch (error) {
      const message = error.response?.data?.message || "Gagal memproses PDF";
      showToast(message, "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute top-10 right-6 h-64 w-64 rounded-full bg-rose-200/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-100/70 blur-3xl" />
        <div className="p-8 max-w-6xl mx-auto relative">
          {/* HERO */}
          <div className="glass-panel ring-soft rounded-3xl border border-white/60 p-6 md:p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs uppercase tracking-[0.2em]">
                  CV Studio
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-display text-slate-900">
                  Bangun CV yang meyakinkan, cepat, dan rapi.
                </h1>
                <p className="text-sm md:text-base text-slate-600 mt-3 max-w-2xl">
                  Kelola semua CV kamu dalam satu dashboard berwarna, modern,
                  dan siap dipamerkan ke recruiter.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                    AI Review
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                    Export PDF
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    Smart Layout
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-200/60 hover:from-sky-400 hover:to-indigo-400 transition disabled:opacity-60 cursor-pointer"
                >
                  {uploading ? "Uploading..." : "Upload PDF"}
                </button>

                <button
                  onClick={() => navigate("/create")}
                  className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-slate-300/60 hover:bg-slate-800 transition cursor-pointer"
                >
                  + Create CV
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: "Total CV",
                value: cvs.length,
                tone: "from-sky-500/10 via-white to-white",
                badge: "📄",
              },
              {
                label: "Terakhir Update",
                value: cvs[0]?.updatedAt
                  ? new Date(cvs[0].updatedAt).toLocaleDateString("id-ID")
                  : "-",
                tone: "from-amber-500/10 via-white to-white",
                badge: "⏱️",
              },
              {
                label: "Rata-rata Skill",
                value: cvs.length
                  ? Math.round(
                      cvs.reduce(
                        (acc, cv) =>
                          acc + (cv.skills ? cv.skills.split(",").length : 0),
                        0,
                      ) / cvs.length,
                    )
                  : 0,
                tone: "from-emerald-500/10 via-white to-white",
                badge: "✨",
              },
              {
                label: "Total Experience",
                value: cvs.reduce(
                  (acc, cv) => acc + (cv.Experiences?.length || 0),
                  0,
                ),
                tone: "from-rose-500/10 via-white to-white",
                badge: "🧭",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border border-white/80 bg-gradient-to-br ${item.tone} p-4 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {item.label}
                  </p>
                  <span className="text-lg">{item.badge}</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-slate-500 animate-pulse">Loading CV...</p>
            </div>
          ) : cvs.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
              <p className="text-slate-500 mb-2">Kamu belum punya CV</p>
              <p className="text-sm text-slate-400 mb-6">
                Mulai buat CV pertamamu sekarang.
              </p>
              <button
                onClick={() => navigate("/create")}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl"
              >
                Buat CV Pertama
              </button>
            </div>
          ) : (
            /* LIST CV */
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    CV Library
                  </p>
                  <h2 className="text-2xl font-display text-slate-900">
                    Koleksi CV Kamu
                  </h2>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80">
                    {cvs.length} CV
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80">
                    Updated {new Date().toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {cvs.map((cv) => {
                  const displayName = (cv.fullName || "").trim();
                  const roleTitle = (cv.title || "").trim();
                  const initials = (displayName || "CV")
                    .split(" ")
                    .map((word) => word[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const photoSrc = (cv.photoUrl || "").trim();
                  const showImage = Boolean(photoSrc);

                  return (
                    <div
                      key={cv.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-400" />
                      <button
                        onClick={(e) => handleDelete(e, cv.id)}
                        className="absolute top-4 right-4 text-xs font-semibold text-red-600 bg-white/80 border border-red-100 px-3 py-1 rounded-full hover:bg-red-100 hover:border-red-200 transition"
                      >
                        Delete
                      </button>

                      <Link to={`/cvs/${cv.id}`} className="block">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/70 bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-semibold shadow-sm">
                            {showImage ? (
                              <img
                                src={photoSrc}
                                alt={displayName || "CV"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition">
                              {displayName || "Nama belum diisi"}
                            </h2>
                            <p className="text-xs text-slate-500">
                              {roleTitle || "Role belum diisi"}
                            </p>
                            <p className="text-xs text-slate-400">
                              Updated{" "}
                              {new Date(cv.updatedAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-3">
                          {cv.summary || "Tidak ada ringkasan."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(cv.skills ? cv.skills.split(",") : [])
                            .slice(0, 3)
                            .map((skill, i) => (
                              <span
                                key={`${cv.id}-skill-${i}`}
                                className="text-xs font-medium text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-full"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          {cv.skills && cv.skills.split(",").length > 3 && (
                            <span className="text-xs font-medium text-slate-500">
                              +{cv.skills.split(",").length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <div className="bg-white/80 border border-slate-100 rounded-xl p-2">
                            <p className="text-[10px] text-slate-400">
                              Experience
                            </p>
                            <p className="font-semibold text-slate-700">
                              {cv.Experiences?.length || 0} entry
                            </p>
                          </div>
                          <div className="bg-white/80 border border-slate-100 rounded-xl p-2">
                            <p className="text-[10px] text-slate-400">
                              Education
                            </p>
                            <p className="font-semibold text-slate-700 line-clamp-1">
                              {cv.education || "-"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
