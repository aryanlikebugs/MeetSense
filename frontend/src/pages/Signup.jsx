import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { validateEmail, validatePassword, validateName } from '../utils/validateInput';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
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
    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }
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
      const result = await signup(formData.name, formData.email, formData.password);
      if (result.success) {
        showSuccess('Account created successfully!');
        navigate('/dashboard');
      } else {
        showError('Failed to create account');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join MeetSense today"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Full Name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={User}
          required
        />

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
          placeholder="Create a password"
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
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
