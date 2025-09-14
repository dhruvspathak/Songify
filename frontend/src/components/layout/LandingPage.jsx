import { AfterLogin, BeforeLogin } from '../../pages';
import { useAuth } from '../../hooks';
import { LoadingSpinner } from '../ui';

const LandingPageContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  return (
    <div>
      {isAuthenticated ? <AfterLogin /> : <BeforeLogin />}
    </div>
  );
};

const LandingPage = () => {
  return <LandingPageContent />;
};

export default LandingPage;
