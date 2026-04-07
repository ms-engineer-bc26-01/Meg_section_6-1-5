"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type SkillCategory = {
  id: string;
  category: string;
  items: string[];
};

const defaultSkills: SkillCategory[] = [
  {
    id: "1",
    category: "業務スキル",
    items: [
      "接客・電話応対",
      "小型旋盤操作",
      "図面読解（μ単位）",
      "検査機器操作",
      "3D CAD / PowerBI",
      "Word / Excel / Access / PowerPoint",
      "経理・契約業務",
      "情報セキュリティ知識",
      "医療・リハビリ知識",
    ],
  },
  {
    id: "2",
    category: "その他スキル",
    items: [
      "栄養知識",
      "楽器演奏（ピアノ・打楽器・サックス）",
      "アカペラ編曲・譜面作成",
      "英語対応（通訳・翻訳）",
    ],
  },
  {
    id: "3",
    category: "資格",
    items: [
      "普通自動車免許（AT限定）",
      "書道初段",
      "実用英語技能検定2級",
    ],
  },
];

export function SkillsSection() {
  const [skills, setSkills] = useState<SkillCategory[]>(defaultSkills);

  useEffect(() => {
    axios
      .get("/api/skills")
      .then((res) => {
        if (res.data?.length > 0) setSkills(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="section-title">Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skills.map((category) => (
          <div key={category.id} className="card">
            <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider border-b border-accent pb-2">
              {category.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((item, i) => (
                <span
                  key={i}
                  className="text-xs bg-light text-gray-700 px-2 py-1 rounded-full border border-gray-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
