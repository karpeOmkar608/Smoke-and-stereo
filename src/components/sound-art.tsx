export function SoundArt({ small = false }: { small?: boolean }) {
  return (
    <div className={`sound-art ${small ? 'sound-small' : ''}`} aria-hidden="true">
      <div className="art-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="art-cross cross-one">+</div>
      <div className="art-cross cross-two">+</div>
      <div className="speaker-stack">
        {[0, 1, 2].map((i) => (
          <div className="speaker" key={i}>
            <div className="speaker-cone">
              <div className="speaker-dome" />
            </div>
            <span className="screw s1" />
            <span className="screw s2" />
            <span className="screw s3" />
            <span className="screw s4" />
          </div>
        ))}
      </div>
      <div className="art-sticker">
        S&S
        <br />
        <span>
          INDEPENDENT
          <br />
          SOUND SYSTEM
        </span>
      </div>
      <div className="art-vertical">TURN UP. STAND OUT. STAY INDEPENDENT.</div>
      <div className="art-caption">
        TRANSMITTING FROM THE UNDERGROUND <span>19° N / 72° E</span>
      </div>
    </div>
  );
}
