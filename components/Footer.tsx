export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.8rem+env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
      <div className="footer-shell pointer-events-auto rounded-[22px] px-5 py-3 text-base font-semibold">
        <span className="footer-muted">{`© ${year} Built by `}</span>
        <a
          href="https://moayaan.com"
          target="_blank"
          rel="noreferrer"
          className="footer-link cursor-pointer"
        >
          ♦moayaan.eth♦
        </a>
      </div>
    </div>
  );
}
