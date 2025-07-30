import './BeforeLogin.css'
import Typography from '@mui/material/Typography'

const BeforeLogin = () => {
    return (
        <>
            <div className='header'>
                <Typography variant='h2'>
                    WELCOME TO SONGIFY
                </Typography>
                <Typography variant='h3'>
                    Listening is Everything
                </Typography>
                <Typography variant='h4'>
                    And Everything can be listened Here!
                </Typography>
                <br></br>
                <Typography variant='h4'>
                    Login with your spotify account and experience the melody
                </Typography>
            </div>
        </>
    )
}

export default BeforeLogin
