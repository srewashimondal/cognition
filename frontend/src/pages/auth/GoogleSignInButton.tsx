import "./AuthOauth.css";

const googleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.96-2.18l-2.909-2.26c-.806.54-1.833.86-3.05.86-2.346 0-4.33-1.585-5.04-3.72H.96v2.33C2.45 16.12 5.5 18 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.96 10.6c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V5.3H.96C.35 6.4 0 7.7 0 8.88c0 1.18.35 2.48.96 3.6l2.28-1.88z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.32l2.59-2.59C13.45.89 11.4 0 9 0 5.5 0 2.45 1.88.96 4.5l2.28 1.8C3.66 5.16 5.64 3.58 9 3.58z"
    />
  </svg>
);

type GoogleSignInButtonProps = {
  label?: string;
  disabled?: boolean;
  onClick: () => void;
};

export default function GoogleSignInButton({
  label = "Continue with Google",
  disabled = false,
  onClick,
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      className="google-signin-button"
      disabled={disabled}
      onClick={onClick}
    >
      {googleIcon}
      {label}
    </button>
  );
}
