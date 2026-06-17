import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, BookOpen, GraduationCap, Mail, Lock, User, FileText, Briefcase, Award } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'faculty' | 'tpc'>('student');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  // Student Specific
  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [internships, setInternships] = useState('0');
  const [arrears, setArrears] = useState('0');
  const [skills, setSkills] = useState('');
  // Faculty Specific
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!username || !password) {
          throw new Error('Please enter both username and password.');
        }
        await login(username, password);
      } else {
        if (!username || !email || !password || !fullName) {
          throw new Error('Please fill out all required fields.');
        }
        
        const regData: any = {
          username,
          email,
          password,
          role,
          full_name: fullName
        };

        if (role === 'student') {
          if (!rollNumber) throw new Error('Roll number is required for students.');
          regData.roll_number = rollNumber;
          regData.cgpa = parseFloat(cgpa) || 0.0;
          regData.internships = parseInt(internships) || 0;
          regData.arrears = parseInt(arrears) || 0;
          regData.skills = skills;
        } else if (role === 'faculty') {
          regData.department = department;
        }

        await register(regData);
        setSuccess('Registration successful! Please login with your credentials.');
        setIsLogin(true);
        // Clear inputs
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-navy-dark min-h-screen">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-accent/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-accent/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-navy-card border border-teal-accent/20 rounded-2xl mb-4 shadow-lg shadow-teal-accent/5">
            <GraduationCap className="w-10 h-10 text-teal-accent" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans bg-clip-text bg-gradient-to-r from-white via-slate-100 to-teal-accent">
            IPERS PORTAL
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Intelligent Placement Eligibility & Recommendation Portal using Data Mining
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel-glow rounded-3xl p-8 relative">
          
          {/* Tab Selection */}
          <div className="flex bg-navy-dark/60 p-1 rounded-xl mb-6 border border-navy-border/60">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isLogin 
                  ? 'bg-teal-main text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isLogin 
                  ? 'bg-teal-main text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Role Selector (Register Only) */}
          {!isLogin && (
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2 bg-navy-dark/40 p-1 rounded-xl border border-navy-border/50">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all text-xs ${
                    role === 'student'
                      ? 'border-teal-accent/50 bg-teal-main/20 text-teal-accent'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <User className="w-4 h-4 mb-1" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all text-xs ${
                    role === 'faculty'
                      ? 'border-teal-accent/50 bg-teal-main/20 text-teal-accent'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mb-1" />
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setRole('tpc')}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all text-xs ${
                    role === 'tpc'
                      ? 'border-teal-accent/50 bg-teal-main/20 text-teal-accent'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4 mb-1" />
                  Coordinator
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 flex-shrink-0 animate-pulse"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-accent text-xs flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-accent mr-2 flex-shrink-0 animate-pulse"></span>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-navy-dark/80 border border-navy-border hover:border-navy-light focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  placeholder="e.g. prerna_p"
                />
              </div>
            </div>

            {/* Email (Register Only) */}
            {!isLogin && (
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-navy-border hover:border-navy-light focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    placeholder="email@university.edu"
                  />
                </div>
              </div>
            )}

            {/* Full Name (Register Only) */}
            {!isLogin && (
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-navy-border hover:border-navy-light focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    placeholder="e.g. Prerna Premkumar"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-dark/80 border border-navy-border hover:border-navy-light focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Student Specific Fields (Register Only) */}
            {!isLogin && role === 'student' && (
              <div className="space-y-4 pt-2 border-t border-navy-border/50">
                <h3 className="text-xs font-bold text-teal-accent tracking-wider uppercase">Student Academic Info</h3>
                
                {/* Roll Number */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                    placeholder="e.g. CS2026001"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* CGPA */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full bg-navy-dark/80 border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                      placeholder="8.5"
                    />
                  </div>

                  {/* Internships */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Internships</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={internships}
                      onChange={(e) => setInternships(e.target.value)}
                      className="w-full bg-navy-dark/80 border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                    />
                  </div>

                  {/* Arrears */}
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Arrears</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={arrears}
                      onChange={(e) => setArrears(e.target.value)}
                      className="w-full bg-navy-dark/80 border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                    placeholder="React, Node.js, Python"
                  />
                </div>
              </div>
            )}

            {/* Faculty Specific Fields (Register Only) */}
            {!isLogin && role === 'faculty' && (
              <div className="space-y-4 pt-2 border-t border-navy-border/50">
                <h3 className="text-xs font-bold text-teal-accent tracking-wider uppercase">Faculty Info</h3>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-main hover:bg-teal-hover text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-md shadow-teal-main/10 flex justify-center items-center gap-2 mt-4 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : isLogin ? (
                <>
                  <Briefcase className="w-4 h-4" />
                  Sign In to Portal
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>
          
          {/* Quick Login Assist (For Demo Convenience) */}
          {isLogin && (
            <div className="mt-6 pt-4 border-t border-navy-border/50 text-center">
              <span className="text-xs text-slate-500 block mb-2">Demo Credentials (Password: role + 123)</span>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => { setUsername('student'); setPassword('student123'); }}
                  className="px-2.5 py-1 bg-navy-dark/60 border border-navy-border hover:border-teal-accent/30 text-[10px] text-slate-400 hover:text-white rounded-md transition-all"
                >
                  Student Demo
                </button>
                <button
                  onClick={() => { setUsername('faculty'); setPassword('faculty123'); }}
                  className="px-2.5 py-1 bg-navy-dark/60 border border-navy-border hover:border-teal-accent/30 text-[10px] text-slate-400 hover:text-white rounded-md transition-all"
                >
                  Faculty Demo
                </button>
                <button
                  onClick={() => { setUsername('tpc'); setPassword('tpc123'); }}
                  className="px-2.5 py-1 bg-navy-dark/60 border border-navy-border hover:border-teal-accent/30 text-[10px] text-slate-400 hover:text-white rounded-md transition-all"
                >
                  TPC Demo
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
