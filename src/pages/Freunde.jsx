import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  challengeTemplates,
  cancelFriendRequest,
  loadSocialDashboard,
  respondToChallengeRequest,
  respondToFriendRequest,
  sendChallengeRequest,
  sendFriendRequest,
  subscribeToSocialChanges,
  toggleTodayProgress,
} from '../services/socialService'

const emptyDashboard = {
  friends: [],
  friendRequests: [],
  sentFriendRequests: [],
  challengeRequests: [],
  challenges: [],
}

function initials(name = '') {
  return name.trim().charAt(0).toUpperCase() || 'F'
}

function daysRemaining(endsOn) {
  const end = new Date(`${endsOn}T23:59:59`)
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000))
}

function ChallengeCard({ challenge, userId, busy, onToggle }) {
  const today = new Date().toISOString().slice(0, 10)
  const mine = challenge.challenge_progress?.filter((item) => item.user_id === userId && item.completed) ?? []
  const theirs = challenge.challenge_progress?.filter((item) => item.user_id !== userId && item.completed) ?? []
  const myPercent = Math.min(100, Math.round((mine.length / challenge.duration_days) * 100))
  const friendPercent = Math.min(100, Math.round((theirs.length / challenge.duration_days) * 100))
  const checkedToday = mine.some((item) => item.progress_date === today)
  const remaining = daysRemaining(challenge.ends_on)
  const result = remaining > 0
    ? null
    : myPercent === friendPercent
      ? 'Gleichstand'
      : myPercent > friendPercent ? 'Du gewinnst!' : `${challenge.friendName} gewinnt`

  return (
    <article className="social-challenge-card">
      <div className="social-card-heading">
        <div>
          <span className="social-kicker">{challenge.duration_days} Tage · {challenge.daily_goal} {challenge.goal_unit} täglich</span>
          <h3>{challenge.title}</h3>
          <p>Gemeinsam mit {challenge.friendName}</p>
        </div>
        <strong>{remaining} Tage</strong>
      </div>

      <div className="duel-progress">
        <div>
          <span><b>Du</b><b>{myPercent}%</b></span>
          <div><i style={{ width: `${myPercent}%` }} /></div>
        </div>
        <div>
          <span><b>{challenge.friendName}</b><b>{friendPercent}%</b></span>
          <div><i style={{ width: `${friendPercent}%` }} /></div>
        </div>
      </div>

      {result ? (
        <div className="challenge-result">{result}</div>
      ) : (
        <button
          className={checkedToday ? 'daily-check active' : 'daily-check'}
          type="button"
          disabled={busy}
          onClick={() => onToggle(challenge.id, checkedToday)}
        >
          <span>{checkedToday ? '✓' : ''}</span>
          {checkedToday ? 'Heute geschafft' : 'Heutiges Ziel abhaken'}
        </button>
      )}
    </article>
  )
}

function EmptyState({ title, text }) {
  return (
    <div className="social-empty">
      <span aria-hidden="true">✦</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function Freunde({ profileName, user }) {
  const userId = user?.id
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(Boolean(user))
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [friendModalOpen, setFriendModalOpen] = useState(false)
  const [challengeModalOpen, setChallengeModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [friendId, setFriendId] = useState('')
  const [templateKey, setTemplateKey] = useState(challengeTemplates[0].id)
  const selectedTemplate = useMemo(
    () => challengeTemplates.find((template) => template.id === templateKey) ?? challengeTemplates[0],
    [templateKey],
  )
  const [days, setDays] = useState(selectedTemplate.days)
  const [goal, setGoal] = useState(selectedTemplate.goal)

  const refresh = useCallback(async () => {
    if (!userId) {
      setDashboard(emptyDashboard)
      setLoading(false)
      return
    }
    try {
      setDashboard(await loadSocialDashboard(userId))
    } catch (error) {
      setNotice(error.message || 'Freunde konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    loadSocialDashboard(userId)
      .then((data) => {
        if (active) setDashboard(data)
      })
      .catch((error) => {
        if (active) setNotice(error.message || 'Freunde konnten nicht geladen werden.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    const unsubscribe = subscribeToSocialChanges(userId, refresh)
    return () => {
      active = false
      unsubscribe()
    }
  }, [refresh, userId])

  async function runAction(action, successMessage) {
    setBusy(true)
    setNotice('')
    try {
      await action()
      setNotice(successMessage)
      await refresh()
      return true
    } catch (error) {
      setNotice(error.message || 'Das hat leider nicht geklappt.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function submitFriendRequest(event) {
    event.preventDefault()
    const succeeded = await runAction(
      () => sendFriendRequest(email),
      'Freundschaftsanfrage wurde gesendet.',
    )
    if (succeeded) {
      setEmail('')
      setFriendModalOpen(false)
    }
  }

  async function submitChallenge(event) {
    event.preventDefault()
    const friend = dashboard.friends.find((item) => item.id === friendId)
    if (!friend) return
    const succeeded = await runAction(
      () => sendChallengeRequest({
        userId,
        friendId,
        templateKey,
        title: selectedTemplate.title,
        days: Number(days),
        goal: Number(goal),
        unit: selectedTemplate.unit,
      }),
      `Challenge-Anfrage an ${friend.name} gesendet.`,
    )
    if (succeeded) setChallengeModalOpen(false)
  }

  const userName = profileName && profileName !== 'Gast' ? profileName : 'Du'

  return (
    <div className="friends-page social-friends-page">
      <header className="friends-header social-hero">
        <div>
          <p className="friends-subtitle">Gemeinsam motiviert bleiben</p>
          <h1>Freunde & Challenges</h1>
          <p>Erreicht eure täglichen Ziele zusammen.</p>
        </div>
        <div className="social-user-badge" aria-label={`Angemeldet als ${userName}`}>
          {initials(userName)}
        </div>
      </header>

      <div className="social-actions">
        <button type="button" onClick={() => { setNotice(''); setFriendModalOpen(true) }}>
          <span>＋</span> Freund hinzufügen
        </button>
        <button type="button" onClick={() => { setNotice(''); setChallengeModalOpen(true) }} disabled={!dashboard.friends.length}>
          <span>⚡</span> Challenge starten
        </button>
      </div>

      {notice && <div className="social-notice" role="status">{notice}</div>}

      <section className="social-section">
        <div className="social-section-title">
          <div><span>DEIN KREIS</span><h2>Meine Freunde</h2></div>
          <b>{dashboard.friends.length}</b>
        </div>
        {loading ? <p className="social-loading">Wird geladen …</p> : (
          <div className="social-friend-grid">
            {dashboard.friends.map((friend) => (
              <article className="social-friend-card" key={friend.id}>
                <div className="social-avatar">{initials(friend.name)}</div>
                <div><strong>{friend.name}</strong><span>MyFlow-Freund</span></div>
                <i aria-hidden="true">✓</i>
              </article>
            ))}
            {!dashboard.friends.length && (
              <EmptyState title="Noch keine Freunde" text="Füge Freunde per E-Mail hinzu und motiviert euch gemeinsam." />
            )}
          </div>
        )}
      </section>

      <section className="social-section">
        <div className="social-section-title">
          <div><span>NEU</span><h2>Eingehende Freundschaftsanfragen</h2></div>
          {!!dashboard.friendRequests.length && <b>{dashboard.friendRequests.length}</b>}
        </div>
        <div className="social-request-list">
          {dashboard.friendRequests.map((request) => (
            <article className="social-request-card" key={request.id}>
              <div className="social-avatar">{initials(request.name)}</div>
              <div><strong>{request.name}</strong><span>Möchte mit dir befreundet sein</span></div>
              <div className="request-buttons">
                <button type="button" disabled={busy} onClick={() => runAction(() => respondToFriendRequest(request.id, true), `${request.name} ist jetzt dein Freund.`)}>Annehmen</button>
                <button type="button" disabled={busy} onClick={() => runAction(() => respondToFriendRequest(request.id, false), 'Anfrage abgelehnt.')}>Ablehnen</button>
              </div>
            </article>
          ))}
          {!dashboard.friendRequests.length && <EmptyState title="Keine neuen Anfragen" text="Neue Freundschaftsanfragen erscheinen hier." />}
        </div>
      </section>

      <section className="social-section">
        <div className="social-section-title">
          <div><span>GEMEINSAME ZIELE</span><h2>Laufende Challenges</h2></div>
          {!!dashboard.challenges.length && <b>{dashboard.challenges.length}</b>}
        </div>
        <div className="social-challenge-list">
          {dashboard.challenges.map((challenge) => (
            <ChallengeCard
              challenge={challenge}
              userId={userId}
              busy={busy}
              onToggle={(id, completed) => runAction(
                () => toggleTodayProgress(id, userId, !completed),
                completed ? 'Heutiger Fortschritt zurückgesetzt.' : 'Stark! Dein Fortschritt wurde gespeichert.',
              )}
              key={challenge.id}
            />
          ))}
          {!dashboard.challenges.length && <EmptyState title="Noch keine laufende Challenge" text="Starte mit einem Freund eine gemeinsame Challenge." />}
        </div>
      </section>

      <section className="social-section">
        <div className="social-section-title">
          <div><span>ENTSCHEIDE DU</span><h2>Challenge-Anfragen</h2></div>
          {!!dashboard.challengeRequests.length && <b>{dashboard.challengeRequests.length}</b>}
        </div>
        <div className="social-request-list">
          {dashboard.challengeRequests.map((request) => (
            <article className="social-request-card challenge-request" key={request.id}>
              <div className="social-avatar">⚡</div>
              <div>
                <strong>{request.title}</strong>
                <span>{request.friendName} · {request.duration_days} Tage · {request.daily_goal} {request.goal_unit}</span>
              </div>
              <div className="request-buttons">
                <button type="button" disabled={busy} onClick={() => runAction(() => respondToChallengeRequest(request.id, true), 'Challenge angenommen – los geht’s!')}>Annehmen</button>
                <button type="button" disabled={busy} onClick={() => runAction(() => respondToChallengeRequest(request.id, false), 'Challenge abgelehnt.')}>Ablehnen</button>
              </div>
            </article>
          ))}
          {!dashboard.challengeRequests.length && <EmptyState title="Keine Challenge-Anfragen" text="Einladungen deiner Freunde erscheinen hier." />}
        </div>
      </section>

      <section className="social-section sent-invitations-section">
        <div className="social-section-title">
          <div><span>NOCH OFFEN</span><h2>Gesendete Einladungen</h2></div>
          {!!dashboard.sentFriendRequests.length && <b>{dashboard.sentFriendRequests.length}</b>}
        </div>
        <div className="social-request-list">
          {dashboard.sentFriendRequests.map((request) => (
            <article className="social-request-card sent-request-card" key={request.id}>
              <div className="social-avatar">{initials(request.name)}</div>
              <div>
                <strong>{request.name}</strong>
                <span>Einladung wurde noch nicht angenommen</span>
              </div>
              <button
                className="cancel-friend-request"
                type="button"
                disabled={busy}
                onClick={() => runAction(
                  () => cancelFriendRequest(request.id),
                  `Einladung an ${request.name} wurde zurückgezogen.`,
                )}
              >
                Zurückziehen
              </button>
            </article>
          ))}
          {!dashboard.sentFriendRequests.length && (
            <EmptyState title="Keine offenen Einladungen" text="Alle gesendeten Anfragen wurden beantwortet." />
          )}
        </div>
      </section>

      {friendModalOpen && (
        <div className="social-modal-backdrop" role="presentation" onMouseDown={() => setFriendModalOpen(false)}>
          <section className="social-modal" role="dialog" aria-modal="true" aria-labelledby="friend-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="social-modal-close" type="button" aria-label="Schließen" onClick={() => setFriendModalOpen(false)}>×</button>
            <span className="social-modal-icon">♡</span>
            <h2 id="friend-modal-title">Freund hinzufügen</h2>
            <p>Sende eine Anfrage an die E-Mail-Adresse des MyFlow-Kontos.</p>
            {notice && <div className="social-modal-error" role="alert">{notice}</div>}
            <form onSubmit={submitFriendRequest}>
              <label>E-Mail-Adresse<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="freund@beispiel.de" required autoFocus /></label>
              <button type="submit" disabled={busy}>{busy ? 'Wird gesendet …' : 'Anfrage senden'}</button>
            </form>
          </section>
        </div>
      )}

      {challengeModalOpen && (
        <div className="social-modal-backdrop" role="presentation" onMouseDown={() => setChallengeModalOpen(false)}>
          <section className="social-modal challenge-modal" role="dialog" aria-modal="true" aria-labelledby="challenge-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="social-modal-close" type="button" aria-label="Schließen" onClick={() => setChallengeModalOpen(false)}>×</button>
            <span className="social-modal-icon">⚡</span>
            <h2 id="challenge-modal-title">Challenge starten</h2>
            <p>Wähle Freund, Vorlage und euer tägliches Ziel.</p>
            {notice && <div className="social-modal-error" role="alert">{notice}</div>}
            <form onSubmit={submitChallenge}>
              <label>Freund<select value={friendId} onChange={(event) => setFriendId(event.target.value)} required><option value="">Bitte wählen</option>{dashboard.friends.map((friend) => <option value={friend.id} key={friend.id}>{friend.name}</option>)}</select></label>
              <label>Challenge-Typ<select value={templateKey} onChange={(event) => {
                const nextTemplate = challengeTemplates.find((template) => template.id === event.target.value) ?? challengeTemplates[0]
                setTemplateKey(nextTemplate.id)
                setDays(nextTemplate.days)
                setGoal(nextTemplate.goal)
              }}>{challengeTemplates.map((template) => <option value={template.id} key={template.id}>{template.days} Tage {template.title}</option>)}</select></label>
              <div className="social-form-row">
                <label>Dauer in Tagen<input type="number" min="1" max="365" value={days} onChange={(event) => setDays(event.target.value)} required /></label>
                <label>Tägliches Ziel<input type="number" min="1" step="1" value={goal} onChange={(event) => setGoal(event.target.value)} required /></label>
              </div>
              <small>Einheit: {selectedTemplate.unit}</small>
              <button type="submit" disabled={busy || !friendId}>{busy ? 'Wird gesendet …' : 'Challenge-Anfrage senden'}</button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Freunde
