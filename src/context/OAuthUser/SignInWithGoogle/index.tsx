import { useColorMode } from '@/components/ui/color-mode';
import { SignInWithGoogleLight } from './LightButton';
import { SignInWithGoogleDark } from './DarkButton';
import { useOAuthUser } from '@/hook/useOAuth';
import { CloseButton, HStack } from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { oAuth } from '../firebase';

interface SignInWithGoogleProps {
  onClick: () => void;
}

export function SignInWithGoogle({ onClick }: SignInWithGoogleProps) {
  const { colorMode } = useColorMode()
  const oAuthUser = useOAuthUser()

  return (
   oAuthUser === null
      ? colorMode === 'light'
        ? <SignInWithGoogleLight onClick={onClick} disabled={false} />
        : <SignInWithGoogleDark onClick={onClick} disabled={false} />
      : <HStack>
        {colorMode === 'light'
          ? <SignInWithGoogleLight onClick={onClick} disabled={true} />
          : <SignInWithGoogleDark onClick={onClick} disabled={true} />}
        <CloseButton onClick={() => { signOut(oAuth) }} />
      </HStack>
  )
}