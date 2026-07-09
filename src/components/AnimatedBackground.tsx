export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0) 70%)",
          filter: "blur(20px)",
          animation: "float-a 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "-10%",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.28) 0%, rgba(236,72,153,0) 70%)",
          filter: "blur(20px)",
          animation: "float-b 18s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "30%",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(249,115,22,0) 70%)",
          filter: "blur(20px)",
          animation: "float-a 16s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}
