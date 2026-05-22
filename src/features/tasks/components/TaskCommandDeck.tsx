export function TaskCommandDeck() {
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <p className="text-sm font-medium text-slate-500 dark:text-[#8b949e]">{currentDate}</p>
  )
}
