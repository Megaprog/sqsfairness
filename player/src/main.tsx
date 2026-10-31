import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { Video } from "../../src/Composition";
import "./style.css";

const App: React.FC = () => (
  <main className="page">
    <header className="intro">
      <p className="eyebrow">AMAZON SQS · FAIR QUEUES</p>
      <h1>How fair queues protect quiet tenants</h1>
      <p className="summary">
        Watch how a noisy tenant affects shared queue dwell time, and how SQS fair queues help neighbors.
      </p>
    </header>
    <section className="player-card" aria-label="SQS fair queues animation">
      <Player
        component={Video}
        durationInFrames={750}
        compositionWidth={1280}
        compositionHeight={720}
        fps={30}
        controls
        clickToPlay
        spaceKeyToPlayOrPause
        style={{ width: "100%" }}
      />
    </section>
    <footer>
      <span>25 seconds</span>
      <span>Use the player controls to play or scrub the animation.</span>
    </footer>
  </main>
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
