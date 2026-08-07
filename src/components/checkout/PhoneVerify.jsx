import { useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import OtpInput from '../ui/OtpInput.jsx'
import { sendPhoneOtp, verifyPhoneOtp } from '../../api/auth.js'
import { useToast } from '../../context/ToastContext.jsx'
import { LIVE } from '../../api/client.js'

export default function PhoneVerify({ phone, onVerified, onBack }) {
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [channel, setChannel] = useState(null)

  const send = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await sendPhoneOtp(phone)
      setChannel(res?.channel || 'sms')
      setSent(true)
      setCooldown(30)
      toast(res?.channel === 'email' ? "SMS isn't set up yet — code sent to your email instead" : 'Code sent to your phone')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    send()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const confirm = async (value) => {
    setBusy(true)
    setError('')
    try {
      await verifyPhoneOtp(phone, value)
      onVerified()
    } catch (e) {
      setError(e.message)
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (code.length === 6 && !busy) confirm(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="max-w-sm">
      <h2 className="font-display text-[24px] leading-tight text-soot">Verify your number</h2>
      <p className="mt-2 text-[15px] text-smoke">
        {channel === 'email' ? (
          <>
            SMS isn't set up yet, so the code for <span className="text-ink">+91 {phone}</span> went to your email
            instead.
          </>
        ) : (
          <>
            The courier calls this number on delivery day. We sent a code to{' '}
            <span className="text-ink">+91 {phone}</span>.
          </>
        )}
      </p>

      <div className="mt-6">
        <OtpInput value={code} onChange={setCode} disabled={busy} invalid={Boolean(error)} />
        {error && <p className="mt-2 text-[13px] text-ember">{error}</p>}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          disabled={cooldown > 0 || busy || !sent}
          onClick={send}
          className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
        <button onClick={onBack} className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot">
          Change number
        </button>
      </div>

      {!LIVE && (
        <p className="mt-6 rounded-xl bg-ash px-3.5 py-2.5 text-[12px] text-smoke">
          Demo mode: any six digits work. Use 000000 to see the error state.
        </p>
      )}

      {busy && <Button loading size="block" className="mt-6">Checking</Button>}
    </div>
  )
}
