import { useColorMode } from '@/components/ui/color-mode';
import { SignInWithGoogleLight } from './LightButton';
import { SignInWithGoogleDark } from './DarkButton';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { CloseButton, HStack } from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/context/FirebaseUser/firebase';

interface SignInWithGoogleProps {
  onClick: () => void;
}

export function SignInWithGoogle({ onClick }: SignInWithGoogleProps) {
  const { colorMode } = useColorMode()
  const firebaseUser = useFirebaseUser()
  
  return (
   firebaseUser === null
      ? colorMode === 'light'
        ? <SignInWithGoogleLight onClick={onClick} disabled={false} />
        : <SignInWithGoogleDark onClick={onClick} disabled={false} />
      : <HStack>
        {colorMode === 'light'
          ? <SignInWithGoogleLight onClick={onClick} disabled={true} />
          : <SignInWithGoogleDark onClick={onClick} disabled={true} />}
        <CloseButton onClick={() => { signOut(firebaseAuth) }} />
      </HStack>
  )
}