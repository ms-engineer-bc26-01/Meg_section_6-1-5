import { ProfileSection } from "@/components/ProfileSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-light">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-16">
        {/* プロフィール */}
        <section id="profile">
          <ProfileSection />
        </section>

        {/* 実績 */}
        <section id="achievements">
          <AchievementsSection />
        </section>

        {/* スキル */}
        <section id="skills">
          <SkillsSection />
        </section>

        {/* コンタクト誘導 */}
        <section id="contact-cta" className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-primary mb-4">
            お問い合わせ
          </h2>
          <p className="text-gray-600 mb-6">
            お仕事のご依頼・ご相談はお気軽にどうぞ。
          </p>
          <Link href="/contact" className="btn-primary inline-block">
            お問い合わせフォームへ
          </Link>
        </section>
      </main>

      <footer className="bg-primary text-white text-center py-6 mt-16">
        <p className="text-sm opacity-80">
          © 2025 Megumi Natori. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
