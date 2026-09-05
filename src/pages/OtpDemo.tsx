import { useState } from "react"
import { OtpAnimation } from "../components/OtpAnimation"

export function OtpDemo() {
  const [digits, setDigits] = useState<string[]>(["4", "7", "1", "9"])
  const [phone, setPhone] = useState("+1 415 ••• 0142")
  const [key, setKey] = useState(0)
  const [loop, setLoop] = useState(false)
  const [variant, setVariant] = useState<'success' | 'error'>('success')

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">OTP Animation — Demo</h1>
        <p className="mt-1 text-sm text-ink-soft">
          1:1 rebuild of <span className="font-mono text-xs">WhatsApp Video 2026-08-26 9.34.19 PM.mp4</span> — 5.33s, 60fps, dark verify flow.
          Component: <span className="font-mono text-xs">src/components/OtpAnimation.tsx</span>
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            Digits
            <input
              value={digits.join("")}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                if (v.length >= 2) setDigits(v.split(""))
                if (!v) setDigits(["4", "7", "1", "9"])
              }}
              maxLength={6}
              className="h-9 w-28 rounded-xl border border-line bg-primary-lighter/60 px-3 text-center font-mono text-sm font-semibold text-ink focus:border-primary focus:bg-white focus:outline-none"
              placeholder="4719"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9 w-44 rounded-xl border border-line bg-primary-lighter/60 px-3 text-sm text-ink focus:border-primary focus:bg-white focus:outline-none"
              placeholder="+1 415 ••• 0142"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="accent-primary" /> Loop
          </label>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            ↺ Replay
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-soft">Result:</span>
          <button
            onClick={() => { setVariant('success'); setKey(k=>k+1)}}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${variant==='success' ? 'bg-[#0B3D2E] text-[#00D9A3] ring-[#00D9A3]' : 'bg-white text-ink-soft ring-line hover:ring-primary'}`}
          >
            ✓ Success (green)
          </button>
          <button
            onClick={() => { setVariant('error'); setKey(k=>k+1)}}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${variant==='error' ? 'bg-[#2A0F13] text-[#FF3B42] ring-[#FF3B42]' : 'bg-white text-ink-soft ring-line hover:ring-primary'}`}
          >
            ✕ Error (red)
          </button>
        </div>

        <div className="mt-6 flex justify-center rounded-2xl bg-[#070A0F] p-6">
          <OtpAnimation key={`${key}-${digits.join("")}-${loop}-${variant}`} digits={digits} phone={phone} autoPlay loop={loop} width={360} variant={variant} />
        </div>

        <p className="mt-4 text-center text-xs text-ink-soft">
          Timeline: idle → d1(4) → d2(7) → d3(1) → d4(9) → toCircle(diamond) → spin(360°) → reorder → {variant==='error' ? 'red error + shake → ✕ Verification failed' : 'teal success → ✓ Verified successfully'} → merge
          <br />
          Try <strong style={{color: variant==='error' ? '#FF3B42' : '#00D9A3'}}>{variant==='error' ? 'Error (red + X)' : 'Success (green + tick)'}</strong> — variant prop drives color + icon. Standalone at <span className="font-mono">otp animation/index.html</span>
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-ink-soft sm:p-6">
        <p className="font-semibold text-ink">How to use in code</p>
        <pre className="mt-2 overflow-auto rounded-xl bg-ink p-3 text-xs leading-5 text-white">
{`import { OtpAnimation } from "../components/OtpAnimation"

// Success (correct OTP)
<OtpAnimation digits={["4","7","1","9"]} phone="+1 415 ••• 0142" variant="success" autoPlay width={360} />

// Error (wrong OTP) — red + X + shake
<OtpAnimation digits={["4","7","1","9"]} phone="+1 415 ••• 0142" variant="error" autoPlay width={360} />`}
        </pre>
      </div>
    </div>
  )
}
