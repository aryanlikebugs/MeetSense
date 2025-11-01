import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { validateEmail, validatePassword } from '../utils/validateInput';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        showSuccess('Login successful!');
        navigate('/dashboard');
      } else {
        showError('Invalid credentials');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to MeetSense"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={Lock}
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
