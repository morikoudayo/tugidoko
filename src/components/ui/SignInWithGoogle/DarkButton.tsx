import styles from './dark.module.css'
import { SignInWithGoogleRaw } from './RawButton';

interface SignInWithGoogleDarkProps {
  onClick: () => void;
  disabled: boolean;
}

export function SignInWithGoogleDark({ onClick, disabled }: SignInWithGoogleDarkProps) {
  return <SignInWithGoogleRaw styles={styles} onClick={onClick} disabled={disabled} />
}