import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaBan,
  FaBookOpen,
  FaChartLine,
  FaClock,
  FaCode,
  FaComments,
  FaDatabase,
  FaHeart,
  FaHouse,
  FaLandmark,
  FaLaptop,
  FaMicrochip,
  FaPlug,
  FaRepeat,
  FaScaleBalanced,
  FaScroll,
  FaShield,
  FaTriangleExclamation,
  FaUser,
  FaUserGraduate,
} from "react-icons/fa6";
import { SiHuggingface } from "react-icons/si";
import BrandWordmark from "@/components/BrandWordmark";
import JsonLd from "@/components/JsonLd";
import { createSeoMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/structured-data";

const pageTitle = "Alif-1.0";
const pageDescription =
  "Alif-1.0 is the first open-source Islamic AI model by ImanVibes, fine-tuned on Quran, Hadith, and Islamic history and coming soon to the app and API.";

const comingSoonBadges = [
  { label: "Chat in ImanVibes", icon: FaComments },
  { label: "API Access", icon: FaPlug },
] as const;

const trainingHighlights = [
  {
    value: "1,042",
    label: "instruction-response pairs",
    tone: "stat-sage",
    icon: FaDatabase,
  },
  {
    value: "783",
    label: "training steps across 3 epochs",
    tone: "stat-sand",
    icon: FaRepeat,
  },
  {
    value: "0.30",
    label: "final loss, down from 1.84",
    tone: "stat-sage",
    icon: FaChartLine,
  },
  {
    value: "~3 hrs",
    label: "free T4 training time",
    tone: "stat-sand",
    icon: FaClock,
  },
] as const;

const datasetCategories = [
  {
    title: "Quran dataset (~338 pairs)",
    icon: FaBookOpen,
    body:
      "Mood-based ayah guidance, Tawheed, Salah, Sabr, hope, anxiety, death, and afterlife, using Sahih International and Pickthall translations only.",
  },
  {
    title: "Hadith dataset (~300 pairs)",
    icon: FaScroll,
    body:
      "Built from Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, and more, with collection name, book number, and hadith number attached.",
  },
  {
    title: "Islamic history dataset (~400 pairs)",
    icon: FaLandmark,
    body:
      "Drawn from Ibn Kathir, Ibn Khaldun, Al-Tabari, and other classical scholars, spanning the life of the Prophet PBUH, Sahabah, Karbala, the Crusades from the Muslim perspective, the Ottoman and Mughal empires, and modern Islamic geopolitics.",
  },
];

const buildDetails = [
  {
    title: "Base model",
    icon: FaMicrochip,
    body: "Qwen3.5-2B by Alibaba, released under Apache 2.0.",
  },
  {
    title: "Fine-tuning method",
    icon: FaCode,
    body: "LoRA using the Unsloth library.",
  },
  {
    title: "Training platform",
    icon: FaLaptop,
    body: "Google Colab on a free T4 GPU plus Kaggle on free T4 x2 GPUs.",
  },
  {
    title: "AI assistance",
    icon: FaUser,
    body: "Dataset research support came from Zai by Zhipu AI and Claude by Anthropic.",
  },
];

const safetyPoints = [
  { text: "Never fabricates ayahs or hadiths.", icon: FaBan },
  {
    text: "Built-in responses against Islamophobia and extremism.",
    icon: FaShield,
  },
  {
    text: "Cites Quran 5:32 against any violence-related questions.",
    icon: FaScaleBalanced,
  },
  {
    text: "Respects all religions and does not speak negatively about other faiths.",
    icon: FaHeart,
  },
  {
    text: "Every response includes a beta disclaimer.",
    icon: FaTriangleExclamation,
  },
  {
    text: "Directs complex fiqh questions to qualified Islamic scholars.",
    icon: FaUserGraduate,
  },
];

const linkButtons = [
  {
    href: "https://huggingface.co/mdayaan1911/alif-1.0",
    label: "Explore on HuggingFace",
    icon: SiHuggingface,
    variant: "primary",
    external: true,
  },
  {
    href: "https://moayaan.com",
    label: "Developer",
    icon: FaUser,
    variant: "secondary",
    external: true,
  },
  {
    href: "/",
    label: "Go to Home",
    icon: FaHouse,
    variant: "secondary",
    external: false,
  },
] as const;

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${absoluteUrl("/alif")}#software`,
  name: "Alif-1.0",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/alif"),
  description: pageDescription,
  publisher: {
    "@id": `${absoluteUrl("/")}#organization`,
  },
  creator: {
    "@id": `${absoluteUrl("/")}#organization`,
  },
  isAccessibleForFree: true,
  softwareVersion: "1.0",
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  codeRepository: "https://huggingface.co/mdayaan1911/alif-1.0",
  featureList: [
    "Islamic instruction tuning across Quran, Hadith, and Islamic history",
    "Safety responses against extremism and fabricated citations",
    "Scholar-first disclaimers for complex fiqh questions",
  ],
  isBasedOn: "Qwen3.5-2B by Alibaba",
};

export const metadata: Metadata = createSeoMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/alif",
  imagePath: "/alif/opengraph-image",
  keywords: [
    "Alif-1.0",
    "Islamic AI model",
    "Open-source Islamic AI",
    "Qwen fine-tune",
    "Quran and Hadith AI",
  ],
});

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">{subtitle}</p>
      ) : null}
    </div>
  );
}

function CardLabelIcon({ icon: Icon }: { icon: IconType }) {
  return (
    <span className="pill-soft inline-flex size-8 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
      <Icon />
    </span>
  );
}

export default function AlifPage() {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-5">
        <JsonLd
          data={[
            getWebPageJsonLd({
              title: pageTitle,
              description: pageDescription,
              path: "/alif",
            }),
            getBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Alif-1.0", path: "/alif" },
            ]),
            softwareApplicationJsonLd,
          ]}
        />

        <section className="surface-panel rounded-[32px] p-5">
          <div className="flex items-center gap-4">
            <Image
              src="/icon2Circular.png"
              alt="ImanVibes icon"
              width={72}
              height={72}
              priority
              className="icon-ring rounded-full border"
            />
            <BrandWordmark wordmarkClassName="text-[1.35rem]" />
          </div>

          <h1 className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--ink-900)]">
            Alif-1.0
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-700)]">
            First Islamic AI Model by ImanVibes
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3" data-nosnippet>
            {comingSoonBadges.map((badge) => {
              const Icon = badge.icon;

              return (
                <div
                  key={badge.label}
                  className="surface-card cursor-default rounded-[24px] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--sage-700)]">
                      Coming soon
                    </p>
                    <span className="pill-soft inline-flex size-8 items-center justify-center rounded-full text-sm text-[var(--sage-700)]">
                      <Icon />
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ink-900)]">
                    {badge.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <SectionTitle
            title="About Alif-1.0"
            subtitle="An open-source Islamic model built for calm, grounded, citation-aware answers."
          />

          <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--ink-700)]">
            <p>
              Alif-1.0 is an open-source Islamic AI model fine-tuned on top of
              Qwen3.5-2B by Alibaba, trained on 1,042 carefully curated
              instruction-response pairs covering Quran, Hadith, and Islamic
              history.
            </p>
            <p>
              The name <span className="font-semibold text-[var(--ink-900)]">Alif</span>{" "}
              is the first letter of the Arabic alphabet, the first letter of
              Allah, and the first letter of Al-Quran.
            </p>
          </div>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <SectionTitle
            title="How Was Alif-1.0 Built?"
            subtitle="A compact fine-tune focused on Islamic source discipline rather than scale for the sake of scale."
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            {trainingHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className={`${item.tone} rounded-[24px] p-4`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-2xl font-semibold text-[var(--ink-900)]">
                      {item.value}
                    </p>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--surface-card)] text-sm text-[var(--sage-700)]">
                      <Icon />
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-700)]">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            {datasetCategories.map((category) => {
              const Icon = category.icon;

              return (
                <article key={category.title} className="surface-card rounded-[26px] p-4">
                  <div className="flex items-start gap-3">
                    <CardLabelIcon icon={Icon} />
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--ink-900)]">
                        {category.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">
                        {category.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            {buildDetails.map((detail) => {
              const Icon = detail.icon;

              return (
                <article key={detail.title} className="surface-card rounded-[26px] p-4">
                  <div className="flex items-start gap-3">
                    <CardLabelIcon icon={Icon} />
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--ink-900)]">
                        {detail.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-700)]">
                        {detail.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <SectionTitle
            title="Built-in Safety"
            subtitle="The model was tuned to stay cautious, cite responsibly, and defer when scholarship is needed."
          />

          <div className="mt-5 space-y-3">
            {safetyPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.text} className="surface-card rounded-[24px] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CardLabelIcon icon={Icon} />
                    <p className="text-sm leading-6 text-[var(--ink-900)]">
                      {point.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[32px] border border-[var(--gold-200)] bg-[var(--surface-soft)] p-5">
          <div className="flex items-center gap-3">
            <CardLabelIcon icon={FaTriangleExclamation} />
            <SectionTitle title="Disclaimer" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-900)]">
            Alif-1.0 is an experimental beta model fine-tuned on a small dataset
            of 1,042 pairs. Responses may be inaccurate or incomplete. Always
            verify important Islamic matters with a qualified Islamic scholar.
            ImanVibes and its creators accept no responsibility for any decisions
            made based on this model.
          </p>
        </section>

        <section className="surface-section mt-5 rounded-[32px] p-5">
          <SectionTitle
            title="Links"
            subtitle="The model page is live, while product integrations are still on the way."
          />

          <div className="mt-5 grid gap-3" data-nosnippet>
            {linkButtons.map((button) => {
              const Icon = button.icon;

              return (
                <Link
                  key={button.label}
                  href={button.href}
                  {...(button.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className={`cursor-pointer rounded-full px-4 py-3 text-center text-sm font-semibold ${
                    button.variant === "primary" ? "button-primary" : "button-secondary"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon className="text-[0.95rem]" />
                    <span>{button.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="pb-6 pt-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--sage-700)]">
            Alif-1.0 is open source under Apache 2.0 license
          </p>
        </section>
      </main>
    </div>
  );
}
