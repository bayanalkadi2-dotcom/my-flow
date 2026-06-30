import { useCallback, useEffect, useMemo, useState } from 'react'
import FlowtreeProgress from '../commponents/progress/FlowtreeProgress'
import { useProfile } from '../context/profileContextValue'
import { getUserCheckIns } from '../services/checkInService'
import { calculateFlowtreeStats } from '../utils/flowtreeStats'

function Statistik({ habits = [], t }) {
  const { personalizedTexts } = useProfile()
  const [checkIns, setCheckIns] = useState([])
  const [checkInsLoading, setCheckInsLoading] = useState(true)
  const [checkInsError, setCheckInsError] = useState('')
  const stats = useMemo(() => calculateFlowtreeStats({ routines: habits, checkIns }), [habits, checkIns])
  const hasProgress = stats.growthPoints > 0 || stats.checkIns > 0 || stats.completedRoutines > 0
  const headerMessage = hasProgress
    ? personalizedTexts.statisticsIntro
    : 'Starte deine erste Routine oder deinen ersten Check-in.'

  const loadCheckIns = useCallback(async () => {
    setCheckInsLoading(true)
    setCheckInsError('')

    try {
      const data = await getUserCheckIns()
      setCheckIns(data)
    } catch (error) {
      console.error('Check-ins konnten nicht geladen werden:', error)
      setCheckIns([])
      setCheckInsError(error.message || 'Check-ins konnten nicht geladen werden.')
    } finally {
      setCheckInsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    Promise.resolve().then(() => {
      if (!cancelled) loadCheckIns()
    })

    return () => {
      cancelled = true
    }
  }, [loadCheckIns])

  useEffect(() => {
    function handleFocus() {
      loadCheckIns()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadCheckIns])

  return (
    <section className="screen stats-page flowtree-stats-page">
      <header className="stats-hero flowtree-hero">
        <div>
          <p className="eyebrow">{t.stats.eyebrow}</p>
          <h1>{personalizedTexts.statisticsTitle}</h1>
          <p>{headerMessage}</p>
        </div>
        <span className="stats-date-chip">Heute</span>
      </header>

      {checkInsError && (
        <div className="stats-empty-state flowtree-error-state" role="alert">
          <strong>Check-ins konnten nicht geladen werden.</strong>
          <p>{checkInsError}</p>
          <button className="secondary-button" onClick={loadCheckIns} type="button">Erneut laden</button>
        </div>
      )}

      {checkInsLoading ? (
        <section className="flowtree-loading-card" aria-busy="true">
          <span />
          <span />
          <span />
        </section>
      ) : (
        <FlowtreeProgress stats={stats} />
      )}
    </section>
  )
}

export default Statistik
