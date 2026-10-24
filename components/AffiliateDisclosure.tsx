import { AFFILIATE_CONFIG } from "@/config/affiliate";

interface AffiliateDisclosureProps {
  className?: string;
  variant?: "banner" | "compact" | "inline";
  showAmazon?: boolean;
}

export default function AffiliateDisclosure({
  className = "",
  variant = "banner",
}: AffiliateDisclosureProps) {
  const disclosureText = AFFILIATE_CONFIG.generalDisclosure || AFFILIATE_CONFIG.disclosure.generalStatement;
  const pricingText = AFFILIATE_CONFIG.pricingDisclaimer || AFFILIATE_CONFIG.disclosure.disclaimer;

  if (variant === "inline") {
    return (
      <div className={`font-mono text-[11px] text-muted leading-relaxed space-y-1 ${className}`}>
        <p className="text-ink font-bold">
          <span className="text-ink">Transparency Disclosure:</span> {disclosureText}
        </p>
        <p className="text-muted text-[10px]">{pricingText}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`border border-line/20 bg-paper p-3 sm:p-4 text-center space-y-1.5 ${className}`}>
        <p className="font-mono text-xs text-ink font-bold leading-relaxed">
          Transparency Disclosure: {disclosureText}
        </p>
        <p className="font-mono text-[10px] text-muted leading-relaxed">
          {pricingText}
        </p>
      </div>
    );
  }

  return (
    <aside
      aria-label="Affiliate Transparency Disclosure"
      className={`border border-line/20 bg-paper p-5 sm:p-6 text-center space-y-2.5 ${className}`}
    >
      <p className="font-mono text-xs sm:text-sm text-ink font-bold leading-relaxed max-w-2xl mx-auto">
        <span className="font-semibold text-ink">Transparency Disclosure:</span>{" "}
        {disclosureText}
      </p>
      <p className="font-mono text-[11px] text-muted max-w-2xl mx-auto leading-relaxed">
        {pricingText}
      </p>
    </aside>
  );
}
