import { useState } from "react";

export default function CVPreview({ cv }) {
  const [imageError, setImageError] = useState(false);
  const photoSrc = (cv.photoUrl || "").trim();
  const displayName = (cv.fullName || "").trim();
  const initials = (displayName || "CV")
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const showImage = Boolean(photoSrc) && !imageError;

  const skills = cv.skills
    ? cv.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];
  const experiences = cv.Experiences || cv.experiences || [];

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-6 rounded-3xl shadow-sm border border-slate-100 bg-white p-6">
      {/* SIDEBAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/10 bg-white/10">
            {showImage ? (
              <img
                src={photoSrc}
                className="h-full w-full object-cover"
                alt="CV"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white/80 text-sm font-semibold">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold">
              {displayName || "Nama belum diisi"}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {cv.title || "Role belum diisi"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-white/60">
            Summary
          </p>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            {cv.summary || "Summary belum diisi."}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-white/60">
            Skills
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.length === 0 ? (
              <span className="text-xs text-white/60">Belum ada skill.</span>
            ) : (
              skills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Education
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-2">
              {cv.education || "-"}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Experience Count
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-2">
              {experiences.length} entry
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Experience</h2>
            <span className="text-xs text-slate-400">
              Updated {new Date(cv.updatedAt).toLocaleDateString("id-ID")}
            </span>
          </div>

          {experiences.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-500">
              Belum ada experience. Tambahkan melalui form edit.
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <div
                  key={exp.id || `${exp.company}-${index}`}
                  className="border border-slate-100 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {exp.position || "Role"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {exp.company || "Company"}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {exp.startDate
                        ? new Date(exp.startDate).toLocaleDateString("id-ID")
                        : "-"}
                      {" - "}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString("id-ID")
                        : "Present"}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-slate-600 mt-3">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
