import { Header } from '@/components/layout/Header'
import { GameCard } from '@/features/games/components/GameCard'
import { useOddsGames } from '@/api/hooks/useOddsGames'

function App() {
  const { games, isLoading, isMock, lastUpdated } = useOddsGames()

  const updatedAt = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="min-h-svh" style={{ background: '#050505' }}>
      <Header />

      <main className="px-4 py-5 max-w-lg mx-auto">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h1 className="text-lg font-black tracking-tight text-white m-0">
              Chaos Rankings
            </h1>
            <p className="text-xs text-white/40 mt-0.5">
              NCAA Tournament · {games.length} live games
              {isMock && <span className="text-[#FFE600] ml-1">(demo)</span>}
            </p>
          </div>
          <span className="text-[11px] font-mono text-white/30">
            {isLoading ? 'updating…' : updatedAt ?? '30s refresh'}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} rank={index + 1} />
          ))}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-8 tracking-widest uppercase">
          Powered by Chaos · SickoGrid
        </p>
      </main>
    </div>
  )
}

export default App
