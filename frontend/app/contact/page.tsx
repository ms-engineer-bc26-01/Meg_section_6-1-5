import { ContactForm } from "@/components/ContactForm";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-light">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← トップに戻る
          </Link>
        </div>
        <h1 className="section-title">Contact</h1>
        <p className="text-gray-600 mb-8 text-sm">
          お仕事のご依頼・ご質問はこちらのフォームよりお気軽にお送りください。
          確認後、メールにてご連絡いたします。
        </p>
        <ContactForm />
      </main>
    </div>
  );
}
