import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, BookOpen, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    
    setIsLoading(false);
    
    if (result.success) {
      navigate('/feed');
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl float" style={{ animationDelay: '-1.5s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl mb-4 border border-white/30 hover-lift">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join EduConnect</h1>
          <p className="text-white/70 mt-1">Start your learning journey today</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 hover-lift">
          {/* Error message */}
          {(error || formError) && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error || formError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-indigo-500 transition-all outline-none input-animated bg-gray-50 focus:bg-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  placeholder="student@university.edu"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-indigo-500 transition-all outline-none input-animated bg-gray-50 focus:bg-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all card-hover ${
                    formData.role === 'student'
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-100'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.role === 'student' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className={`font-semibold ${formData.role === 'student' ? 'text-indigo-700' : 'text-gray-600'}`}>
                    Student
                  </span>
                  {formData.role === 'student' && (
                    <span className="text-xs text-indigo-500">✓ Selected</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'teacher' })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all card-hover ${
                    formData.role === 'teacher'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg shadow-purple-100'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.role === 'teacher' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className={`font-semibold ${formData.role === 'teacher' ? 'text-purple-700' : 'text-gray-600'}`}>
                    Teacher
                  </span>
                  {formData.role === 'teacher' && (
                    <span className="text-xs text-purple-500">✓ Selected</span>
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-indigo-500 transition-all outline-none input-animated bg-gray-50 focus:bg-white"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength < 2 ? 'text-red-500' : passwordStrength < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {passwordStrength > 0 && strengthTexts[passwordStrength - 1]} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-0 transition-all outline-none input-animated bg-gray-50 focus:bg-white ${
                    formData.confirmPassword && formData.confirmPassword !== formData.password
                      ? 'border-red-300 focus:border-red-500'
                      : formData.confirmPassword && formData.confirmPassword === formData.password
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-200 focus:border-indigo-500'
                  }`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 mt-0.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-300/50 btn-glow disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Moodle Login */}
          <button className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-3 btn-glow">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Continue with Moodle
          </button>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-500">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
