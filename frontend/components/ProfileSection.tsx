"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

type ProfileData = {
  name: string;
  nameEn: string;
  birthDate: string;
  birthPlace: string;
  bio: string;
  imageUrl: string | null;
};

const defaultProfile: ProfileData = {
  name: "名取めぐみ",
  nameEn: "Megumi Natori",
  birthDate: "1976年2月16日",
  birthPlace: "山梨県北杜市",
  bio: `年子の姉・6学年差の双子の弟の4人姉弟の中で唯一、血液型/生まれた場所/高校/身長が全く異なる。
病弱で反抗期も激しく、母親から問題児扱いされる10代を過ごす。
学費を自力で賄うため無理な生活を送り倒れる → 危篤 → 休学。
復学直前に家業の工場が全焼し、東京から帰郷。就職氷河期の中で社会人デビュー。`,
  // /public/profile.jpg が存在すればデフォルト画像として表示する
  imageUrl: "/profile.jpg",
};

export function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    axios
      .get("/api/profile")
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .catch(() => {
        // APIが利用できない場合はデフォルト値を使用
      });
  }, []);

  return (
    <div>
      <h2 className="section-title">Profile</h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* プロフィール画像 */}
        <div className="flex-shrink-0">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-accent shadow-md">
            <Image
              src={profile.imageUrl ?? "/profile.jpg"}
              alt={profile.name}
              width={160}
              height={160}
              className="object-cover w-full h-full"
              onError={(e) => {
                // 画像が見つからない場合はフォールバック表示
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* プロフィール情報 */}
        <div className="flex-1">
          <h3 className="text-3xl font-serif font-bold text-primary mb-1">
            {profile.name}
          </h3>
          <p className="text-gray-500 mb-4">{profile.nameEn}</p>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
            <dt className="text-gray-500 font-medium">生年月日</dt>
            <dd className="text-gray-800">{profile.birthDate}</dd>
            <dt className="text-gray-500 font-medium">出身地</dt>
            <dd className="text-gray-800">{profile.birthPlace}</dd>
          </dl>

          <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            {profile.bio}
          </div>
        </div>
      </div>
    </div>
  );
}
