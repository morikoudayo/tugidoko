import { BeforeLogin } from '@/components/BeforeLogin/BeforeLogin';
import { AfterLogin } from '@/components/AfterLogin/AfterLogin';
import { useAuth } from '@/hook/useAuth';

const App = () => {
  const auth = useAuth()

  return (auth.user.id && auth.user.pass
    ? <AfterLogin />
    : <BeforeLogin />
  );
};

export default App
