import { SignInButton } from "@clerk/clerk-react";

const AuthPage = () => {
  return (
    <div className="auth-wrapper-v2">
      <div className="auth-card-glass">
        <img src="/logo-new.png" alt="Nexus" className="auth-logo" />
        
        <h1 className="auth-title">
          Connect <br /> 
          <span className="gradient-text">Instantly.</span>
        </h1>
        
        <p className="auth-subtitle">
          Experience the next generation of team collaboration. 
          Real-time, secure, and stunningly fast.
        </p>

        <SignInButton mode="modal">
          <button className="btn-premium">
            Launch Workspace
          </button>
        </SignInButton>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <div className="feature-dot">⚡ Real-time</div>
          <div className="feature-dot">🛡️ Secure</div>
        </div>
      </div>

      <style>{`
        .feature-dot {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.8rem;
          color: var(--text-dim);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};
export default AuthPage;
