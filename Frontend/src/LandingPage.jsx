export default function LandingPage({ onStart }) {
  const orb = {
    position: "absolute",
    borderRadius: "58% 42% 52% 48% / 46% 54% 46% 54%",

    background: `
      radial-gradient(
        circle at 60% 35%,
        rgba(255,245,220,0.95) 0%,
        rgba(255,220,180,0.75) 30%,
        rgba(255,175,190,0.55) 55%,
        rgba(255,220,120,0.35) 80%,
        rgba(180,255,240,0.15) 100%
      )
    `,

    border: "1.5px solid rgba(130,220,220,0.45)",

    boxShadow: `
      0 0 80px rgba(255,220,180,0.25),
      inset 0 0 25px rgba(255,255,255,0.35)
    `,

    backdropFilter: "blur(10px)",
    filter: "blur(1px)",
    opacity: 0.95,
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        background: `
          linear-gradient(
            135deg,
            #f8f4ea 0%,
            #f5ddbe 35%,
            #f3cda8 70%,
            #f0b98d 100%
          )
        `,
      }}
    >
      {/* Decorative blurred background glow */}
      <div
        style={{
          position: "absolute",
          width: "800px",
          height: "800px",
          background:
            "radial-gradient(circle, rgba(255,210,170,0.35), transparent 70%)",
          filter: "blur(80px)",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* Floating blobs */}
      <div
        style={{
          ...orb,
          width: "260px",
          height: "260px",
          top: "70px",
          left: "-50px",
        }}
      />

      <div
        style={{
          ...orb,
          width: "290px",
          height: "290px",
          top: "-40px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <div
        style={{
          ...orb,
          width: "240px",
          height: "240px",
          top: "90px",
          right: "-40px",
        }}
      />

      <div
        style={{
          ...orb,
          width: "300px",
          height: "300px",
          bottom: "-100px",
          left: "120px",
        }}
      />

      <div
        style={{
          ...orb,
          width: "280px",
          height: "280px",
          bottom: "-90px",
          right: "150px",
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: "700px",
          padding: "24px",
        }}
        
      >
        <h1
          style={{
            fontSize: "70px",
            fontWeight: "700",
            position: "relative",
            top: "-100px",
            color: "#991f00",
            fontFamily: "Georgia, serif",
            marginBottom: "10px",
            lineHeight: "1.1",
          }}
        >
          colloquio
        </h1>
        
        <h1
          style={{
            fontSize: "40px",
            position: "relative",
            top: "-40px",
            fontWeight: "500",
            color: "#ef7f63",
            fontFamily: "Georgia, serif",
            marginBottom: "20px",
            lineHeight: "1.1",
          }}
        >
          Navigate Your Career With Confidence
        </h1>

        <p
          style={{
            color: "#a84f48",
            fontSize: "18px",
            position: "relative",
            top: "-50px",
            lineHeight: "1.8",
            marginBottom: "40px",
          }}
        >
          Practice personalized interviews, sharpen your answers,
          and discover what recruiters might ask before the real
          conversation begins.
        </p>

        <button
          onClick={onStart}
          style={{
            position: "relative",
            top: "-50px",
            padding: "14px 36px",
            borderRadius: "999px",
            border: "1.5px solid #d96d5b",

            background: "rgba(255,255,255,0.35)",

            backdropFilter: "blur(8px)",

            color: "#d95d4a",
            fontSize: "22px",
            fontFamily: "Georgia, serif",

            cursor: "pointer",

            display: "inline-flex",
            alignItems: "center",
            gap: "14px",

            boxShadow:
              "0 8px 25px rgba(255,190,150,0.25)",
          }}
        >
          Start Now
          <span style={{ fontSize: "24px" }}>→</span>
        </button>
      </div>
    </div>
  )
}