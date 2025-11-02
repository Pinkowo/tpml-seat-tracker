interface FallbackBadgeProps {
  label?: string;
}

export const FallbackBadge = ({ label = '估' }: FallbackBadgeProps) => {
  return (
    <span className="inline-flex items-center rounded-full bg-[rgba(245,186,75,0.1)] px-3 py-1 text-xs font-semibold text-[#F5BA4B]">
      {label}
    </span>
  );
};
