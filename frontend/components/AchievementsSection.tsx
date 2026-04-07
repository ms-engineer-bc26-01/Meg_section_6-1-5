"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Achievement = {
  id: string;
  company: string;
  roles: string[];
  note: string;
};

const defaultAchievements: Achievement[] = [
  {
    id: "1",
    company: "リゾートホテル（現 星野リゾート リゾナーレ八ヶ岳）",
    roles: ["電話交換手", "フロントバック（団体予約担当）", "会議・イベント対応", "レストラン・社員食堂（調理・接客補助）"],
    note: "部門を横断してマルチに対応。",
  },
  {
    id: "2",
    company: "精密部品製造・加工業",
    roles: ["部品加工・仕上げ", "図面読解・検品", "小型旋盤操作"],
    note: "家業で後継候補として勤務経験あり。",
  },
  {
    id: "3",
    company: "療養型医療施設",
    roles: ["看護助手（食事・入浴補助）", "リハビリ助手（送迎・訓練補助・機器対応）", "受付当直対応"],
    note: "患者の半数を単独対応するなど高い責任を担う。",
  },
  {
    id: "4",
    company: "半導体関連企業（IT部門）",
    roles: [
      "庶務代表（山梨エリア）",
      "基幹システム運用サポート",
      "経理・契約事務",
      "Accessによるデータ処理",
      "3D CAD教育システム開発サポート",
      "情報セキュリティ（ISO内部監査）",
    ],
    note: "現在は4部署の庶務統括＋交通安全委員を兼務。",
  },
];

export function AchievementsSection() {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);

  useEffect(() => {
    axios
      .get("/api/achievements")
      .then((res) => {
        if (res.data?.length > 0) setAchievements(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="section-title">Achievements</h2>
      <div className="space-y-6">
        {achievements.map((item) => (
          <div key={item.id} className="card hover:shadow-md transition-shadow duration-200">
            <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full inline-block" />
              {item.company}
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 mb-3 ml-4">
              {item.roles.map((role, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-1">›</span>
                  <span>{role}</span>
                </li>
              ))}
            </ul>
            {item.note && (
              <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">
                {item.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
