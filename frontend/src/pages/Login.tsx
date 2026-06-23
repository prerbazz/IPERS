import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, BookOpen, GraduationCap, Mail, Lock, User, FileText, Briefcase, Award, ArrowLeft, BarChart2, ChevronRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [activeScreen, setActiveScreen] = useState<'roles' | 'form'>('roles');
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

  const handleRoleSelect = (r: 'student' | 'faculty' | 'tpc') => {
    setRole(r);
    setActiveScreen('form');
    setIsLogin(true);
    setError(null);
    setSuccess(null);
  };

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
    <div className="flex min-h-screen bg-[#0F172A] overflow-hidden font-sans">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex w-[45%] flex-col justify-center px-12 relative border-r border-navy-border/30 bg-[#0B1120]">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-accent/5 rounded-full filter blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>
        
        <div className="z-10 mb-12 flex items-center gap-3">
           <div className="bg-teal-main p-2 rounded-xl border border-teal-main/50 shadow-lg shadow-teal-main/20">
             <BarChart2 className="w-6 h-6 text-white"/>
           </div>
           <span className="text-xl font-bold text-white tracking-widest">IPERS</span>
        </div>

        <h1 className="text-[3.5rem] font-extrabold text-white leading-[1.1] z-10 mb-6">
          Intelligent <br/>
          <span className="text-teal-accent">Placement</span> <br/>
          Intelligence
        </h1>
        
        <p className="text-slate-400 text-lg max-w-md z-10 mb-12 leading-relaxed">
          AI-powered placement eligibility and recommendation system for university students. Get matched with the right opportunities.
        </p>

        <div className="flex gap-4 z-10 mb-16">
          <div className="bg-navy-card/40 border border-navy-border/50 p-4 rounded-2xl w-32 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-1">2,847</h3>
            <p className="text-slate-400 text-xs">Students</p>
          </div>
          <div className="bg-navy-card/40 border border-navy-border/50 p-4 rounded-2xl w-32 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-1">156</h3>
            <p className="text-slate-400 text-xs">Companies</p>
          </div>
          <div className="bg-navy-card/40 border border-navy-border/50 p-4 rounded-2xl w-32 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-1">89%</h3>
            <p className="text-slate-400 text-xs">Placement Rate</p>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-12 text-slate-500/70 text-xs z-10 font-medium">
          © 2024 IPERS · University Placement Intelligence Platform
        </div>
      </div>

      {/* Right Column - Interaction */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 lg:px-24 bg-[#0F172A] relative z-10">
         {activeScreen === 'roles' ? (
           <div className="max-w-lg w-full mx-auto">
             <h2 className="text-[2rem] font-bold text-white mb-2">Welcome Back</h2>
             <p className="text-slate-400 mb-8 font-medium">Select your role to continue</p>
             
             <div className="space-y-4">
               {/* Role Cards */}
               <button onClick={() => handleRoleSelect('student')} className="w-full flex items-center p-6 bg-navy-card/50 border border-navy-border hover:border-teal-accent/50 rounded-2xl transition-all group text-left hover:bg-navy-card">
                 <div className="bg-teal-500/10 p-3.5 rounded-xl mr-5 group-hover:scale-110 transition-transform">
                   <GraduationCap className="w-6 h-6 text-teal-accent" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-white font-bold text-[1.1rem]">Student Login</h3>
                   <p className="text-slate-400 text-sm mt-1">View placement eligibility, apply to drives, track your progress</p>
                   <p className="text-teal-accent text-xs mt-2.5 font-medium">2,847 Active Students</p>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-accent transition-colors" />
               </button>
               
               <button onClick={() => handleRoleSelect('faculty')} className="w-full flex items-center p-6 bg-navy-card/50 border border-navy-border hover:border-purple-500/50 rounded-2xl transition-all group text-left hover:bg-navy-card">
                 <div className="bg-purple-500/10 p-3.5 rounded-xl mr-5 group-hover:scale-110 transition-transform">
                   <User className="w-6 h-6 text-purple-400" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-white font-bold text-[1.1rem]">Faculty Login</h3>
                   <p className="text-slate-400 text-sm mt-1">Evaluate students, update communication & technical scores</p>
                   <p className="text-purple-400 text-xs mt-2.5 font-medium">124 Faculty Members</p>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
               </button>

               <button onClick={() => handleRoleSelect('tpc')} className="w-full flex items-center p-6 bg-navy-card/50 border border-navy-border hover:border-amber-500/50 rounded-2xl transition-all group text-left hover:bg-navy-card">
                 <div className="bg-amber-500/10 p-3.5 rounded-xl mr-5 group-hover:scale-110 transition-transform">
                   <Briefcase className="w-6 h-6 text-amber-500" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-white font-bold text-[1.1rem]">Placement Coordinator</h3>
                   <p className="text-slate-400 text-sm mt-1">Manage companies, post drives, monitor placement analytics</p>
                   <p className="text-amber-500 text-xs mt-2.5 font-medium">TPC Portal</p>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-500 transition-colors" />
               </button>
             </div>
             
             <div className="mt-16 text-center text-slate-500 text-xs font-medium">
               Powered by AI-based Placement Prediction Engine
             </div>
           </div>
         ) : (
           <div className="max-w-md w-full mx-auto">
             <button onClick={() => setActiveScreen('roles')} className="flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors font-medium">
               <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Roles
             </button>

             <div className="glass-panel-glow rounded-3xl p-8 relative">
               <h2 className="text-2xl font-bold text-white mb-1 capitalize">
                 {role === 'tpc' ? 'Coordinator' : role} Portal
               </h2>
               <p className="text-slate-400 mb-6 text-sm">Sign in or create a new account</p>
               
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
                       <Lock className="w-4 h-4" />
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
                   <span className="text-xs text-slate-500 block mb-3">Quick Demo Login</span>
                   <div className="flex flex-wrap gap-2 justify-center">
                     <button
                       onClick={() => { setUsername('student'); setPassword('student123'); }}
                       className="px-3 py-1.5 bg-navy-dark/60 border border-navy-border hover:border-teal-accent/30 text-xs text-slate-400 hover:text-white rounded-lg transition-all"
                     >
                       Demo Student
                     </button>
                     <button
                       onClick={() => { setUsername('faculty'); setPassword('faculty123'); }}
                       className="px-3 py-1.5 bg-navy-dark/60 border border-navy-border hover:border-purple-400/30 text-xs text-slate-400 hover:text-white rounded-lg transition-all"
                     >
                       Demo Faculty
                     </button>
                     <button
                       onClick={() => { setUsername('tpc'); setPassword('tpc123'); }}
                       className="px-3 py-1.5 bg-navy-dark/60 border border-navy-border hover:border-amber-500/30 text-xs text-slate-400 hover:text-white rounded-lg transition-all"
                     >
                       Demo TPC
                     </button>
                   </div>
                 </div>
               )}

             </div>
           </div>
         )}
      </div>
    </div>
  );
};
