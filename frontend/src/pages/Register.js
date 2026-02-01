import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    firstName: '',
    lastName: '',
  });

  const { username, email, password, password2, firstName, lastName } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        username,
        email,
        password,
        firstName,
        lastName,
      };

      dispatch(register(userData));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Register</h1>
        <p>Create your Moodle Social Network account</p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              placeholder="Username"
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Email"
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              placeholder="First Name"
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              placeholder="Last Name"
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              placeholder="Confirm password"
              onChange={onChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
