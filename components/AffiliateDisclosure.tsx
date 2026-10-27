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
      <div className={`font-mono text-[11px] text-gray-400 leading-relaxed space-y-1 ${className}`}>
        <p className="text-white font-bold">
          <span className="text-white">Transparency Disclosure:</span> {disclosureText}
        </p>
        <p className="text-gray-400 text-[10px]">{pricingText}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur border border-blue-500/20 rounded-lg p-4 text-center space-y-1.5 ${className}`}>
        <h4 className="font-bold text-white text-xs">Transparency Disclosure</h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          {disclosureText}
        </p>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          {pricingText}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur border border-blue-500/20 rounded-lg p-6 ${className}`}
    >
      <h3 className="font-bold text-white mb-2">Transparency Disclosure</h3>
      <p className="text-sm text-gray-300">
        {disclosureText}
      </p>
      <p className="text-sm text-gray-300 mt-2">
        {pricingText}
      </p>
    </div>
  );
}
