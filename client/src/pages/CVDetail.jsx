import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { url } from "../constants/url";
import CVPreview from "../components/CVPreview";
import { showToast } from "../utils/toast";

export default function CVDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cv, setCv] = useState(null);
  const [review, setReview] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewMode, setReviewMode] = useState(null);
  const experiences = cv?.Experiences || cv?.experiences || [];
  const skills = cv?.skills
    ? cv.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const fetchCV = async () => {
    try {
      const { data } = await axios.get(`${url}/cvs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setCv(data);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal memuat CV";
      showToast(message, "error");
    }
  };

  useEffect(() => {
    fetchCV();
  }, []);

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${url}/cvs/${id}/download`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const fileURL = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `cv-${id}.pdf`;
      link.click();
    } catch (err) {
      const message = err.response?.data?.message || "Gagal download PDF";
      showToast(message, "error");
    }
  };

  // Review CV yang ada di app (via puppeteer)
  const handleReviewThis = async () => {
    setLoadingReview(true);
    setReview("");
    setReviewMode("this");
    try {
      const { data } = await axios.get(`${url}/cvs/${id}/review`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setReview(data.review);
    } catch (err) {
      setReview("Gagal mengambil review. Coba lagi.");
      const message = err.response?.data?.message || "Gagal mengambil review";
      showToast(message, "error");
    } finally {
      setLoadingReview(false);
    }
  };

  if (!cv) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-70" />
        <div className="absolute top-12 -right-20 h-72 w-72 rounded-full bg-rose-100 blur-3xl opacity-70" />
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto relative">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                CV Detail
              </p>
              <h1 className="text-4xl font-display text-slate-900">
                {cv.fullName || "CV Detail"}
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Terakhir diperbarui:{" "}
                {new Date(cv.updatedAt).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownload}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              >
                Download PDF
              </button>

              <button
                onClick={() => navigate(`/edit/${id}`)}
                className="bg-amber-400 text-slate-900 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              >
                Edit
              </button>

              <button
                onClick={handleReviewThis}
                disabled={loadingReview}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loadingReview && reviewMode === "this" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  "Review CV"
                )}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-6">
              {/* CV PREVIEW */}
              <CVPreview cv={cv} />

              {/* AI REVIEW RESULT */}
              {(review || loadingReview) && (
                <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">✨</span>
                    <h2 className="font-semibold text-slate-800">AI Review</h2>
                  </div>

                  {loadingReview ? (
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      Sedang menganalisis CV kamu...
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {review}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Quick Stats
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[11px] text-slate-400">Skills</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {skills.length}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[11px] text-slate-400">Experience</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {experiences.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
