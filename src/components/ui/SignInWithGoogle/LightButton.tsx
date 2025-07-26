import './light.css'
import { SignInWithGoogleRaw } from './RawButton';

interface SignInWithGoogleLightProps {
  onClick: () => void;
  disabled: boolean;
}

export function SignInWithGoogleLight({ onClick, disabled }: SignInWithGoogleLightProps) {
  return <SignInWithGoogleRaw onClick={onClick} disabled={disabled}/>
}