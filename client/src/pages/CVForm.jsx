import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { url } from "../constants/url";
import { showToast } from "../utils/toast";

export default function CVForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    title: "",
    summary: "",
    education: "",
    skills: "",
    photoUrl: "",
  });

  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    if (id) {
      axios
        .get(`${url}/cvs/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        .then((res) => {
          setForm(res.data);
          setExperiences(res.data.Experiences || []);
          setPreview(res.data.photoUrl || "");
          if (res.data.skills) {
            setSkills(
              res.data.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            );
          }
        })
        .catch((err) => console.log(err));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExpChange = (index, e) => {
    const newExp = [...experiences];
    newExp[index][e.target.name] = e.target.value;
    setExperiences(newExp);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (!val || skills.includes(val)) return;
    const updated = [...skills, val];
    setSkills(updated);
    setForm((prev) => ({ ...prev, skills: updated.join(", ") }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    setForm((prev) => ({ ...prev, skills: updated.join(", ") }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      console.log("upload result:", data.secure_url); // cek URL-nya
      setForm((prev) => ({ ...prev, photoUrl: data.secure_url }));
      setPreview(data.secure_url);
    } catch (err) {
      showToast("Gagal upload foto", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    console.log("form yang dikirim:", form); // tambah ini
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    };
    const normalizedExperiences = experiences
      .map((exp) => ({
        ...exp,
        company: exp.company?.trim(),
        position: exp.position?.trim(),
        description: exp.description?.trim(),
        startDate: exp.startDate || null,
        endDate: exp.endDate || exp.startDate || null,
      }))
      .filter(
        (exp) =>
          exp.company &&
          exp.position &&
          exp.description &&
          exp.startDate &&
          exp.endDate,
      );
    let cvId = id;
    try {
      if (id) {
        await axios.put(`${url}/cvs/${id}`, form, config);
      } else {
        const { data } = await axios.post(`${url}/cvs`, form, config);
        cvId = data.id;
      }
      await axios.post(
        `${url}/experiences/bulk`,
        { cvId, experiences: normalizedExperiences },
        config,
      );
      showToast("CV berhasil disimpan");
      navigate(`/cvs/${cvId}`);
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menyimpan CV";
      showToast(message, "error");
    }
  };

  const steps = ["Profile", "Experience", "Skills"];
  const progressItems = [
    { label: "Name", done: Boolean(form.fullName) },
    { label: "Role", done: Boolean(form.title) },
    { label: "Summary", done: Boolean(form.summary) },
    { label: "Education", done: Boolean(form.education) },
    { label: "Photo", done: Boolean(form.photoUrl || preview) },
    { label: "Skills", done: skills.length > 0 },
    { label: "Experience", done: experiences.length > 0 },
  ];
  const completedCount = progressItems.filter((item) => item.done).length;
  const completion = Math.round((completedCount / progressItems.length) * 100);
  const latestExperience = [...experiences]
    .reverse()
    .find((exp) => exp.company || exp.position || exp.description);
  const topSkills = skills.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-100 blur-3xl opacity-70 floaty" />
        <div className="absolute top-10 -right-24 h-72 w-72 rounded-full bg-cyan-100 blur-3xl opacity-70" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {id ? "Edit" : "Create"} CV
              </p>
              <h1 className="text-4xl md:text-5xl text-slate-900 font-display">
                {id ? "Refine your story" : "Build your story"}
              </h1>
              <p className="text-sm text-slate-500 mt-2 max-w-xl">
                Isi detail penting dan lihat preview CV kamu secara real-time.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
              <p className="text-xs text-slate-400">Completion</p>
              <p className="text-2xl font-semibold text-slate-900">
                {completion}%
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="space-y-6 fade-up">
              {/* Step Indicator */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <p className="text-xs text-slate-400">{steps[currentStep]}</p>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all"
                    style={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {steps.map((step, i) => (
                    <button
                      key={step}
                      onClick={() => setCurrentStep(i)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        i === currentStep
                          ? "bg-slate-900 text-white border-slate-900"
                          : i < currentStep
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-slate-400 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          i === currentStep
                            ? "bg-white/20 text-white"
                            : i < currentStep
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {i < currentStep ? "✓" : i + 1}
                      </span>
                      {step}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── STEP 0: Profile ─── */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  {/* Photo Upload */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 pb-3 border-b border-gray-100">
                      Photo
                    </p>
                    <div className="flex items-center gap-5">
                      <div
                        onClick={() =>
                          document.getElementById("fileInput").click()
                        }
                        className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0 hover:border-gray-400 transition-colors"
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-7 h-7 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="8" r="3" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() =>
                            document.getElementById("fileInput").click()
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          disabled={uploading}
                        >
                          {uploading ? (
                            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          )}
                          {uploading ? "Uploading..." : "Choose photo"}
                        </button>
                        <p className="text-xs text-gray-400 mt-1.5">
                          JPG, PNG up to 5MB
                        </p>
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUpload(e.target.files[0])}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-100">
                      Basic Info
                    </p>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        Full Name
                      </label>
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Full Name"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        Role / Job Title
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Frontend Developer"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        Professional Summary
                      </label>
                      <textarea
                        name="summary"
                        value={form.summary}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Briefly describe who you are and what you bring..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        Education
                      </label>
                      <input
                        name="education"
                        value={form.education}
                        onChange={handleChange}
                        placeholder="e.g. B.Sc Computer Science, Universitas Indonesia"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Next: Experience →
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 1: Experience ─── */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-100 mb-4">
                      Work Experience
                    </p>

                    {experiences.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No experience added yet.
                      </p>
                    )}

                    {experiences.map((exp, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-3 relative"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {exp.company || "New Experience"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {exp.position || "Position"}
                            </p>
                          </div>
                          <button
                            onClick={() => removeExperience(index)}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-sm"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">
                              Company
                            </label>
                            <input
                              name="company"
                              value={exp.company}
                              onChange={(e) => handleExpChange(index, e)}
                              placeholder="Company name"
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">
                              Position
                            </label>
                            <input
                              name="position"
                              value={exp.position}
                              onChange={(e) => handleExpChange(index, e)}
                              placeholder="Your role"
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">
                              Start date
                            </label>
                            <input
                              type="date"
                              name="startDate"
                              value={exp.startDate}
                              onChange={(e) => handleExpChange(index, e)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">
                              End date
                            </label>
                            <input
                              type="date"
                              name="endDate"
                              value={exp.endDate}
                              onChange={(e) => handleExpChange(index, e)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-1 block">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={exp.description}
                            onChange={(e) => handleExpChange(index, e)}
                            rows={2}
                            placeholder="Describe your responsibilities..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors resize-none"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addExperience}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    >
                      <span className="text-lg leading-none">+</span> Add
                      experience
                    </button>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="px-5 py-2.5 border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Next: Skills →
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Skills ─── */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-100 mb-4">
                      Skills & Technologies
                    </p>

                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        Add a skill
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addSkill()}
                          placeholder="e.g. React, Node.js, Figma..."
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:bg-white transition-colors"
                        />
                        <button
                          onClick={addSkill}
                          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.length === 0 && (
                        <p className="text-sm text-gray-400">
                          No skills added yet.
                        </p>
                      )}
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-700"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-gray-400 hover:text-gray-700 text-base leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 pb-3 border-b border-gray-100 mb-4">
                      Preview
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      {preview && (
                        <img
                          src={preview}
                          className="w-14 h-14 rounded-full object-cover border border-gray-100"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {form.title || "—"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {form.education || "—"}
                        </p>
                      </div>
                    </div>
                    {form.summary && (
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                        {form.summary}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">
                          Experience
                        </p>
                        <p className="font-medium text-gray-800">
                          {experiences.length} entry(s)
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Skills</p>
                        <p className="font-medium text-gray-800">
                          {skills.length} skill(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 border border-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Save CV ✓
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 fade-up">
              <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-3xl p-6 shadow-sm lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Live Preview
                  </p>
                  <span className="text-xs text-slate-400">
                    {completedCount}/{progressItems.length} done
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 rounded-full transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No photo</span>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {form.title || "Untitled CV"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {form.education || "Education not set"}
                    </p>
                  </div>
                </div>

                {form.summary && (
                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    {form.summary}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    <p className="text-[11px] text-slate-400">Experience</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {experiences.length} entries
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    <p className="text-[11px] text-slate-400">Skills</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {skills.length} items
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Highlight Skills
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {topSkills.length === 0 ? (
                      <span className="text-xs text-slate-400">
                        Add skills to see highlights
                      </span>
                    ) : (
                      topSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Latest Experience
                </p>
                {latestExperience ? (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {latestExperience.position || "Untitled role"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {latestExperience.company || "Company not set"}
                    </p>
                    {latestExperience.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                        {latestExperience.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-3">
                    Belum ada experience.
                  </p>
                )}
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Checklist
                </p>
                <div className="mt-3 grid gap-2 text-sm">
                  {progressItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"
                    >
                      <span className="text-slate-600">{item.label}</span>
                      <span
                        className={`text-xs font-semibold ${
                          item.done ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {item.done ? "Done" : "Todo"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
