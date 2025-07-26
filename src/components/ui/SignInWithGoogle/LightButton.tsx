import styles from './light.module.css'
import { SignInWithGoogleRaw } from './RawButton';

interface SignInWithGoogleLightProps {
  onClick: () => void;
  disabled: boolean;
}

export function SignInWithGoogleLight({ onClick, disabled }: SignInWithGoogleLightProps) {
  return <SignInWithGoogleRaw styles={styles} onClick={onClick}  disabled={disabled} />
}