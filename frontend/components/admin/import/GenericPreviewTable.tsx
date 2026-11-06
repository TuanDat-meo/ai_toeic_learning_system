'use client';

import { useState } from 'react';
import { Eye, FileText, Image as ImageIcon, Volume2, X } from 'lucide-react';
import type { ImportPreviewItem } from '@/lib/api/content-import';
import { displayName, itemStatus } from './utils';

interface GenericPreviewTableProps {
  items: ImportPreviewItem[];
}

export function GenericPreviewTable({ items }: GenericPreviewTableProps) {
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Dòng</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 min-w-[280px]">Dữ liệu chuẩn hóa</th>
            <th className="px-4 py-3 min-w-[220px]">Media (Ảnh & Audio)</th>
            <th className="px-4 py-3">Lỗi / cảnh báo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const status = itemStatus(item.status);
            const data = (item.normalizedData ?? item.rawData ?? {}) as Record<string, unknown>;
            const audioUrl = (data.audioUrl ?? data.audioURL) as string | undefined;
            const imageUrl = (data.imageUrl ?? data.imageURL ?? data.image) as string | undefined;
            const contentText = (data.content ?? data.transcript ?? data.questionText ?? data.description) as string | undefined;

            return (
              <tr key={item.id} className="align-top hover:bg-slate-50/50 transition">
                <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-500">
                  {item.rowNumber}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.classes}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">{displayName(item)}</p>
                      {data.part ? (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                          {String(data.part)}
                        </span>
                      ) : null}
                      {data.difficulty ? (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {String(data.difficulty)}
                        </span>
                      ) : null}
                    </div>

                    {contentText ? (
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {contentText}
                      </p>
                    ) : null}

                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs font-medium text-blue-700 hover:underline">
                        Xem JSON chi tiết
                      </summary>
                      <pre className="mt-2 max-h-52 overflow-auto rounded-lg bg-slate-50 p-2 text-[11px] leading-5 text-slate-700 font-mono">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </td>

                {/* Cột Media: Hiển thị Thumbnail ảnh và Audio player nếu có */}
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    {imageUrl ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ url: imageUrl, title: displayName(item) })}
                          className="group relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 hover:border-blue-400"
                          title="Bấm để xem ảnh phóng to"
                        >
                          <img
                            src={imageUrl}
                            alt="Media Preview"
                            className="h-full w-full object-cover transition group-hover:scale-105"
                            onError={(e) => {
                              // Fallback nếu ảnh không load được
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 transition group-hover:opacity-100">
                            <Eye size={16} className="text-white drop-shadow-md" />
                          </div>
                        </button>
                        <div className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                            <ImageIcon size={13} className="text-blue-600 shrink-0" />
                            Hình ảnh minh họa
                          </span>
                          <p className="truncate text-[10px] text-slate-400">{imageUrl}</p>
                        </div>
                      </div>
                    ) : null}

                    {audioUrl ? (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                          <Volume2 size={13} className="text-emerald-600 shrink-0" />
                          Audio phát âm / đọc bài
                        </span>
                        <audio
                          controls
                          src={audioUrl}
                          className="h-7 w-full max-w-[220px]"
                          preload="none"
                        >
                          Trình duyệt không hỗ trợ audio player.
                        </audio>
                      </div>
                    ) : null}

                    {!imageUrl && !audioUrl ? (
                      <span className="text-xs text-slate-400">Không có media</span>
                    ) : null}
                  </div>
                </td>

                <td className="max-w-[260px] px-4 py-3">
                  {item.errors.length ? (
                    <ul className="space-y-1 text-xs leading-5 text-red-700">
                      {item.errors.map((itemError, idx) => (
                        <li key={idx}>• {itemError}</li>
                      ))}
                    </ul>
                  ) : item.status === 'DUPLICATE' ? (
                    <p className="text-xs leading-5 text-amber-700">
                      {item.duplicateOfContentId
                        ? 'Đã tồn tại trong kho nội dung.'
                        : 'Trùng với một dòng khác trong cùng file.'}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                Không tìm thấy dòng phù hợp với bộ lọc.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {/* Modal phóng to ảnh */}
      {previewImage ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h4 className="text-xs font-bold text-slate-800 truncate">{previewImage.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-4 flex items-center justify-center bg-slate-50">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-full max-w-full rounded-lg object-contain shadow-xs"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
