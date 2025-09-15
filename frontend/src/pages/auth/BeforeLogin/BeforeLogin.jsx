import './BeforeLogin.css';
import Typography from '@mui/material/Typography';

const BeforeLogin = () => {
    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <Typography variant="h2" className="welcome-title">
                    WELCOME TO SONGIFY
                </Typography>
                <Typography variant="h3" className="welcome-subtitle">
                    Listening is Everything
                </Typography>
                <Typography variant="h4" className="welcome-description">
                    And Everything can be listened Here!
                </Typography>
                <Typography variant="h4" className="welcome-cta">
                    Sign-Up or Login with your Songify account to experience the melody
                </Typography>
            </div>
        </div>
    );
};

export default BeforeLogin;
