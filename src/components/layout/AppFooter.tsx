export function AppFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur-sm dark:border-[#30363d] dark:bg-[#161b22]/60">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 dark:text-[#6e7681]">TASKMASTER</p>
          <p className="text-center text-xs text-slate-400 dark:text-[#6e7681]">
            Built for{' '}
            <span className="font-medium text-slate-500 dark:text-[#8b949e]">GDC Technical Test</span>
            {' · '}
            Front End Developer Assessment
          </p>
          <p className="text-xs text-slate-400 dark:text-[#6e7681]">
            © {new Date().getFullYear()} Muhammad Rayhan Yovi
          </p>
        </div>
      </div>
    </footer>
  )
}
