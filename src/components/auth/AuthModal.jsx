import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Field, { Input } from '../ui/Field.jsx'
import OtpInput from '../ui/OtpInput.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { sendEmailOtp, verifyEmailOtp } from '../../api/auth.js'
import { isEmail } from '../../lib/validate.js'
import { LIVE } from '../../api/client.js'

export default function AuthModal() {
  const { authOpen, setAuthOpen, signIn } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!authOpen) {
      setStep('email')
      setCode('')
      setError('')
    }
  }, [authOpen])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const requestCode = async () => {
    if (!isEmail(email)) return setError('Enter a valid email address')
    setError('')
    setBusy(true)
    try {
      await sendEmailOtp(email.trim())
      setStep('code')
      setCooldown(30)
      toast('Code sent. Check your inbox.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const confirmCode = async (value = code) => {
    if (value.length !== 6) return setError('Enter all six digits')
    setError('')
    setBusy(true)
    try {
      const customer = await verifyEmailOtp(email.trim(), value)
      toast('Signed in')
      signIn(customer)
    } catch (e) {
      setError(e.message)
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  // Submit the moment the sixth digit lands — nobody wants to press a button here.
  useEffect(() => {
    if (step === 'code' && code.length === 6 && !busy) confirmCode(code)
     
  }, [code, step])

  return (
    <Modal open={authOpen} onClose={() => setAuthOpen(false)} title="Sign in" size="sm">
      <div className="p-7 sm:p-8">
        {step === 'email' ? (
          <>
            <h2 className="font-display text-[26px] leading-tight text-soot">Sign in to order</h2>
            <p className="mt-2 text-[15px] text-smoke">
              We send a six-digit code to your email. No password to remember.
            </p>

            <Field label="Email" id="email" error={error} className="mt-6">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                invalid={Boolean(error)}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && requestCode()}
                placeholder="you@example.com"
              />
            </Field>

            <Button onClick={requestCode} loading={busy} size="block" className="mt-5">
              Send code
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep('email')}
              className="mb-4 text-[13px] text-smoke underline underline-offset-4 hover:text-soot"
            >
              Use a different email
            </button>
            <h2 className="font-display text-[26px] leading-tight text-soot">Enter the code</h2>
            <p className="mt-2 text-[15px] text-smoke">
              Sent to <span className="text-ink">{email}</span>
            </p>

            <div className="mt-6">
              <OtpInput value={code} onChange={setCode} disabled={busy} invalid={Boolean(error)} />
              {error && <p className="mt-2 text-[13px] text-ember">{error}</p>}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                disabled={cooldown > 0 || busy}
                onClick={requestCode}
                className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot disabled:no-underline disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
              {busy && <span className="text-[13px] text-smoke">Checking…</span>}
            </div>

            {!LIVE && (
              <p className="mt-6 rounded-xl bg-ash px-3.5 py-2.5 text-[12px] text-smoke">
                Demo mode: any six digits work. Use 000000 to see the error state.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
