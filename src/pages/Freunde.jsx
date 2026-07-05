import { useState } from "react";

const levelSteps = [
  { name: "Starter", min: 0 },
  { name: "Bronze", min: 250 },
  { name: "Silber", min: 500 },
  { name: "Gold", min: 800 },
  { name: "Flow Pro", min: 1200 },
]

function getFlowTree(score) {
  if (score < 100) {
    return { label: "Blatt", symbols: "🍃" }
  }

  if (score < 250) {
    return { label: "Spross", symbols: "🌱" }
  }

  if (score < 500) {
    return { label: "Pflanze", symbols: "🪴" }
  }

  if (score < 800) {
    return { label: "Blume", symbols: "🌸" }
  }

  if (score < 1200) {
    return { label: "Baum", symbols: "🌳" }
  }

  return { label: "Flow-Wald", symbols: "🌳🌳" }
}

function getLevel(score) {
  const currentLevel = [...levelSteps].reverse().find((level) => score >= level.min)
  const nextLevel = levelSteps.find((level) => level.min > score)
  const currentMin = currentLevel?.min ?? 0
  const nextMin = nextLevel?.min ?? currentMin
  const progress = nextLevel
    ? Math.round(((score - currentMin) / (nextMin - currentMin)) * 100)
    : 100

  return {
    current: currentLevel?.name ?? "Starter",
    next: nextLevel?.name ?? "Max Level",
    progress,
  }
}

function Freunde({ habits, profileName, t }) {
  const firstRoutineTitle = habits[0]?.title ?? "Wasser trinken";
  const routineLabels = new Map(habits.map((habit) => [habit.title, habit.displayTitle ?? habit.title]));
  const getRoutineLabel = (routine) => routineLabels.get(routine) ?? routine;
  const currentUserName = profileName && profileName !== "Gast" ? profileName : "Du";
  const completedHabits = habits.filter((habit) => habit.done || habit.progress >= 100).length;
  const weeklyProgress = habits.length
    ? Math.round(habits.reduce((sum, habit) => sum + Math.min(Number(habit.progress) || 0, 100), 0) / habits.length)
    : 0;
  const currentUser = {
    name: currentUserName,
    score: completedHabits * 100 + weeklyProgress,
    progress: weeklyProgress,
    color: "#4f46e5",
    details: habits.length
      ? habits.slice(0, 3).map((habit) => `${habit.displayTitle ?? habit.title}: ${Math.min(Number(habit.progress) || 0, 100)}%`)
      : ["Noch keine Routinen angelegt"],
  };
  const friends = [];
  const inviteLink = `https://myflow.app/invite/${encodeURIComponent(currentUserName.toLowerCase().replace(/\s+/g, "-"))}`;

  const [selectedFriend, setSelectedFriend] = useState(currentUser);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");
  const [challengeRoutine, setChallengeRoutine] = useState(firstRoutineTitle);
  const [challengeDays, setChallengeDays] = useState("14");
  const [challengeFriend, setChallengeFriend] = useState("");
  const [challenges, setChallenges] = useState([]);

  function addChallenge(event) {
    event.preventDefault();

    if (!challengeRoutine || !challengeFriend) {
      return;
    }

    setChallenges((currentChallenges) => [
      {
        id: Date.now(),
        routine: challengeRoutine,
        days: Number(challengeDays) || 14,
        friend: challengeFriend,
        progress: 0,
      },
      ...currentChallenges,
    ]);
  }

  function copyInviteLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
    }

    setInviteStatus(t.friends.copied);
  }

  const selectedLevel = getLevel(selectedFriend.score);
  const selectedTree = getFlowTree(selectedFriend.score);
  const inviteText = encodeURIComponent(`MyFlow: ${inviteLink}`);
  const mailSubject = encodeURIComponent("Einladung zu MyFlow");

  return (
    <div className="friends-page">
      <div className="friends-header">
        <div>
          <p className="friends-subtitle">{t.friends.subtitle}</p>
          <h1>{t.friends.title}</h1>
        </div>
      </div>

      <div className="friend-detail-card">
        <div className="friend-detail-top">
          <div className="avatar detail-avatar">{selectedFriend.name.charAt(0)}</div>
          <div>
            <h2>{selectedFriend.name}</h2>
            <p>{t.friends.weekly.replace('{progress}', selectedFriend.progress)}</p>
          </div>
          <strong>{selectedFriend.score}</strong>
        </div>

        <div className="friend-level-row">
          <span>Level {selectedLevel.current}</span>
          <small>{t.friends.nextLevel.replace('{level}', selectedLevel.next)}</small>
        </div>
        <div className="friend-tree-status">
          <span>{selectedTree.symbols}</span>
          <p>FlowTree: {selectedTree.label}</p>
        </div>
        <div className="friend-level-progress">
          <span style={{ width: `${selectedLevel.progress}%` }} />
        </div>

        <div className="detail-list">
          {selectedFriend.details.map((detail) => (
            <span key={detail}>{detail}</span>
          ))}
        </div>
      </div>

      <button className="add-friend-button invite-bottom-button" onClick={() => setInviteOpen((open) => !open)} type="button">
        {t.friends.invite}
      </button>

      {inviteOpen && (
        <section className="invite-panel">
          <div>
            <span>{t.friends.inviteFriend}</span>
            <p>{t.friends.inviteText}</p>
          </div>
          <div className="invite-link-box">
            <strong>{inviteLink}</strong>
            <button type="button" onClick={copyInviteLink}>{t.common.save}</button>
          </div>
          <div className="invite-actions">
            <a href={`https://wa.me/?text=${inviteText}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href={`mailto:?subject=${mailSubject}&body=${inviteText}`}>E-Mail</a>
          </div>
          {inviteStatus && <small>{inviteStatus}</small>}
        </section>
      )}

      <section className="challenge-section">
        <div className="challenge-header">
          <div>
            <p className="friends-subtitle">{t.friends.goals}</p>
            <h2>{t.friends.challenges}</h2>
          </div>
        </div>

        <form className="challenge-form" onSubmit={addChallenge}>
          <label>
            {t.routines.routine}
            <select value={challengeRoutine} onChange={(event) => setChallengeRoutine(event.target.value)}>
              {habits.map((habit) => (
                <option value={habit.title} key={habit.id}>
                  {habit.displayTitle ?? habit.title}
                </option>
              ))}
            </select>
          </label>
          <div className="challenge-form-row">
            <label>
              {t.friends.duration}
              <select value={challengeDays} onChange={(event) => setChallengeDays(event.target.value)}>
                <option value="7">{t.friends.days.replace('{days}', 7)}</option>
                <option value="14">{t.friends.days.replace('{days}', 14)}</option>
                <option value="30">{t.friends.days.replace('{days}', 30)}</option>
              </select>
            </label>
            <label>
              {t.friends.with}
              <select value={challengeFriend} onChange={(event) => setChallengeFriend(event.target.value)}>
                <option value="">Noch keine Freunde</option>
                {friends.map((friend) => (
                  <option value={friend.name} key={friend.name}>
                    {friend.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" disabled={!challengeFriend}>{t.friends.start}</button>
        </form>

        <div className="challenge-list">
          {challenges.length ? (
            challenges.map((challenge) => (
              <article className="challenge-card" key={challenge.id}>
                <div>
                  <span>{t.friends.days.replace('{days}', challenge.days)}</span>
                  <h3>{getRoutineLabel(challenge.routine)}</h3>
                  <p>{t.friends.against.replace('{friend}', challenge.friend)}</p>
                </div>
                <strong>{challenge.progress}%</strong>
                <div className="challenge-progress">
                  <span style={{ width: `${challenge.progress}%` }} />
                </div>
              </article>
            ))
          ) : (
            <article className="friends-empty-state">
              <strong>Noch keine Challenges</strong>
              <p>Lade zuerst Freunde ein, dann kannst du gemeinsame Ziele starten.</p>
            </article>
          )}
        </div>
      </section>

      <div className="leaderboard">
        {[currentUser, ...friends].map((freund, index) => (
          <button
            className={`friend-card ${
              selectedFriend.name === freund.name ? "active" : ""
            }`}
            key={freund.name}
            onClick={() => setSelectedFriend(freund)}
          >
            <div className="rank">{index + 1}</div>
            <div className="avatar">{freund.name.charAt(0)}</div>
            <div className="friend-tree-badge" aria-label={`FlowTree ${getFlowTree(freund.score).label}`}>
              {getFlowTree(freund.score).symbols}
            </div>

            <div className="friend-info">
              <h2>{freund.name}</h2>
              <p>{t.friends.weekly.replace('{progress}', freund.progress)}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${freund.progress}%`,
                    backgroundColor: freund.color,
                  }}
                />
              </div>
            </div>

            <div className="score">
              <span>{freund.score}</span>
              <small>{getLevel(freund.score).current}</small>
            </div>
          </button>
        ))}
        {!friends.length && (
          <article className="friends-empty-state">
            <strong>Noch keine Freunde</strong>
            <p>Hier erscheinen echte Freunde, sobald sie deiner App beitreten.</p>
          </article>
        )}
      </div>
    </div>
  );
}

export default Freunde;
