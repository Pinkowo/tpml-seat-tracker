interface LocationPromptProps {
  onRequestPermission: () => void;
}

export const LocationPrompt = ({ onRequestPermission }: LocationPromptProps) => {
  return (
    <div className="rounded-xl bg-[rgba(253,133,58,0.1)] p-4 text-sm text-[#FD853A]">
      <p className="font-semibold">需要定位權限以使用距離排序</p>
      <p className="mt-1 text-xs text-[#FD853A]/80">
        請允許定位權限後重新整理頁面，或手動改用其他排序依據。
      </p>
      <button
        type="button"
        onClick={onRequestPermission}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        再次請求定位
      </button>
    </div>
  );
};
