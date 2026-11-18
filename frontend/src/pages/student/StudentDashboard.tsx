import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { 
  User, AlertTriangle, CheckCircle, Upload, Download, 
  Megaphone, Newspaper, Compass, Target, HelpCircle, 
  ChevronRight, ArrowRight, Star, Lightbulb, UserCheck, GraduationCap, Award as GoldAward
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { profile, token, logout, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Edit form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [rollNumber, setRollNumber] = useState(profile?.roll_number || '');
  const [cgpa, setCgpa] = useState(profile?.cgpa?.toString() || '');
  const [internships, setInternships] = useState(profile?.internships?.toString() || '0');
  const [arrears, setArrears] = useState(profile?.arrears?.toString() || '0');
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '');

  // File upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSuccess, setResumeSuccess] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Communications feeds
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [companyNews, setCompanyNews] = useState<any[]>([]);
  
  // Recommendation results state
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState<any | null>(null);

  useEffect(() => {
    // Initial data load
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [annRes, newsRes] = await Promise.all([
        fetch(`${API_BASE}/common/announcements`, { headers }),
        fetch(`${API_BASE}/common/company-news`, { headers })
      ]);
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (newsRes.ok) setCompanyNews(await newsRes.json());
    } catch (err) {
      console.error("Error fetching news feed", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess(null);
    setEditError(null);
    try {
      const response = await fetch(`${API_BASE}/student/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          roll_number: rollNumber,
          cgpa: parseFloat(cgpa) || 0.0,
          internships: parseInt(internships) || 0,
          arrears: parseInt(arrears) || 0,
          skills: skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }
      setEditSuccess('Profile updated successfully! Note: Changes to CGPA or internships require faculty re-verification.');
      setIsEditing(false);
      await refreshProfile();
    } catch (err: any) {
      setEditError(err.message || 'Error occurred.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setResumeError('Only PDF format resumes are supported.');
        return;
      }
      setResumeFile(file);
      setResumeError(null);
      setResumeSuccess(null);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    setUploading(true);
    setResumeError(null);
    setResumeSuccess(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await fetch(`${API_BASE}/student/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload resume.');
      }
      setResumeSuccess('Resume PDF stored directly in database as binary blob!');
      setResumeFile(null);
      await refreshProfile();
    } catch (err: any) {
      setResumeError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const runOpportunitiesAnalysis = async () => {
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    setAnalyticsData(null);
    setSelectedCompanyDetail(null);
    try {
      const response = await fetch(`${API_BASE}/student/analyze-opportunities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Analytics failed.');
      }
      setAnalyticsData(data);
    } catch (err: any) {
      setAnalyticsError(err.message || 'Could not fetch placement guidance.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Group eligible companies by category
  const getClusteredCompanies = () => {
    if (!analyticsData) return {};
    const groups: { [key: string]: any[] } = {
      "High CGPA + High Aptitude": [],
      "Technical Skill Focused Companies": [],
      "Service Companies": [],
      "Uncategorized": []
    };
    
    analyticsData.eligible_companies.forEach((item: any) => {
      const clust = item.company.cluster_type || 'Uncategorized';
      if (!groups[clust]) groups[clust] = [];
      groups[clust].push(item);
    });
    
    return groups;
  };

  const clustered = getClusteredCompanies();

  return (
    <div className="min-h-screen bg-navy-dark text-slate-100 font-sans pb-12">
      {/* Navbar */}
      <header className="border-b border-navy-border/60 bg-navy-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-teal-accent" />
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">IPERS</span>
              <span className="text-[10px] uppercase font-bold text-amber-500 block -mt-1 tracking-widest">Student Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{profile?.full_name}</p>
              <p className="text-xs text-slate-400">{profile?.roll_number}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-navy-border hover:border-red-500/50 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-xs font-semibold rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Block */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-accent/5 rounded-full filter blur-3xl pointer-events-none"></div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome back, {profile?.full_name}!</h2>
            <p className="text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
              Verify your placement evaluation metrics, manage your PDF resume, and run our intelligent recommendation engine to identify eligible career categories.
            </p>
          </div>
          <button
            onClick={runOpportunitiesAnalysis}
            className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-teal-main to-teal-hover hover:from-teal-hover hover:to-teal-main text-white font-bold rounded-2xl shadow-lg shadow-teal-main/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap text-sm"
          >
            <Compass className="w-5 h-5 text-white animate-pulse" />
            Analyze Placement Opportunities
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Profile Info & Resume Upload */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Academic Evaluation Profile Card */}
            <div className="glass-panel rounded-3xl p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-sans font-bold text-white text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-accent" />
                  Academic Profile
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setFullName(profile?.full_name || '');
                      setRollNumber(profile?.roll_number || '');
                      setCgpa(profile?.cgpa?.toString() || '');
                      setInternships(profile?.internships?.toString() || '0');
                      setArrears(profile?.arrears?.toString() || '0');
                      setSkills(profile?.skills?.join(', ') || '');
                      setIsEditing(true);
                      setEditSuccess(null);
                      setEditError(null);
                    }}
                    className="text-xs font-semibold text-teal-accent hover:text-white transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editSuccess && (
                <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-accent text-xs">
                  {editSuccess}
                </div>
              )}

              {editError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {editError}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        required
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Internships</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={internships}
                        onChange={(e) => setInternships(e.target.value)}
                        className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Arrears</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={arrears}
                        onChange={(e) => setArrears(e.target.value)}
                        className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-teal-main hover:bg-teal-hover text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border border-navy-border hover:bg-navy-dark text-slate-300 py-2 px-3 rounded-lg text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Name Roll */}
                  <div className="pb-3 border-b border-navy-border/50">
                    <p className="text-xs text-slate-400">Student Identity</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-white text-lg font-bold">{profile?.full_name}</h4>
                      {profile?.placed && (
                        <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/30 text-teal-accent text-[10px] font-bold rounded-full">
                          Placed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{profile?.roll_number}</p>
                    {profile?.placed && profile?.placed_company && (
                      <p className="text-[10px] text-slate-400 mt-1">Placed at: <span className="text-white font-semibold">{profile.placed_company}</span></p>
                    )}
                  </div>

                  {/* CGPA Badge */}
                  <div className="flex justify-between items-center py-1.5 border-b border-navy-border/30">
                    <div>
                      <p className="text-xs text-slate-400">Cumulative GPA</p>
                      <p className="text-white font-bold text-sm">{profile?.cgpa?.toFixed(2)}</p>
                    </div>
                    {profile?.cgpa_verified ? (
                      <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/30 text-teal-accent text-[10px] font-bold rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pending Faculty
                      </span>
                    )}
                  </div>

                  {/* Internship Badge */}
                  <div className="flex justify-between items-center py-1.5 border-b border-navy-border/30">
                    <div>
                      <p className="text-xs text-slate-400">Internship Placements</p>
                      <p className="text-white font-bold text-sm">{profile?.internships} completed</p>
                    </div>
                    {profile?.internships_verified ? (
                      <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/30 text-teal-accent text-[10px] font-bold rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pending Faculty
                      </span>
                    )}
                  </div>

                  {/* Arrears */}
                  <div className="py-1.5 border-b border-navy-border/30">
                    <p className="text-xs text-slate-400">Active Arrears</p>
                    <p className={`font-bold text-sm ${profile?.arrears > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                      {profile?.arrears} arrears
                    </p>
                  </div>

                  {/* Evaluation Scores (Faculty Controlled) */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2.5">Faculty Evaluation Scores</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-navy-dark/50 border border-navy-border/60 p-2.5 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Aptitude</p>
                        <p className="text-white font-extrabold text-base">{profile?.aptitude_score || '-'}</p>
                      </div>
                      <div className="bg-navy-dark/50 border border-navy-border/60 p-2.5 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Technical</p>
                        <p className="text-white font-extrabold text-base">{profile?.technical_score || '-'}</p>
                      </div>
                      <div className="bg-navy-dark/50 border border-navy-border/60 p-2.5 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Comm</p>
                        <p className="text-white font-extrabold text-base">{profile?.communication_score || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">Profile Key Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-navy-light text-[10px] font-semibold text-slate-300 rounded border border-navy-border">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No skills added yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resume Upload / Download Database storage widget */}
            <div className="glass-panel rounded-3xl p-6 relative">
              <h3 className="font-sans font-bold text-white text-base mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-accent" />
                Resume Vault
              </h3>
              
              {resumeSuccess && (
                <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-accent text-xs">
                  {resumeSuccess}
                </div>
              )}
              {resumeError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {resumeError}
                </div>
              )}

              <div className="space-y-4">
                {profile?.has_resume ? (
                  <div className="p-3 bg-navy-dark/40 border border-teal-accent/20 rounded-2xl flex items-center justify-between">
                    <div className="overflow-hidden mr-2">
                      <p className="text-xs font-semibold text-white truncate">{profile.resume_name}</p>
                      <p className="text-[10px] text-teal-accent font-medium">Binary BLOB in database</p>
                    </div>
                    <a
                      href={`${API_BASE}/student/resume/${profile.id}`}
                      className="p-2 bg-navy-light hover:bg-navy-hover border border-navy-border text-teal-accent rounded-xl transition-all"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-navy-dark/40 border border-dashed border-navy-border rounded-2xl text-center">
                    <p className="text-xs text-slate-500">No PDF Resume Uploaded</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block">Replace or Upload PDF Resume</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-navy-light file:text-slate-300 file:cursor-pointer hover:file:bg-navy-hover"
                  />
                  {resumeFile && (
                    <button
                      onClick={handleUploadResume}
                      disabled={uploading}
                      className="w-full mt-2 bg-teal-main hover:bg-teal-hover text-white text-xs font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Storing BLOB...' : 'Commit Upload to DB'}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Announcements and News Feeds */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Placement Announcements */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-sans font-bold text-white text-base mb-4 flex items-center gap-2 pb-3 border-b border-navy-border/50">
                <Megaphone className="w-4 h-4 text-amber-500" />
                Latest Announcements
              </h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {announcements.length > 0 ? (
                  announcements.map((a: any) => (
                    <div key={a.id} className="p-4 bg-navy-dark/30 border border-navy-border/80 hover:border-navy-border rounded-2xl transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white text-sm font-bold font-sans">{a.title}</h4>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
                      <p className="text-[10px] text-amber-500/80 mt-2 font-medium">Posted by: {a.created_by}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">No announcements posted yet.</p>
                )}
              </div>
            </div>

            {/* Company Updates Feed */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-sans font-bold text-white text-base mb-4 flex items-center gap-2 pb-3 border-b border-navy-border/50">
                <Newspaper className="w-4 h-4 text-teal-accent" />
                Company Hiring Updates
              </h3>

              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {companyNews.length > 0 ? (
                  companyNews.map((n: any) => (
                    <div key={n.id} className="p-4 bg-navy-dark/30 border border-navy-border/80 hover:border-navy-border rounded-2xl transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-teal-main/20 text-teal-accent border border-teal-main/50 text-[10px] font-bold rounded">
                            {n.company_name}
                          </span>
                          <h4 className="text-white text-sm font-bold font-sans">{n.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">No company updates posted yet.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Analytics Center Modal Overlay */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-dark/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-card border border-navy-border max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-navy-border/60 flex justify-between items-center bg-navy-card">
              <div className="flex items-center gap-2.5">
                <Compass className="w-6 h-6 text-teal-accent" />
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">IPERS Career Guidance Dashboard</h3>
                  <p className="text-[10px] text-slate-400">Powered by AI Recommendation Algorithms</p>
                </div>
              </div>
              <button
                onClick={() => setAnalyticsOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-navy-border hover:bg-navy-light transition-all"
              >
                Close Guidance
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {analyticsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-teal-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-slate-300 font-semibold animate-pulse">Running intelligent recommendation algorithms...</p>
                  <p className="text-[11px] text-slate-500 mt-2">Matching your profile with ideal career categories...</p>
                </div>
              ) : analyticsError ? (
                <div className="py-12 text-center text-red-400 text-sm">
                  <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-3" />
                  {analyticsError}
                </div>
              ) : (
                <>
                  {/* Summary Metric Profile Details */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-navy-dark/50 p-4 rounded-2xl border border-navy-border/50 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">STUDENT CGPA</p>
                      <p className="text-white font-extrabold text-sm">{analyticsData?.student_profile?.cgpa?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">INTERNSHIPS</p>
                      <p className="text-white font-extrabold text-sm">{analyticsData?.student_profile?.internships}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">ARREARS</p>
                      <p className="text-white font-extrabold text-sm">{analyticsData?.student_profile?.arrears}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">APTITUDE EVAL</p>
                      <p className="text-white font-extrabold text-sm">{analyticsData?.student_profile?.aptitude_score || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">TECHNICAL EVAL</p>
                      <p className="text-white font-extrabold text-sm">{analyticsData?.student_profile?.technical_score || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">COMM EVAL</p>
                      <p className="text-white font-extrabold text-sm">{analyticsData?.student_profile?.communication_score || '-'}</p>
                    </div>
                  </div>

                  {/* Categories section */}
                  <div>
                    <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-teal-accent" />
                      1. Company Category Recommendations
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Category 0: Tier 1 */}
                      <div className="bg-navy-dark/60 rounded-2xl border border-amber-500/20 p-5 relative overflow-hidden flex flex-col min-h-[220px]">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                          <GoldAward className="w-20 h-20 text-amber-500" />
                        </div>
                        <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold rounded-lg self-start mb-3">
                          Dream / Tier-1 Companies
                        </span>
                        <h5 className="text-white text-base font-bold mb-2">High CGPA + High Aptitude</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-4 flex-grow">
                          Companies requesting top marks (&gt;8.5 CGPA, &gt;80 Aptitude) and zero arrears.
                        </p>
                        <div className="space-y-1.5">
                          {clustered["High CGPA + High Aptitude"]?.length > 0 ? (
                            clustered["High CGPA + High Aptitude"].map((c: any) => (
                              <button
                                key={c.company.id}
                                onClick={() => setSelectedCompanyDetail(c)}
                                className="w-full text-left p-2 bg-navy-light/40 hover:bg-navy-light hover:border-amber-500/30 border border-navy-border/60 rounded-xl text-xs flex justify-between items-center transition-all text-white"
                              >
                                <span className="font-semibold">{c.company.name}</span>
                                <span className="text-[10px] text-teal-accent flex items-center gap-1 font-medium">Details <ChevronRight className="w-3 h-3" /></span>
                              </button>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">No eligible companies in this category.</p>
                          )}
                        </div>
                      </div>

                      {/* Category 1: Tech focused */}
                      <div className="bg-navy-dark/60 rounded-2xl border border-teal-accent/20 p-5 relative overflow-hidden flex flex-col min-h-[220px]">
                        <span className="px-2.5 py-1 bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-[10px] font-bold rounded-lg self-start mb-3">
                          R&D & Engineering Labs
                        </span>
                        <h5 className="text-white text-base font-bold mb-2">Technical Skill Focused</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-4 flex-grow">
                          Companies prioritizing high Technical Scores and practical projects/internships.
                        </p>
                        <div className="space-y-1.5">
                          {clustered["Technical Skill Focused Companies"]?.length > 0 ? (
                            clustered["Technical Skill Focused Companies"].map((c: any) => (
                              <button
                                key={c.company.id}
                                onClick={() => setSelectedCompanyDetail(c)}
                                className="w-full text-left p-2 bg-navy-light/40 hover:bg-navy-light hover:border-teal-accent/30 border border-navy-border/60 rounded-xl text-xs flex justify-between items-center transition-all text-white"
                              >
                                <span className="font-semibold">{c.company.name}</span>
                                <span className="text-[10px] text-teal-accent flex items-center gap-1 font-medium">Details <ChevronRight className="w-3 h-3" /></span>
                              </button>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">No eligible companies in this category.</p>
                          )}
                        </div>
                      </div>

                      {/* Category 2: Service Companies */}
                      <div className="bg-navy-dark/60 rounded-2xl border border-slate-500/20 p-5 relative overflow-hidden flex flex-col min-h-[220px]">
                        <span className="px-2.5 py-1 bg-slate-500/10 border border-slate-500/30 text-slate-300 text-[10px] font-bold rounded-lg self-start mb-3">
                          Mass Recruiters / Consultancies
                        </span>
                        <h5 className="text-white text-base font-bold mb-2">Service Sector</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-4 flex-grow">
                          Companies with lower CGPA thresholds, flexible aptitude criteria, and higher allowed active arrears.
                        </p>
                        <div className="space-y-1.5">
                          {clustered["Service Companies"]?.length > 0 ? (
                            clustered["Service Companies"].map((c: any) => (
                              <button
                                key={c.company.id}
                                onClick={() => setSelectedCompanyDetail(c)}
                                className="w-full text-left p-2 bg-navy-light/40 hover:bg-navy-light hover:border-slate-500/30 border border-navy-border/60 rounded-xl text-xs flex justify-between items-center transition-all text-white"
                              >
                                <span className="font-semibold">{c.company.name}</span>
                                <span className="text-[10px] text-teal-accent flex items-center gap-1 font-medium">Details <ChevronRight className="w-3 h-3" /></span>
                              </button>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">No eligible companies in this category.</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Selected Company Decision Tree Details Drawer/Card */}
                  {selectedCompanyDetail && (
                    <div className="p-6 bg-navy-dark/80 rounded-2xl border border-teal-accent/30 relative animate-fadeIn">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-teal-accent">2. Decision Tree Explanation</span>
                          <h4 className="text-white font-extrabold text-lg flex items-center gap-2">
                            {selectedCompanyDetail.company.name} Eligibility Routing
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedCompanyDetail(null)}
                          className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-navy-light/50 hover:bg-navy-light border border-navy-border rounded-lg"
                        >
                          Clear Details
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Company thresholds */}
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 mb-2 uppercase">Eligibility Parameters</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-navy-light/30 rounded border border-navy-border/60 flex justify-between">
                              <span className="text-slate-400">Min CGPA</span>
                              <span className="font-bold text-white">{selectedCompanyDetail.company.min_cgpa}</span>
                            </div>
                            <div className="p-2 bg-navy-light/30 rounded border border-navy-border/60 flex justify-between">
                              <span className="text-slate-400">Min Aptitude</span>
                              <span className="font-bold text-white">{selectedCompanyDetail.company.min_aptitude}</span>
                            </div>
                            <div className="p-2 bg-navy-light/30 rounded border border-navy-border/60 flex justify-between">
                              <span className="text-slate-400">Min Technical</span>
                              <span className="font-bold text-white">{selectedCompanyDetail.company.min_technical}</span>
                            </div>
                            <div className="p-2 bg-navy-light/30 rounded border border-navy-border/60 flex justify-between">
                              <span className="text-slate-400">Min Comm</span>
                              <span className="font-bold text-white">{selectedCompanyDetail.company.min_communication}</span>
                            </div>
                            <div className="p-2 bg-navy-light/30 rounded border border-navy-border/60 flex justify-between">
                              <span className="text-slate-400">Min Internships</span>
                              <span className="font-bold text-white">{selectedCompanyDetail.company.min_internships}</span>
                            </div>
                            <div className="p-2 bg-navy-light/30 rounded border border-navy-border/60 flex justify-between">
                              <span className="text-slate-400">Max Arrears</span>
                              <span className="font-bold text-white">{selectedCompanyDetail.company.allowed_arrears}</span>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-teal-main/10 border border-teal-main/30 rounded-xl text-xs text-slate-300">
                            <p className="font-semibold text-white mb-1">Recommendation Verdict:</p>
                            <p>{selectedCompanyDetail.why_recommended}</p>
                          </div>
                        </div>

                        {/* Decision tree node routing */}
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 mb-2 uppercase">Decision Tree Execution Trajectory</h5>
                          <div className="space-y-2">
                            {selectedCompanyDetail.decision_path.map((step: string, idx: number) => {
                              const isPass = step.includes("Passed");
                              return (
                                <div key={idx} className={`p-2 rounded-xl text-xs border flex items-center gap-2 ${
                                  isPass 
                                    ? 'bg-teal-500/5 border-teal-500/10 text-slate-300' 
                                    : 'bg-red-500/5 border-red-500/10 text-red-300'
                                }`}>
                                  <span className={`w-2 h-2 rounded-full ${isPass ? 'bg-teal-accent' : 'bg-red-500'}`}></span>
                                  {step}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Decision Tree Ineligible list */}
                  <div>
                    <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      2. Ineligible Opportunities & Target Criteria
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {analyticsData?.ineligible_companies?.length > 0 ? (
                        analyticsData.ineligible_companies.map((item: any) => (
                          <div key={item.company.id} className="p-4 bg-navy-dark/40 border border-navy-border rounded-xl">
                            <p className="text-xs font-bold text-slate-300">{item.company.name}</p>
                            <p className="text-[10px] text-red-400 font-medium mb-2.5">Ineligible Path</p>
                            <div className="space-y-1">
                              {item.failures.map((fail: string, idx: number) => (
                                <p key={idx} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-red-400"></span>
                                  {fail}
                                </p>
                              ))}
                            </div>
                            <button
                              onClick={() => setSelectedCompanyDetail(item)}
                              className="mt-3 text-[10px] text-slate-400 hover:text-white font-semibold flex items-center gap-0.5 border-t border-navy-border/60 pt-2 w-full text-left"
                            >
                              See Tree Path <ArrowRight className="w-3 h-3 text-teal-accent" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">Excellent! You are eligible for all currently active listings.</p>
                      )}
                    </div>
                  </div>

                  {/* Similar Alumni Placement Matches */}
                  <div>
                    <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-accent" />
                      3. Historical Profile Match (Career Blueprint)
                    </h4>
                    <p className="text-xs text-slate-400 mb-4 -mt-2">
                      The AI recommendation model analyzed similar historical alumni profiles to map where they got placed:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {analyticsData?.similar_students?.map((s: any, idx: number) => (
                        <div key={idx} className="bg-navy-dark/60 border border-navy-border rounded-2xl p-5 relative overflow-hidden">
                          
                          {/* Similarity Score bar */}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white font-sans">{s.name}</span>
                            <span className="px-2 py-0.5 bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-[10px] font-bold rounded">
                              {s.similarity_score}% Similar
                            </span>
                          </div>

                          <div className="w-full bg-navy-dark/80 h-1 rounded-full overflow-hidden mb-4 border border-navy-border/30">
                            <div className="bg-teal-accent h-full" style={{ width: `${s.similarity_score}%` }}></div>
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-4 text-slate-300">
                            <div className="p-1 bg-navy-light/25 rounded">
                              <span className="block text-[8px] text-slate-500 uppercase">CGPA</span>
                              <span className="font-bold text-white">{s.cgpa}</span>
                            </div>
                            <div className="p-1 bg-navy-light/25 rounded">
                              <span className="block text-[8px] text-slate-500 uppercase">Tech</span>
                              <span className="font-bold text-white">{s.technical_score}</span>
                            </div>
                            <div className="p-1 bg-navy-light/25 rounded">
                              <span className="block text-[8px] text-slate-500 uppercase">Interns</span>
                              <span className="font-bold text-white">{s.internships}</span>
                            </div>
                          </div>

                          {/* Outcome badge */}
                          <div className="p-3 bg-teal-main/10 border border-teal-main/30 rounded-xl flex items-center justify-between text-xs text-slate-300">
                            <span>Placed Outcome:</span>
                            <span className="font-bold text-teal-accent flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-teal-accent/20" />
                              {s.placed_at}
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvement Checklist */}
                  <div className="border-t border-navy-border/60 pt-6">
                    <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                      4. Personalized Career Improvement Suggestions
                    </h4>
                    
                    <div className="space-y-3">
                      {analyticsData?.improvement_suggestions?.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-navy-dark/40 border border-navy-border rounded-2xl flex items-start gap-4">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                            item.priority === 'High' 
                              ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                              : item.priority === 'Medium' 
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500' 
                                : 'bg-teal-500/10 border border-teal-500/30 text-teal-accent'
                          }`}>
                            {item.priority} Priority
                          </span>
                          <div>
                            <p className="text-white font-bold text-xs mb-1 font-sans">{item.category}</p>
                            <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-navy-dark border-t border-navy-border/60 flex justify-end">
              <button
                onClick={() => setAnalyticsOpen(false)}
                className="px-5 py-2 bg-teal-main hover:bg-teal-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-main/10"
              >
                Done / Close Center
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
