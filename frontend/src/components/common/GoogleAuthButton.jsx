import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../../context/AuthContext';

const GoogleAuthButton = ({ role, onError }) => {
    const { googleAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            await googleAuth(credentialResponse.credential, role);
            navigate('/');
        } catch (err) {
            onError?.(err.response?.data?.message || 'Google sign-in failed');
        }
    };

    return (
        <div className="flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => onError?.('Google sign-in failed')}
                shape="pill"
                width="320"
            />
        </div>
    );
};

export default GoogleAuthButton;
