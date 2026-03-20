import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/onboarding/HeroBanner'
import { PushOptIn } from '@/components/onboarding/PushOptIn'
import { GameCard } from '@/features/games/components/GameCard'
import { SectionHeader } from '@/features/games/components/SectionHeader'
import { useGames } from '@/api/hooks/useGames'

type Tab = 'upcoming' | 'final'

function App() {
  const { groups, totalGames, isLoading, isMock, lastUpdated } = useGames()
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')

  const updatedAt = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  const upcomingCount = groups.upcoming.reduce((n, g) => n + g.games.length, 0)

  return (
    <div className="min-h-svh" style={{ background: '#050505' }}>
      <Header />
      <HeroBanner />
      <PushOptIn />

      <main className="px-4 py-5 max-w-lg mx-auto">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h1 className="text-lg font-black tracking-tight text-white m-0">
              Chaos Rankings
            </h1>
            <p className="text-xs text-white/40 mt-0.5">
              NCAA Tournament · {totalGames} games
              {isMock && <span className="text-[#FFE600] ml-1">(demo)</span>}
            </p>
          </div>
          <span className="text-xs font-mono text-white/30">
            {isLoading ? 'updating\u2026' : updatedAt ?? '30s refresh'}
          </span>
        </div>

        {/* LIVE GAMES — always visible */}
        {groups.live.length > 0 && (
          <section className="mb-8">
            <SectionHeader title="Live" count={groups.live.length} variant="live" />
            <div className="flex flex-col gap-4">
              {groups.live.map((game, index) => (
                <GameCard key={game.id} game={game} rank={index + 1} />
              ))}
            </div>
          </section>
        )}

        {/* TABS */}
        <div
          className="flex rounded-lg overflow-hidden mb-5"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <TabButton
            label="Upcoming"
            count={upcomingCount}
            active={activeTab === 'upcoming'}
            onClick={() => setActiveTab('upcoming')}
          />
          <TabButton
            label="Final"
            count={groups.final.length}
            active={activeTab === 'final'}
            onClick={() => setActiveTab('final')}
          />
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'upcoming' && (
          <>
            {groups.upcoming.length === 0 && (
              <p className="text-center text-sm text-white/30 py-8">No upcoming games</p>
            )}
            {groups.upcoming.map(({ label, games }) => (
              <section key={label} className="mb-6">
                <SectionHeader title={label} count={games.length} variant="upcoming" />
                <div className="flex flex-col gap-4">
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {activeTab === 'final' && (
          <>
            {groups.final.length === 0 ? (
              <p className="text-center text-sm text-white/30 py-8">No completed games yet</p>
            ) : (
              <div className="flex flex-col gap-4">
                {groups.final.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </>
        )}

        <p className="text-center text-xs text-white/20 mt-10 tracking-widest uppercase">
          Powered by Chaos · SickoGrid
        </p>
      </main>
    </div>
  )
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-200"
      style={{
        color: active ? '#00F5FF' : 'rgba(255,255,255,0.3)',
        background: active ? 'rgba(0,245,255,0.08)' : 'transparent',
        borderBottom: active ? '2px solid #00F5FF' : '2px solid transparent',
      }}
    >
      {label} <span className="font-mono text-[11px]" style={{ opacity: 0.6 }}>({count})</span>
    </button>
  )
}

export default App
