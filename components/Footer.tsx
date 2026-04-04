import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.8rem+env(safe-area-inset-bottom))] z-20 flex justify-center px-4"
      data-nosnippet
    >
      <div className="footer-shell pointer-events-auto rounded-[20px] px-4 py-2 text-xs font-semibold">
        <span className="footer-muted">{`© ${year} `}</span>
        <Link
          href="https://moayaan.com"
          target="_blank"
          rel="noreferrer"
          className="footer-link cursor-pointer"
        >
          ♦moayaan.eth♦
        </Link>
      </div>
    </div>
  );
}
