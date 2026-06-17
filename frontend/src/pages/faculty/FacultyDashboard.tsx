import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { 
  Search, BookOpen, User, Check, AlertTriangle, FileText, 
  Download, Edit3, Award, GraduationCap, RefreshCw 
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { token, logout, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected student details & editor state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [aptitude, setAptitude] = useState('0');
  const [technical, setTechnical] = useState('0');
  const [communication, setCommunication] = useState('0');
  const [cgpaVerified, setCgpaVerified] = useState(false);
  const [internshipsVerified, setInternshipsVerified] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/faculty/students?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve student records.');
      }
      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

  const openEvaluationPanel = (student: any) => {
    setSelectedStudent(student);
    setAptitude(student.aptitude_score?.toString() || '0');
    setTechnical(student.technical_score?.toString() || '0');
    setCommunication(student.communication_score?.toString() || '0');
    setCgpaVerified(student.cgpa_verified);
    setInternshipsVerified(student.internships_verified);
    setUpdateSuccess(null);
    setUpdateError(null);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setUpdating(true);
    setUpdateSuccess(null);
    setUpdateError(null);

    try {
      const response = await fetch(`${API_BASE}/faculty/students/${selectedStudent.id}/evaluation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aptitude_score: parseInt(aptitude) || 0,
          technical_score: parseInt(technical) || 0,
          communication_score: parseInt(communication) || 0,
          cgpa_verified: cgpaVerified,
          internships_verified: internshipsVerified
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update evaluation.');
      }
      setUpdateSuccess('Student evaluation and verification statuses updated successfully!');
      
      // Update selected student in local list
      setSelectedStudent(data.profile);
      setStudents(prev => prev.map(s => s.id === data.profile.id ? data.profile : s));
    } catch (err: any) {
      setUpdateError(err.message || 'Error saving changes.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark text-slate-100 font-sans pb-12">
      {/* Navbar */}
      <header className="border-b border-navy-border/60 bg-navy-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-teal-accent" />
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">IPERS</span>
              <span className="text-[10px] uppercase font-bold text-amber-500 block -mt-1 tracking-widest">Faculty Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{profile?.name}</p>
              <p className="text-xs text-slate-400">{profile?.department}</p>
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
        
        {/* Title */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Student Evaluation Hub</h2>
            <p className="text-slate-400 text-sm mt-1">
              Search students, verify self-reported fields (CGPA, Internships), and enter benchmark test scores.
            </p>
          </div>
          <button
            onClick={() => fetchStudents(searchQuery)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-card border border-navy-border hover:border-teal-accent/30 hover:bg-navy-light text-slate-300 hover:text-white rounded-xl text-xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Students
          </button>
        </div>

        {/* Dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Card */}
            <div className="glass-panel rounded-3xl p-5">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students by roll number or full name..."
                    className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/55 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-main hover:bg-teal-hover text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Students Table */}
            <div className="glass-panel rounded-3xl p-6 overflow-hidden">
              <h3 className="font-sans font-bold text-white text-base mb-4">Student Records</h3>
              
              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-2 border-teal-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center bg-red-500/10 text-red-400 rounded-xl text-xs">{error}</div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs italic">No student profiles found. Try checking seed data or register a new one.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-navy-border/60 text-slate-400 font-semibold">
                        <th className="pb-3 pr-2">Roll Number</th>
                        <th className="pb-3 px-2">Name</th>
                        <th className="pb-3 px-2 text-center">CGPA</th>
                        <th className="pb-3 px-2 text-center">Internships</th>
                        <th className="pb-3 px-2 text-center">Scores (A/T/C)</th>
                        <th className="pb-3 pl-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/30">
                      {students.map((student) => {
                        const verified = student.cgpa_verified && student.internships_verified;
                        return (
                          <tr key={student.id} className="hover:bg-navy-light/20 transition-colors">
                            <td className="py-3.5 pr-2 font-mono text-slate-300 font-semibold">{student.roll_number}</td>
                            <td className="py-3.5 px-2">
                              <div>
                                <p className="font-bold text-white">{student.full_name}</p>
                                <div className="flex gap-1.5 mt-0.5">
                                  {student.arrears > 0 ? (
                                    <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-bold rounded">
                                      {student.arrears} Arrears
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-accent text-[8px] font-bold rounded">
                                      0 Arrears
                                    </span>
                                  )}
                                  {verified ? (
                                    <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-accent text-[8px] rounded flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" /> Verified
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] rounded flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" /> Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-center font-bold">{student.cgpa.toFixed(2)}</td>
                            <td className="py-3.5 px-2 text-center">{student.internships}</td>
                            <td className="py-3.5 px-2 text-center">
                              <span className="font-mono text-slate-300">
                                {student.aptitude_score || '-'}/{student.technical_score || '-'}/{student.communication_score || '-'}
                              </span>
                            </td>
                            <td className="py-3.5 pl-2 text-right">
                              <button
                                onClick={() => openEvaluationPanel(student)}
                                className="px-3 py-1.5 bg-navy-light hover:bg-navy-hover border border-navy-border text-teal-accent font-semibold rounded-lg transition-colors inline-flex items-center gap-1 hover:text-white"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Evaluate
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Evaluation Control Card */}
          <div className="lg:col-span-1">
            {selectedStudent ? (
              <div className="glass-panel rounded-3xl p-6 relative sticky top-24 animate-fadeIn">
                <h3 className="font-sans font-bold text-white text-base mb-4 flex items-center gap-2 pb-3 border-b border-navy-border/50">
                  <BookOpen className="w-4 h-4 text-teal-accent" />
                  Evaluate Student
                </h3>

                {updateSuccess && (
                  <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-accent text-xs">
                    {updateSuccess}
                  </div>
                )}
                {updateError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    {updateError}
                  </div>
                )}

                {/* Info Block */}
                <div className="p-4 bg-navy-dark/40 border border-navy-border rounded-2xl mb-5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Selection</p>
                  <h4 className="text-white text-base font-extrabold mt-0.5">{selectedStudent.full_name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedStudent.roll_number}</p>
                  
                  {/* File Download block (Database Blob fetcher) */}
                  <div className="mt-4 pt-3 border-t border-navy-border/50 flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Student Resume:</span>
                    {selectedStudent.has_resume ? (
                      <a
                        href={`${API_BASE}/student/resume/${selectedStudent.id}`}
                        className="text-teal-accent hover:underline font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Blob
                      </a>
                    ) : (
                      <span className="text-slate-500 italic">Not Uploaded</span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveEvaluation} className="space-y-4">
                  {/* Aptitude Score */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Aptitude Score (0 - 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={aptitude}
                      onChange={(e) => setAptitude(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                    />
                  </div>

                  {/* Technical Score */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Technical Score (0 - 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={technical}
                      onChange={(e) => setTechnical(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                    />
                  </div>

                  {/* Communication Score */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Communication Score (0 - 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={communication}
                      onChange={(e) => setCommunication(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-sm text-white outline-none"
                    />
                  </div>

                  {/* Verifications Checklist */}
                  <div className="pt-2 pb-2 border-t border-b border-navy-border/50 space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Field Verifications</p>
                    
                    {/* CGPA Verification Checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={cgpaVerified}
                        onChange={(e) => setCgpaVerified(e.target.checked)}
                        className="w-4 h-4 rounded border-navy-border bg-navy-dark text-teal-main focus:ring-0 focus:ring-offset-0"
                      />
                      <div>
                        <span className="text-white font-medium">Verify CGPA</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5">Self reported: {selectedStudent.cgpa}</span>
                      </div>
                    </label>

                    {/* Internship Verification Checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={internshipsVerified}
                        onChange={(e) => setInternshipsVerified(e.target.checked)}
                        className="w-4 h-4 rounded border-navy-border bg-navy-dark text-teal-main focus:ring-0 focus:ring-offset-0"
                      />
                      <div>
                        <span className="text-white font-medium">Verify Internship Count</span>
                        <span className="text-slate-400 text-[10px] block mt-0.5">Self reported: {selectedStudent.internships}</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 bg-teal-main hover:bg-teal-hover text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Evaluation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="border border-navy-border hover:bg-navy-dark text-slate-400 py-2 px-3 rounded-xl text-xs transition-colors"
                    >
                      Close
                    </button>
                  </div>

                </form>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-6 text-center text-slate-500 text-xs italic sticky top-24">
                <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                Select a student from the list to update evaluations, verify achievements, and inspect resumes.
              </div>
            )}
          </div>

        </div>

      </main>

    </div>
  );
};
