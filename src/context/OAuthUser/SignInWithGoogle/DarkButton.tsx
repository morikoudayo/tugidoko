import './dark.css'
import { SignInWithGoogleRaw } from './RawButton';

interface SignInWithGoogleDarkProps {
  onClick: () => void;
  disabled: boolean;
}

export function SignInWithGoogleDark({ onClick, disabled }: SignInWithGoogleDarkProps) {
  return <SignInWithGoogleRaw onClick={onClick} disabled={disabled}/>
}