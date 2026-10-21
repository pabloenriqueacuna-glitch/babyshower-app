export function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">🍼</span>
          <div>
            <h1 className="text-lg font-bold text-celeste-700 sm:text-xl">Lista de Regalos para Emilia</h1>
            <p className="text-xs text-gray-500">Baby Shower</p>
          </div>
        </div>
        <a
          href="#admin"
          className="rounded-full border border-celeste-300 px-3 py-1 text-xs font-medium text-celeste-700 transition hover:bg-celeste-50"
        >
          Admin
        </a>
      </div>
    </header>
  )
}
