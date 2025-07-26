import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { SignInWithGoogleButton } from './button';
import { CloseButton, HStack } from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/context/FirebaseUser/firebase';

interface SignInWithGoogleProps {
  onClick: () => void;
}

export function SignInWithGoogle({ onClick }: SignInWithGoogleProps) {
  const firebaseUser = useFirebaseUser()

  return (
    firebaseUser === null
      ? <SignInWithGoogleButton onClick={onClick} disabled={false} />
      : (<HStack>
        <SignInWithGoogleButton onClick={onClick} disabled={true} />
        <CloseButton onClick={() => { signOut(firebaseAuth) }} />
      </HStack>)
  )
}