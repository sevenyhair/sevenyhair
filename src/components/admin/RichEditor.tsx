"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MediaPicker } from "./media";

/**
 * 커스텀 페이지 본문 에디터 — Ignite 와 같은 Tiptap 구성 + HTML 소스 모드.
 * 저장할 때·보여줄 때 서버에서 sanitize-html 로 한 번 더 거른다 (script·style·이벤트 속성 제거).
 */
export default function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [source, setSource] = useState(value);
  const [picker, setPicker] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // SSR 에서 바로 그리면 hydration 이 어긋난다
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "내용을 입력하세요. 이미지는 위 버튼으로 넣습니다." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // 바깥에서 값이 바뀌면(되돌리기 등) 에디터에 반영
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  const toHtml = () => {
    setSource(editor?.getHTML() ?? value);
    setMode("html");
  };
  const toVisual = () => {
    editor?.commands.setContent(source, { emitUpdate: true });
    setMode("visual");
  };

  return (
    <div className="admin-editor overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b border-zinc-100 bg-white/95 px-2 py-1.5 backdrop-blur">
        {mode === "visual" && editor ? (
          <Toolbar editor={editor} onImage={() => setPicker(true)} />
        ) : (
          <span className="px-2 text-[12px] text-zinc-500">HTML 소스 편집 중 — 다시 편집 화면으로 돌아가면 반영됩니다</span>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={mode === "visual" ? toHtml : toVisual}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium ${
              mode === "html" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            HTML
          </button>
        </div>
      </div>
      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            onChange(e.target.value);
          }}
          spellCheck={false}
          className="block min-h-[360px] w-full resize-y bg-zinc-950 p-5 font-mono text-[13px] leading-relaxed text-zinc-100 outline-none"
        />
      )}
      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(url) => {
          editor?.chain().focus().setImage({ src: url }).run();
          setPicker(false);
        }}
      />
    </div>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
    >
      {icon}
    </button>
  );
  const sep = <span className="mx-1 h-5 w-px bg-zinc-200" />;
  const c = () => editor.chain().focus();
  return (
    <>
      {btn(editor.isActive("heading", { level: 2 }), () => c().toggleHeading({ level: 2 }).run(), <Heading2 className="h-4 w-4" />, "큰 제목")}
      {btn(editor.isActive("heading", { level: 3 }), () => c().toggleHeading({ level: 3 }).run(), <Heading3 className="h-4 w-4" />, "작은 제목")}
      {sep}
      {btn(editor.isActive("bold"), () => c().toggleBold().run(), <Bold className="h-4 w-4" />, "굵게")}
      {btn(editor.isActive("italic"), () => c().toggleItalic().run(), <Italic className="h-4 w-4" />, "기울임")}
      {btn(editor.isActive("underline"), () => c().toggleUnderline().run(), <UnderlineIcon className="h-4 w-4" />, "밑줄")}
      {sep}
      {btn(editor.isActive("bulletList"), () => c().toggleBulletList().run(), <List className="h-4 w-4" />, "목록")}
      {btn(editor.isActive("orderedList"), () => c().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />, "번호 목록")}
      {btn(editor.isActive("blockquote"), () => c().toggleBlockquote().run(), <Quote className="h-4 w-4" />, "인용")}
      {btn(false, () => c().setHorizontalRule().run(), <Minus className="h-4 w-4" />, "구분선")}
      {sep}
      {btn(editor.isActive({ textAlign: "left" }), () => c().setTextAlign("left").run(), <AlignLeft className="h-4 w-4" />, "왼쪽 정렬")}
      {btn(editor.isActive({ textAlign: "center" }), () => c().setTextAlign("center").run(), <AlignCenter className="h-4 w-4" />, "가운데 정렬")}
      {sep}
      {btn(
        editor.isActive("link"),
        () => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("링크 주소", prev ?? "https://");
          if (url === null) return;
          if (!url) c().unsetLink().run();
          else c().extendMarkRange("link").setLink({ href: url, target: /^https?:/.test(url) ? "_blank" : undefined }).run();
        },
        <LinkIcon className="h-4 w-4" />,
        "링크",
      )}
      {btn(false, onImage, <ImagePlus className="h-4 w-4" />, "이미지")}
      {sep}
      {btn(false, () => c().undo().run(), <Undo2 className="h-4 w-4" />, "실행 취소")}
      {btn(false, () => c().redo().run(), <Redo2 className="h-4 w-4" />, "다시 실행")}
    </>
  );
}
