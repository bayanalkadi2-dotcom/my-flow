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

function Freunde({ habits }) {
  const freunde = [
    {
      name: "Lena",
      score: 850,
      progress: 72,
      color: "#7c3aed",
      details: ["Wasser: 2,0 L", "Laufen: 18 km", "Sport: 4/5"],
    },
    {
      name: "Du",
      score: 650,
      progress: 80,
      color: "#4f46e5",
      details: ["Wasser: 2,5 L", "Laufen: 24 km", "Sport: 4/5"],
    },
    {
      name: "Max",
      score: 500,
      progress: 58,
      color: "#ec4899",
      details: ["Wasser: 1,5 L", "Laufen: 12 km", "Sport: 2/5"],
    },
    {
      name: "Sarah",
      score: 300,
      progress: 45,
      color: "#22c55e",
      details: ["Wasser: 1,2 L", "Laufen: 8 km", "Sport: 2/5"],
    },
    {
      name: "Tom",
      score: 150,
      progress: 32,
      color: "#f59e0b",
      details: ["Wasser: 1,0 L", "Laufen: 5 km", "Sport: 1/5"],
    },
  ];

  const [selectedFriend, setSelectedFriend] = useState(freunde[1]);
  const [challengeRoutine, setChallengeRoutine] = useState(habits[0]?.title ?? "Wasser trinken");
  const [challengeDays, setChallengeDays] = useState("14");
  const [challengeFriend, setChallengeFriend] = useState("Lena");
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      routine: "Wasser trinken",
      days: 14,
      friend: "Lena",
      progress: 36,
    },
  ]);

  function addChallenge(event) {
    event.preventDefault();

    if (!challengeRoutine) {
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

  const selectedLevel = getLevel(selectedFriend.score);
  const selectedTree = getFlowTree(selectedFriend.score);

  return (
    <div className="friends-page">
      <div className="friends-header">
        <div>
          <p className="friends-subtitle">Gemeinsam motiviert bleiben</p>
          <h1>Freunde & Rangliste</h1>
        </div>

        <button className="add-friend-button">+ Freund hinzufügen</button>
      </div>

      <div className="friend-detail-card">
        <div className="friend-detail-top">
          <div className="avatar detail-avatar">{selectedFriend.name.charAt(0)}</div>
          <div>
            <h2>{selectedFriend.name}</h2>
            <p>{selectedFriend.progress}% Wochenfortschritt</p>
          </div>
          <strong>{selectedFriend.score}</strong>
        </div>

        <div className="friend-level-row">
          <span>Level {selectedLevel.current}</span>
          <small>naechstes Level: {selectedLevel.next}</small>
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

      <section className="challenge-section">
        <div className="challenge-header">
          <div>
            <p className="friends-subtitle">Gemeinsame Ziele</p>
            <h2>Challenges</h2>
          </div>
        </div>

        <form className="challenge-form" onSubmit={addChallenge}>
          <label>
            Routine
            <select value={challengeRoutine} onChange={(event) => setChallengeRoutine(event.target.value)}>
              {habits.map((habit) => (
                <option value={habit.title} key={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </label>
          <div className="challenge-form-row">
            <label>
              Dauer
              <select value={challengeDays} onChange={(event) => setChallengeDays(event.target.value)}>
                <option value="7">7 Tage</option>
                <option value="14">14 Tage</option>
                <option value="30">30 Tage</option>
              </select>
            </label>
            <label>
              Mit
              <select value={challengeFriend} onChange={(event) => setChallengeFriend(event.target.value)}>
                {freunde
                  .filter((freund) => freund.name !== "Du")
                  .map((freund) => (
                    <option value={freund.name} key={freund.name}>
                      {freund.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <button type="submit">Challenge starten</button>
        </form>

        <div className="challenge-list">
          {challenges.map((challenge) => (
            <article className="challenge-card" key={challenge.id}>
              <div>
                <span>{challenge.days} Tage</span>
                <h3>{challenge.routine}</h3>
                <p>Du gegen {challenge.friend}</p>
              </div>
              <strong>{challenge.progress}%</strong>
              <div className="challenge-progress">
                <span style={{ width: `${challenge.progress}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="leaderboard">
        {freunde.map((freund, index) => (
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
              <p>{freund.progress}% Wochenfortschritt</p>

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
      </div>
    </div>
  );
}

export default Freunde;
