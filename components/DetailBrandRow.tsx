import AppBrandRow from "@/components/AppBrandRow";

type DetailBrandRowProps = {
  className?: string;
};

export default function DetailBrandRow({
  className = "",
}: DetailBrandRowProps) {
  return <AppBrandRow className={className} showBackButton />;
}
