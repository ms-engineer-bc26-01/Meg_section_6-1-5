"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus("sending");
    try {
      await axios.post("/api/contact", data);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* お名前 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name", { required: "お名前を入力してください" })}
          type="text"
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="山田 太郎"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* メールアドレス */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email", {
            required: "メールアドレスを入力してください",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "正しいメールアドレスを入力してください",
            },
          })}
          type="email"
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* 件名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          件名 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("subject", { required: "件名を入力してください" })}
          type="text"
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="お仕事のご依頼"
        />
        {errors.subject && (
          <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
        )}
      </div>

      {/* メッセージ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メッセージ <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("message", {
            required: "メッセージを入力してください",
            minLength: { value: 10, message: "10文字以上入力してください" },
          })}
          rows={6}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          placeholder="ご用件をご記入ください..."
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "送信中..." : "送信する"}
      </button>

      {/* 結果メッセージ */}
      {status === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3 text-sm">
          ✓ メッセージを送信しました。ご連絡をお待ちください。
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          送信に失敗しました。時間をおいて再度お試しください。
        </div>
      )}
    </form>
  );
}
