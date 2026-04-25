import type { ReactNode } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";

type FocusedRelatedLink = {
  href: string;
  label: string;
  icon?: IconType;
};

type FocusedContentDetailProps = {
  articleId?: string;
  badgeLabel: string;
  badgeIcon?: IconType;
  source?: string;
  arabic: string;
  transliteration?: string;
  bodyContent?: ReactNode;
  audioControl: ReactNode;
  actionButtons: ReactNode;
  nextAction: ReactNode;
  relatedTitle?: string;
  relatedLinks?: FocusedRelatedLink[];
  shareCard?: ReactNode;
};

export default function FocusedContentDetail({
  articleId,
  badgeLabel,
  badgeIcon: BadgeIcon,
  source,
  arabic,
  transliteration,
  bodyContent,
  audioControl,
  actionButtons,
  nextAction,
  relatedTitle,
  relatedLinks = [],
  shareCard,
}: FocusedContentDetailProps) {
  return (
    <article id={articleId} className="mt-4">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-700)]">
          {BadgeIcon ? <BadgeIcon className="text-[1rem] text-[var(--sage-500)]" /> : null}
          {badgeLabel}
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[28px] bg-[var(--surface-soft)] px-6 py-8 text-center shadow-[var(--shadow-soft)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--sage-200)] to-transparent" />

        {source ? (
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--sage-500)]">
              {source}
            </span>
          </div>
        ) : null}

        <div className="mb-6">
          <p
            dir="rtl"
            lang="ar"
            className="text-right text-[2.35rem] leading-[1.85] text-[var(--ink-900)] [font-family:var(--font-arabic)] sm:text-[3rem]"
          >
            {arabic}
          </p>
        </div>

        <div className="mb-6 flex justify-center">{audioControl}</div>

        {transliteration ? (
          <p className="mx-auto mb-6 max-w-xl text-base italic leading-8 text-[var(--ink-700)]">
            {transliteration}
          </p>
        ) : null}

        <div className="mx-auto mb-6 h-px w-12 bg-[color:rgba(114,121,115,0.45)]" />

        {bodyContent}
      </div>

      {actionButtons}

      {nextAction}

      {relatedLinks.length > 0 ? (
        <div className="mt-8 text-center">
          {relatedTitle ? (
            <h2 className="text-[1.6rem] font-medium tracking-[-0.03em] text-[var(--ink-900)] [font-family:var(--font-display)]">
              {relatedTitle}
            </h2>
          ) : null}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {relatedLinks.map((relatedLink) => {
              const RelatedIcon = relatedLink.icon;

              return (
                <Link
                  key={relatedLink.href}
                  href={relatedLink.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-strong)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-700)]"
                >
                  {RelatedIcon ? (
                    <RelatedIcon className="text-[1rem] text-[var(--sage-500)]" />
                  ) : null}
                  {relatedLink.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {shareCard}
    </article>
  );
}
