import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialFormData = {
  name: '',
  mobile: '',
  password: '',
  state: '',
  district: '',
};

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleModeToggle = () => {
    setIsSignup((currentMode) => !currentMode);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    const payload = isSignup
      ? formData
      : {
          mobile: formData.mobile,
          password: formData.password,
        };

    try {
      const { data } = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      login(data.user);
      toast.success(data.message);
      navigate('/');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to complete authentication request';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_35%),linear-gradient(135deg,#020617,_#0f172a_45%,_#1e293b)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-2xl backdrop-blur">
        <div className="hidden w-1/2 flex-col justify-between bg-slate-950 px-10 py-12 text-white lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Crusher</p>
            <h1 className="mt-6 text-5xl font-black leading-tight">Manage site operations with one login.</h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-slate-300">
              Create a user account with mobile, state, and district details, then sign in from this dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Auth API</p>
            <p className="mt-2 font-mono text-sm text-cyan-300">{API_BASE_URL}/api/auth</p>
          </div>
        </div>

        <div className="w-full px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12 lg:py-12">
          <div className="mb-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => !isSignup || handleModeToggle()}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !isSignup ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => isSignup || handleModeToggle()}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isSignup ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Signup
              </button>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-slate-900">
              {isSignup ? 'Create user account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isSignup
                ? 'Register a new user with mobile and location details.'
                : 'Login using your mobile number and password.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Enter password"
                required
              />
            </div>

            {isSignup && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    placeholder="Enter district"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? isSignup
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignup
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            {isSignup ? 'Already registered?' : 'Need a new account?'}{' '}
            <button
              type="button"
              onClick={handleModeToggle}
              className="font-semibold text-cyan-700 transition hover:text-cyan-900"
            >
              {isSignup ? 'Login here' : 'Create one here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
