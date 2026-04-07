"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { getAuthenticatedAxios } from "@/lib/api";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import axios from "axios";

type ProfileForm = {
  name: string;
  nameEn: string;
  birthDate: string;
  birthPlace: string;
  bio: string;
};

type Achievement = {
  id: string;
  company: string;
  roles: string[];
  note: string;
  order: number;
};

type AchievementForm = {
  company: string;
  rolesText: string;
  note: string;
  order: number;
};

type SkillCategory = {
  id: string;
  category: string;
  items: string[];
  order: number;
};

type SkillCategoryForm = {
  category: string;
  itemsText: string;
  order: number;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const EMPTY_ACHIEVEMENT_FORM: AchievementForm = { company: "", rolesText: "", note: "", order: 0 };
const EMPTY_SKILL_FORM: SkillCategoryForm = { category: "", itemsText: "", order: 0 };

export default function AdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "achievements" | "skills" | "contacts">("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // プロフィール
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    nameEn: "",
    birthDate: "",
    birthPlace: "",
    bio: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 実績
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoaded, setAchievementsLoaded] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [achievementForm, setAchievementForm] = useState<AchievementForm>(EMPTY_ACHIEVEMENT_FORM);
  const [showNewAchievementForm, setShowNewAchievementForm] = useState(false);

  // スキル
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<SkillCategoryForm>(EMPTY_SKILL_FORM);
  const [showNewSkillForm, setShowNewSkillForm] = useState(false);

  // お問い合わせ
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  // 未認証チェック
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/admin/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // プロフィール取得
  useEffect(() => {
    axios.get("/api/profile").then((res) => {
      if (res.data) {
        setProfileForm({
          name: res.data.name ?? "",
          nameEn: res.data.nameEn ?? "",
          birthDate: res.data.birthDate ?? "",
          birthPlace: res.data.birthPlace ?? "",
          bio: res.data.bio ?? "",
        });
        if (res.data.imageUrl) setImagePreview(res.data.imageUrl);
      }
    }).catch(() => {});
  }, []);

  // 実績取得（タブアクティブ時）
  useEffect(() => {
    if (activeTab === "achievements" && !achievementsLoaded) {
      axios.get("/api/achievements").then((res) => {
        setAchievements(res.data ?? []);
        setAchievementsLoaded(true);
      }).catch(() => {});
    }
  }, [activeTab, achievementsLoaded]);

  // スキル取得（タブアクティブ時）
  useEffect(() => {
    if (activeTab === "skills" && !skillsLoaded) {
      axios.get("/api/skills").then((res) => {
        setSkills(res.data ?? []);
        setSkillsLoaded(true);
      }).catch(() => {});
    }
  }, [activeTab, skillsLoaded]);

  // お問い合わせ取得（タブアクティブ時）
  useEffect(() => {
    if (activeTab === "contacts" && !contactsLoaded) {
      (async () => {
        try {
          const api = await getAuthenticatedAxios();
          const res = await api.get("/api/admin/contacts");
          setContacts(res.data ?? []);
          setContactsLoaded(true);
        } catch {}
      })();
    }
  }, [activeTab, contactsLoaded]);

  const handleLogout = async () => {
    await signOut(auth);
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
    router.push("/admin/login");
  };

  // ─── プロフィール ────────────────────────────────────────────

  const handleProfileSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const api = await getAuthenticatedAxios();
      await api.put("/api/admin/profile", profileForm);
      setMessage({ type: "success", text: "プロフィールを更新しました。" });
    } catch {
      setMessage({ type: "error", text: "更新に失敗しました。" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);
    try {
      const api = await getAuthenticatedAxios();
      await api.post("/api/admin/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({ type: "success", text: "画像をアップロードしました。" });
    } catch {
      setMessage({ type: "error", text: "画像アップロードに失敗しました。" });
    }
  };

  // ─── 実績 ──────────────────────────────────────────────────

  const startEditAchievement = (a: Achievement) => {
    setEditingAchievementId(a.id);
    setAchievementForm({ company: a.company, rolesText: a.roles.join("\n"), note: a.note ?? "", order: a.order });
    setShowNewAchievementForm(false);
  };

  const cancelEditAchievement = () => {
    setEditingAchievementId(null);
    setAchievementForm(EMPTY_ACHIEVEMENT_FORM);
  };

  const handleAchievementSave = async (id: string) => {
    setLoading(true);
    setMessage(null);
    const roles = achievementForm.rolesText.split("\n").map((s) => s.trim()).filter(Boolean);
    try {
      const api = await getAuthenticatedAxios();
      const res = await api.put(`/api/admin/achievements/${id}`, {
        company: achievementForm.company,
        roles,
        note: achievementForm.note,
        order: achievementForm.order,
      });
      setAchievements((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      setEditingAchievementId(null);
      setAchievementForm(EMPTY_ACHIEVEMENT_FORM);
      setMessage({ type: "success", text: "実績を更新しました。" });
    } catch {
      setMessage({ type: "error", text: "更新に失敗しました。" });
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementCreate = async () => {
    setLoading(true);
    setMessage(null);
    const roles = achievementForm.rolesText.split("\n").map((s) => s.trim()).filter(Boolean);
    try {
      const api = await getAuthenticatedAxios();
      const res = await api.post("/api/admin/achievements", {
        company: achievementForm.company,
        roles,
        note: achievementForm.note,
        order: achievementForm.order,
      });
      setAchievements((prev) => [...prev, res.data]);
      setShowNewAchievementForm(false);
      setAchievementForm(EMPTY_ACHIEVEMENT_FORM);
      setMessage({ type: "success", text: "実績を追加しました。" });
    } catch {
      setMessage({ type: "error", text: "追加に失敗しました。" });
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementDelete = async (id: string) => {
    if (!confirm("この実績を削除しますか？")) return;
    setMessage(null);
    try {
      const api = await getAuthenticatedAxios();
      await api.delete(`/api/admin/achievements/${id}`);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      setMessage({ type: "success", text: "実績を削除しました。" });
    } catch {
      setMessage({ type: "error", text: "削除に失敗しました。" });
    }
  };

  // ─── スキル ────────────────────────────────────────────────

  const startEditSkill = (s: SkillCategory) => {
    setEditingSkillId(s.id);
    setSkillForm({ category: s.category, itemsText: s.items.join("\n"), order: s.order });
    setShowNewSkillForm(false);
  };

  const cancelEditSkill = () => {
    setEditingSkillId(null);
    setSkillForm(EMPTY_SKILL_FORM);
  };

  const handleSkillSave = async (id: string) => {
    setLoading(true);
    setMessage(null);
    const items = skillForm.itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
    try {
      const api = await getAuthenticatedAxios();
      const res = await api.put(`/api/admin/skills/${id}`, {
        category: skillForm.category,
        items,
        order: skillForm.order,
      });
      setSkills((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      setEditingSkillId(null);
      setSkillForm(EMPTY_SKILL_FORM);
      setMessage({ type: "success", text: "スキルを更新しました。" });
    } catch {
      setMessage({ type: "error", text: "更新に失敗しました。" });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillCreate = async () => {
    setLoading(true);
    setMessage(null);
    const items = skillForm.itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
    try {
      const api = await getAuthenticatedAxios();
      const res = await api.post("/api/admin/skills", {
        category: skillForm.category,
        items,
        order: skillForm.order,
      });
      setSkills((prev) => [...prev, res.data]);
      setShowNewSkillForm(false);
      setSkillForm(EMPTY_SKILL_FORM);
      setMessage({ type: "success", text: "スキルを追加しました。" });
    } catch {
      setMessage({ type: "error", text: "追加に失敗しました。" });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillDelete = async (id: string) => {
    if (!confirm("このスキルカテゴリを削除しますか？")) return;
    setMessage(null);
    try {
      const api = await getAuthenticatedAxios();
      await api.delete(`/api/admin/skills/${id}`);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      setMessage({ type: "success", text: "スキルを削除しました。" });
    } catch {
      setMessage({ type: "error", text: "削除に失敗しました。" });
    }
  };

  // ─── お問い合わせ ──────────────────────────────────────────

  const handleMarkRead = async (id: string) => {
    try {
      const api = await getAuthenticatedAxios();
      await api.patch(`/api/admin/contacts/${id}/read`);
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, read: true } : c)));
    } catch {
      setMessage({ type: "error", text: "既読処理に失敗しました。" });
    }
  };

  // ─── 共通フォームUI ────────────────────────────────────────

  const renderAchievementForm = (
    form: AchievementForm,
    onChange: (f: AchievementForm) => void,
    onSave: () => void,
    onCancel: () => void,
  ) => (
    <div className="mt-3 border border-accent rounded-md p-4 space-y-3 bg-white">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">会社名</label>
        <input
          type="text"
          value={form.company}
          onChange={(e) => onChange({ ...form, company: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">役割（1行に1つ）</label>
        <textarea
          rows={4}
          value={form.rolesText}
          onChange={(e) => onChange({ ...form, rolesText: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">補足（任意）</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => onChange({ ...form, note: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">表示順</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => onChange({ ...form, order: Number(e.target.value) })}
          className="w-24 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={loading} className="btn-primary text-sm py-1.5 disabled:opacity-60">
          {loading ? "保存中..." : "保存する"}
        </button>
        <button onClick={onCancel} className="btn-secondary text-sm py-1.5">
          キャンセル
        </button>
      </div>
    </div>
  );

  const renderSkillForm = (
    form: SkillCategoryForm,
    onChange: (f: SkillCategoryForm) => void,
    onSave: () => void,
    onCancel: () => void,
  ) => (
    <div className="mt-3 border border-accent rounded-md p-4 space-y-3 bg-white">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ名</label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => onChange({ ...form, category: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">スキル項目（1行に1つ）</label>
        <textarea
          rows={5}
          value={form.itemsText}
          onChange={(e) => onChange({ ...form, itemsText: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">表示順</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => onChange({ ...form, order: Number(e.target.value) })}
          className="w-24 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={loading} className="btn-primary text-sm py-1.5 disabled:opacity-60">
          {loading ? "保存中..." : "保存する"}
        </button>
        <button onClick={onCancel} className="btn-secondary text-sm py-1.5">
          キャンセル
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: "profile" as const, label: "プロフィール" },
    { id: "achievements" as const, label: "実績" },
    { id: "skills" as const, label: "スキル" },
    { id: "contacts" as const, label: "お問い合わせ" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif font-bold text-lg">管理画面</h1>
        <button
          onClick={handleLogout}
          className="text-sm opacity-80 hover:opacity-100 transition-opacity"
        >
          ログアウト
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* タブ */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(null); }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* メッセージ */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* プロフィールタブ */}
        {activeTab === "profile" && (
          <div className="card space-y-5">
            <h2 className="font-bold text-primary">プロフィール編集</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロフィール画像
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-accent">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">👤</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-sm py-2"
                >
                  画像を変更
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {(
              [
                { key: "name", label: "名前（日本語）" },
                { key: "nameEn", label: "名前（英語）" },
                { key: "birthDate", label: "生年月日" },
                { key: "birthPlace", label: "出身地" },
              ] as { key: keyof ProfileForm; label: string }[]
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={profileForm[key]}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介文</label>
              <textarea
                rows={5}
                value={profileForm.bio}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="btn-primary disabled:opacity-60"
            >
              {loading ? "保存中..." : "保存する"}
            </button>
          </div>
        )}

        {/* 実績タブ */}
        {activeTab === "achievements" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-primary">実績編集</h2>
              <button
                onClick={() => { setShowNewAchievementForm(true); setEditingAchievementId(null); setAchievementForm(EMPTY_ACHIEVEMENT_FORM); }}
                className="btn-secondary text-sm py-1.5"
              >
                + 追加
              </button>
            </div>

            {showNewAchievementForm && renderAchievementForm(
              achievementForm,
              setAchievementForm,
              handleAchievementCreate,
              () => { setShowNewAchievementForm(false); setAchievementForm(EMPTY_ACHIEVEMENT_FORM); },
            )}

            {achievements.map((a) => (
              <div key={a.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent rounded-full inline-block flex-shrink-0" />
                      {a.company}
                    </h3>
                    <ul className="text-xs text-gray-600 mt-2 space-y-0.5 ml-4">
                      {a.roles.map((role, i) => (
                        <li key={i}>› {role}</li>
                      ))}
                    </ul>
                    {a.note && <p className="text-xs text-gray-400 italic mt-2">{a.note}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => editingAchievementId === a.id ? cancelEditAchievement() : startEditAchievement(a)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      {editingAchievementId === a.id ? "閉じる" : "編集"}
                    </button>
                    <button
                      onClick={() => handleAchievementDelete(a.id)}
                      className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {editingAchievementId === a.id && renderAchievementForm(
                  achievementForm,
                  setAchievementForm,
                  () => handleAchievementSave(a.id),
                  cancelEditAchievement,
                )}
              </div>
            ))}

            {achievementsLoaded && achievements.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">実績がありません。「+ 追加」から登録してください。</p>
            )}
          </div>
        )}

        {/* スキルタブ */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-primary">スキル編集</h2>
              <button
                onClick={() => { setShowNewSkillForm(true); setEditingSkillId(null); setSkillForm(EMPTY_SKILL_FORM); }}
                className="btn-secondary text-sm py-1.5"
              >
                + 追加
              </button>
            </div>

            {showNewSkillForm && renderSkillForm(
              skillForm,
              setSkillForm,
              handleSkillCreate,
              () => { setShowNewSkillForm(false); setSkillForm(EMPTY_SKILL_FORM); },
            )}

            {skills.map((s) => (
              <div key={s.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-primary border-b border-accent pb-1 mb-2">
                      {s.category}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {s.items.map((item, i) => (
                        <span key={i} className="text-xs bg-light text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => editingSkillId === s.id ? cancelEditSkill() : startEditSkill(s)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      {editingSkillId === s.id ? "閉じる" : "編集"}
                    </button>
                    <button
                      onClick={() => handleSkillDelete(s.id)}
                      className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {editingSkillId === s.id && renderSkillForm(
                  skillForm,
                  setSkillForm,
                  () => handleSkillSave(s.id),
                  cancelEditSkill,
                )}
              </div>
            ))}

            {skillsLoaded && skills.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">スキルがありません。「+ 追加」から登録してください。</p>
            )}
          </div>
        )}

        {/* お問い合わせタブ */}
        {activeTab === "contacts" && (
          <div className="space-y-3">
            <h2 className="font-bold text-primary">お問い合わせ一覧</h2>

            {contacts.map((c) => (
              <div
                key={c.id}
                className={`card cursor-pointer transition-shadow hover:shadow-md ${!c.read ? "border-l-4 border-l-accent" : ""}`}
                onClick={() => setExpandedContactId(expandedContactId === c.id ? null : c.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {!c.read && (
                        <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded-full flex-shrink-0">未読</span>
                      )}
                      <span className={`text-sm ${!c.read ? "font-bold text-gray-900" : "text-gray-700"} truncate`}>
                        {c.subject}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {c.name} &lt;{c.email}&gt; · {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    {expandedContactId === c.id ? "▲" : "▼"}
                  </span>
                </div>

                {expandedContactId === c.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{c.message}</p>
                    {!c.read && (
                      <button
                        onClick={() => handleMarkRead(c.id)}
                        className="btn-secondary text-xs py-1"
                      >
                        既読にする
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {contactsLoaded && contacts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">お問い合わせはありません。</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
