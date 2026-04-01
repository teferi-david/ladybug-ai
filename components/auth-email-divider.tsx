export function AuthEmailDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
        <span className="bg-card px-3 text-muted-foreground">Or continue with email</span>
      </div>
    </div>
  )
}
