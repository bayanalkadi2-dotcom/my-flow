import { useState } from "react";

function Freunde() {
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

  return (
    <div className="friends-page">
      <div className="friends-header">
        <div>
          <p className="friends-subtitle">Gemeinsam motiviert bleiben</p>
          <h1>Freunde & Rangliste 🏆</h1>
        </div>

        <button className="add-friend-button">+ Freund hinzufügen</button>
      </div>

      <div className="friend-detail-card">
        <h2>{selectedFriend.name}</h2>
        <p>{selectedFriend.progress}% Wochenfortschritt</p>
        <strong>{selectedFriend.score} Punkte</strong>

        <div className="detail-list">
          {selectedFriend.details.map((detail) => (
            <span key={detail}>{detail}</span>
          ))}
        </div>
      </div>

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
              <small>Punkte</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Freunde;