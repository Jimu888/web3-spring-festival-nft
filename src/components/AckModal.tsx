import React, { useEffect, useMemo, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const LS_KEY = 'sf_ack_non_investment_v1';

export function hasAcked(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAcked(): void {
  try {
    localStorage.setItem(LS_KEY, '1');
  } catch {
    // ignore
  }
}

const AckModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b14]/80 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
        <div className="p-5">
          <div className="text-white/90 font-semibold text-lg mb-2">确认提示</div>
          <div className="text-sm text-gray-200/80 leading-relaxed mb-4">
            为避免误解，请在继续前确认你已知晓：
          </div>

          <label className="flex gap-3 items-start rounded-xl border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-yellow-300"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span className="text-sm text-gray-100/90">
              我已知晓本NFT仅作纪念用途，无投资属性。
            </span>
          </label>

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-200/80 hover:bg-white/10"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (!checked) return;
                setAcked();
                onConfirm();
              }}
              disabled={!checked}
              className={
                'px-4 py-2 rounded-xl font-semibold ' +
                (checked
                  ? 'bg-gradient-to-r from-red-500/90 via-yellow-400/90 to-red-500/90 text-white border border-yellow-200/20'
                  : 'bg-white/5 text-gray-300/60 border border-white/10 cursor-not-allowed')
              }
            >
              确认继续
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AckModal;
