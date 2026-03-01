import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate()
  const [isActive, setIsActive] = useState(false)
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('user', JSON.stringify(signupData))
    setSuccessMsg('Registration successful! You can now log in.')
    setError('')
    setIsActive(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const stored = localStorage.getItem('user')
    if (!stored) { setError('No account found. Please register first.'); return }
    const user = JSON.parse(stored)
    if (user.email === loginData.email && user.password === loginData.password) {
      localStorage.setItem('loggedIn', 'true')
      navigate('/')
    } else {
      setError('Invalid credentials. Please try again.')
    }
  }

  const handleSocialLogin = async (provider: any) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // We store the essential info in localStorage so your 
    // existing dashboard logic can still access it.
    localStorage.setItem('user', JSON.stringify({
      name: user.displayName,
      email: user.email,
      photo: user.photoURL // Now you can show their real DP!
    }));
    localStorage.setItem('loggedIn', 'true');

    navigate('/');
  } catch (err: any) {
    console.error("Auth Error:", err.code);
    setError("Social login failed. Please try again.");
  }
};
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(to left, #2ebf91, #8360c3)' }}
    >
      <div
        className={`container relative overflow-hidden rounded-3xl shadow-2xl bg-white transition-all duration-500 ${isActive ? 'active' : ''}`}
        style={{ 
          width: '100%', 
          maxWidth: 768, 
          minHeight: 550 // Increased min-height for better mobile spacing
        }}
      >
        {/* --- Sign Up Panel --- */}
        <div
          className="form-container absolute top-0 h-full w-full md:w-1/2 transition-all duration-500"
          style={{
            left: 0,
            zIndex: isActive ? 5 : 1,
            opacity: isActive ? 1 : 0,
            // On mobile, we stay centered. On desktop, we slide.
            transform: typeof window !== 'undefined' && window.innerWidth < 768 
              ? 'none' 
              : (isActive ? 'translateX(100%)' : 'translateX(0)'),
          }}
        >
          <form
            onSubmit={handleSignup}
            className="bg-white flex flex-col items-center justify-center h-full px-6 md:px-10 gap-3"
          >
            <h1 className="text-2xl font-bold text-gray-800">Register With</h1>
            <div className="flex gap-4 my-2">
  {/* Google Login Button */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin(googleProvider)}
    className="w-10 h-10 border border-gray-400 rounded-lg flex items-center justify-center hover:border-purple-600 transition-all bg-white shadow-sm"
    title="Login with Google"
  >
    <i className="fa-brands fa-google text-red-500 text-lg" />
  </button>

  {/* GitHub Login Button */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin(githubProvider)}
    className="w-10 h-10 border border-gray-400 rounded-lg flex items-center justify-center hover:border-purple-600 transition-all bg-white shadow-sm"
    title="Login with GitHub"
  >
    <i className="fa-brands fa-github text-black text-lg" />
  </button>
</div>
            <hr className="w-full" />
            <span className="text-sm font-bold text-gray-600">OR</span>
            <hr className="w-full" />
            <span className="text-xs text-center text-gray-500">Fill Out The Following Info For Registration</span>
            <input className="w-full p-3 bg-gray-200 rounded text-sm outline-none" type="text" placeholder="Name" required value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} />
            <input className="w-full p-3 bg-gray-200 rounded text-sm outline-none" type="email" placeholder="Email" required value={signupData.email} onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
            <input className="w-full p-3 bg-gray-200 rounded text-sm outline-none" type="password" placeholder="Password" required value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
            <button type="submit" className="mt-2 px-10 py-2 bg-green-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-green-800 transition-colors">
              Sign Up
            </button>
            
            {/* Mobile Toggle Trigger */}
            <p className="md:hidden text-xs text-gray-600 mt-2">
              Already have an account? <button type="button" onClick={() => setIsActive(false)} className="text-purple-700 font-bold">Sign In</button>
            </p>
            {successMsg && <p className="text-green-600 text-xs text-center">{successMsg}</p>}
          </form>
        </div>

        {/* --- Sign In Panel --- */}
        <div
          className="form-container absolute top-0 h-full w-full md:w-1/2 transition-all duration-500"
          style={{
            left: 0,
            zIndex: isActive ? 1 : 2,
            opacity: isActive ? 0 : 1, // Added opacity for smoother mobile transition
            transform: typeof window !== 'undefined' && window.innerWidth < 768 
              ? 'none' 
              : (isActive ? 'translateX(100%)' : 'translateX(0)'),
          }}
        >
          <form
            onSubmit={handleLogin}
            className="bg-white flex flex-col items-center justify-center h-full px-6 md:px-10 gap-3"
          >
            <h1 className="text-2xl font-bold text-gray-800">Login With</h1>
            <div className="flex gap-4 my-2">
  {/* Google Login Button */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin(googleProvider)}
    className="w-10 h-10 border border-gray-400 rounded-lg flex items-center justify-center hover:border-purple-600 transition-all bg-white shadow-sm"
    title="Login with Google"
  >
    <i className="fa-brands fa-google text-red-500 text-lg" />
  </button>

  {/* GitHub Login Button */}
  <button 
    type="button" 
    onClick={() => handleSocialLogin(githubProvider)}
    className="w-10 h-10 border border-gray-400 rounded-lg flex items-center justify-center hover:border-purple-600 transition-all bg-white shadow-sm"
    title="Login with GitHub"
  >
    <i className="fa-brands fa-github text-black text-lg" />
  </button>
</div>
            <hr className="w-full" />
            <span className="text-sm font-bold text-gray-600">OR</span>
            <hr className="w-full" />
            <span className="text-xs text-center text-gray-500">Login With Your Email & Password</span>
            <input className="w-full p-3 bg-gray-200 rounded text-sm outline-none" type="email" placeholder="Email" required value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
            <input className="w-full p-3 bg-gray-200 rounded text-sm outline-none" type="password" placeholder="Password" required value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button type="submit" className="mt-2 px-10 py-2 bg-green-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-green-800 transition-colors">
              Login
            </button>
            
            {/* Mobile Toggle Trigger */}
            <p className="md:hidden text-xs text-gray-600 mt-2">
              Don't have an account? <button type="button" onClick={() => setIsActive(true)} className="text-purple-700 font-bold">Sign Up</button>
            </p>
          </form>
        </div>

        {/* --- Toggle Container (Hidden on Mobile) --- */}
        <div
          className="toggle-container hidden md:block"
          style={{
            transform: isActive ? 'translateX(-100%)' : 'translateX(0)',
            borderRadius: isActive ? '0 150px 100px 0' : '150px 0 0 100px',
          }}
        >
          <div
            className="toggle text-white h-full relative"
            style={{
              background: 'linear-gradient(to right, #503b76, #3a2561)',
              left: '-100%',
              width: '200%',
              transform: isActive ? 'translateX(50%)' : 'translateX(0)',
              transition: 'all 0.6s ease-in-out',
            }}
          >
            <div
              className="toggle-panel toggle-left"
              style={{ transform: isActive ? 'translateX(0)' : 'translateX(-200%)' }}
            >
              <img src="/logo.png" alt="StudyDash Logo" className="w-48 h-auto mb-6 object-contain mix-blend-mode-multiply" />
              <h1 className="text-2xl font-bold mb-3">Welcome Back!</h1>
              <p className="text-sm mb-5 px-4">Provide your personal details to use all features</p>
              <button
                onClick={() => setIsActive(false)}
                className="px-10 py-2 bg-transparent border-2 border-white text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/20 transition-colors"
              >
                Sign In
              </button>
            </div>

            <div
              className="toggle-panel toggle-right"
              style={{ right: 0, transform: isActive ? 'translateX(200%)' : 'translateX(0)' }}
            >
              <img src="/logo.png" alt="StudyDash Logo" className="w-48 h-auto mb-6 object-contain mix-blend-mode-multiply" />
              <h1 className="text-2xl font-bold mb-3">Hello!</h1>
              <p className="text-sm mb-5 px-4">Register to use all features in our site</p>
              <button
                onClick={() => setIsActive(true)}
                className="px-10 py-2 bg-transparent border-2 border-white text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/20 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}