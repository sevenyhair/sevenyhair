import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@/components/Icons";
import { FooterColumns } from "@/components/SiteFooter";
import { getPost, getPosts, getShop } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

/**
 * 원본 블로그 글 템플릿 — 왼쪽 절반 고정 사진, 오른쪽 본문(상단 고정 패널 "Zurück zum Blog"),
 * 아래에 관련 글 3개와 오른쪽 절반 전용 푸터.
 */
export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [shop, post, all] = await Promise.all([getShop(), getPost(slug), getPosts()]);
  if (!post) notFound();
  const related = all.filter((p) => p.slug !== slug).slice(-3);

  return (
    <>
      <div className="split-media">
        <div className="post-image" style={{ "--bg": `url("${post.thumbnail}")` } as React.CSSProperties} />
      </div>
      <div className="split-content">
        <div className="post-panel">
          <Link href="/journal" className="post-back-link">
            <IconArrowLeft size={20} />
            <span className="link-v1">저널로 돌아가기</span>
          </Link>
        </div>
        <h1 className="post-heading">{post.title}</h1>
        {/* 본문 HTML 은 시드/어드민에서만 들어온다. 어드민을 붙일 때 sanitize-html 로 정제한다. */}
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.body }} />

        <h3 className="more-posts-heading">함께 보면 좋은 글</h3>
        {related.map((p) => (
          <div key={p.slug} className="post-card-v2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail} alt="" className="post-card-v2-image" />
            <div className="post-card-v2-info">
              <h4>{p.title}</h4>
              {p.excerpt && <p className="paragraph-small">{p.excerpt}</p>}
              <Link href={`/post/${p.slug}`} className="link-v2">
                더 보기
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="split-footer">
        <FooterColumns shop={shop} />
      </div>
    </>
  );
}
