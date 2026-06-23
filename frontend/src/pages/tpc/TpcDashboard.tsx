import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { 
  Briefcase, Plus, Edit2, Trash2, Megaphone, Newspaper, 
  Check, X, ToggleLeft, ToggleRight, GraduationCap, RefreshCw, AlertTriangle, Download
} from 'lucide-react';

export const TpcDashboard: React.FC = () => {
  const { token, logout, profile } = useAuth();
  
  // Data lists
  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company Form states
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [minCgpa, setMinCgpa] = useState('6.0');
  const [minAptitude, setMinAptitude] = useState('0');
  const [minTechnical, setMinTechnical] = useState('0');
  const [minCommunication, setMinCommunication] = useState('0');
  const [minInternships, setMinInternships] = useState('0');
  const [allowedArrears, setAllowedArrears] = useState('0');
  const [companyStatus, setCompanyStatus] = useState<'Open' | 'Closed'>('Open');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Announcement Form states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSuccess, setAnnSuccess] = useState<string | null>(null);
  const [annError, setAnnError] = useState<string | null>(null);

  // Company News Form states
  const [newsCompany, setNewsCompany] = useState('');
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsSuccess, setNewsSuccess] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleExportReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/tpc/eligibility-report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to generate report.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Eligibility_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Error exporting report.');
    }
  };

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/tpc/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve companies list.');
      }
      const data = await response.json();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setCompaniesLoading(false);
    }
  };

  const resetCompanyForm = () => {
    setIsEditingCompany(false);
    setEditingId(null);
    setCompanyName('');
    setMinCgpa('6.0');
    setMinAptitude('0');
    setMinTechnical('0');
    setMinCommunication('0');
    setMinInternships('0');
    setAllowedArrears('0');
    setCompanyStatus('Open');
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    const payload = {
      name: companyName,
      min_cgpa: parseFloat(minCgpa) || 0.0,
      min_aptitude: parseInt(minAptitude) || 0,
      min_technical: parseInt(minTechnical) || 0,
      min_communication: parseInt(minCommunication) || 0,
      min_internships: parseInt(minInternships) || 0,
      allowed_arrears: parseInt(allowedArrears) || 0,
      status: companyStatus
    };

    try {
      let response;
      if (isEditingCompany && editingId) {
        response = await fetch(`${API_BASE}/tpc/companies/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE}/tpc/companies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Company submission failed.');
      }

      setFormSuccess(isEditingCompany ? 'Company criteria updated!' : 'New company created successfully!');
      resetCompanyForm();
      fetchCompanies();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    }
  };

  const handleEditCompany = (company: any) => {
    setIsEditingCompany(true);
    setEditingId(company.id);
    setCompanyName(company.name);
    setMinCgpa(company.min_cgpa.toString());
    setMinAptitude(company.min_aptitude.toString());
    setMinTechnical(company.min_technical.toString());
    setMinCommunication(company.min_communication.toString());
    setMinInternships(company.min_internships.toString());
    setAllowedArrears(company.allowed_arrears.toString());
    setCompanyStatus(company.status);
    setFormSuccess(null);
    setFormError(null);
  };

  const handleDeleteCompany = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      const response = await fetch(`${API_BASE}/tpc/companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete company.');
      }
      fetchCompanies();
    } catch (err: any) {
      alert(err.message || 'Error deleting company.');
    }
  };

  const handleToggleStatus = async (company: any) => {
    const nextStatus = company.status === 'Open' ? 'Closed' : 'Open';
    try {
      const response = await fetch(`${API_BASE}/tpc/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to toggle status.');
      }
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: nextStatus } : c));
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnSuccess(null);
    setAnnError(null);

    try {
      const response = await fetch(`${API_BASE}/tpc/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: annTitle, content: annContent })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create announcement.');
      }
      setAnnSuccess('Announcement posted to all students successfully!');
      setAnnTitle('');
      setAnnContent('');
    } catch (err: any) {
      setAnnError(err.message || 'Error occurred.');
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsSuccess(null);
    setNewsError(null);

    try {
      const response = await fetch(`${API_BASE}/tpc/company-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: newsCompany,
          title: newsTitle,
          content: newsContent
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to post company news.');
      }
      setNewsSuccess('Company hiring update posted successfully!');
      setNewsCompany('');
      setNewsTitle('');
      setNewsContent('');
    } catch (err: any) {
      setNewsError(err.message || 'Error occurred.');
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
              <span className="text-[10px] uppercase font-bold text-amber-500 block -mt-1 tracking-widest">TP Coordinator Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{profile?.name}</p>
              <p className="text-xs text-slate-400">Placement Coordinator</p>
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Coordinator Admin Console</h2>
            <p className="text-slate-400 text-sm mt-1">
              Configure eligible benchmarks for placement drives, monitor active recuritments, and publish bulletin notices.
            </p>
          </div>
          <button
            onClick={fetchCompanies}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-card border border-navy-border hover:border-teal-accent/30 hover:bg-navy-light text-slate-300 hover:text-white rounded-xl text-xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Companies Table & Management Form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Manage Companies List */}
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sans font-bold text-white text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-accent" />
                  Active Recruiters Directory
                </h3>
                <button onClick={handleExportReport} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-main/20 border border-teal-main/50 hover:bg-teal-main/40 text-teal-accent rounded-xl text-xs transition-all font-semibold">
                  <Download className="w-4 h-4" />
                  Export Eligibility Report
                </button>
              </div>

              {companiesLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-2 border-teal-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center bg-red-500/10 text-red-400 rounded-xl text-xs">{error}</div>
              ) : companies.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No companies configured. Use the form to add one.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-navy-border/60 text-slate-400 font-semibold">
                        <th className="pb-3 pr-2">Company</th>
                        <th className="pb-3 px-2 text-center">Eligibility (CGPA / Evaluation / Interns)</th>
                        <th className="pb-3 px-2 text-center">Arrears</th>
                        <th className="pb-3 px-2 text-center">Category Label</th>
                        <th className="pb-3 px-2 text-center">Recruitment</th>
                        <th className="pb-3 pl-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/30">
                      {companies.map((c) => (
                        <tr key={c.id} className="hover:bg-navy-light/10 transition-colors">
                          <td className="py-3.5 pr-2 font-bold text-white">{c.name}</td>
                          <td className="py-3.5 px-2 text-center font-mono">
                            {c.min_cgpa.toFixed(1)} CGPA / {c.min_aptitude}-{c.min_technical}-{c.min_communication} / {c.min_internships} Int.
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono">{c.allowed_arrears} max</td>
                          <td className="py-3.5 px-2 text-center">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                              c.cluster_type === 'High CGPA + High Aptitude'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : c.cluster_type === 'Technical Skill Focused Companies'
                                  ? 'bg-teal-500/10 text-teal-accent border border-teal-500/20'
                                  : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                            }`}>
                              {c.cluster_type || 'Unclustered'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <button
                              onClick={() => handleToggleStatus(c)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
                                c.status === 'Open'
                                  ? 'bg-teal-500/10 text-teal-accent border-teal-500/30 hover:bg-teal-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                              }`}
                            >
                              {c.status === 'Open' ? (
                                <>
                                  <Check className="w-3 h-3" /> Open
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" /> Closed
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 pl-2 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleCompanySubmit && handleEditCompany(c)}
                                className="p-1.5 hover:bg-navy-light text-slate-400 hover:text-white rounded transition-colors"
                                title="Edit Criteria"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(c.id)}
                                className="p-1.5 hover:bg-navy-light text-slate-400 hover:text-red-400 rounded transition-colors"
                                title="Delete Company"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Company CRUD configuration Form */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-sans font-bold text-white text-base mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-accent" />
                {isEditingCompany ? `Edit Placement Criteria: ${companyName}` : 'Add New Recruiter Profile'}
              </h3>

              {formSuccess && (
                <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-accent text-xs">
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                      placeholder="e.g. Amazon"
                    />
                  </div>

                  {/* Recruitment Status */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hiring Status</label>
                    <select
                      value={companyStatus}
                      onChange={(e) => setCompanyStatus(e.target.value as 'Open' | 'Closed')}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Min CGPA */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Min Aptitude */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Min Aptitude Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={minAptitude}
                      onChange={(e) => setMinAptitude(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Min Technical */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Min Technical Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={minTechnical}
                      onChange={(e) => setMinTechnical(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Min Communication */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Min Comm. Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={minCommunication}
                      onChange={(e) => setMinCommunication(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Internships */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Min Internships Required</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={minInternships}
                      onChange={(e) => setMinInternships(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Allowed Arrears */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Max Allowed Arrears</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={allowedArrears}
                      onChange={(e) => setAllowedArrears(e.target.value)}
                      className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-main hover:bg-teal-hover text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    {isEditingCompany ? 'Update Recruiter' : 'Add Recruiter'}
                  </button>
                  {isEditingCompany && (
                    <button
                      type="button"
                      onClick={resetCompanyForm}
                      className="border border-navy-border hover:bg-navy-dark text-slate-400 py-2.5 px-4 rounded-xl text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>

          {/* Right Side: Announcements & Company news publisher pads */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Announcement Editor Card */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-sans font-bold text-white text-base mb-4 flex items-center gap-2 pb-2 border-b border-navy-border/50">
                <Megaphone className="w-4 h-4 text-amber-500" />
                Publish Announcement
              </h3>

              {annSuccess && (
                <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-accent text-xs">
                  {annSuccess}
                </div>
              )}
              {annError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {annError}
                </div>
              )}

              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Notice Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. TCS Drive Registration Deadline"
                    className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Type details about dates, eligibility requirements, or location..."
                    className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-main hover:bg-teal-hover text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Broadcast Notice
                </button>
              </form>
            </div>

            {/* Company News Editor Card */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-sans font-bold text-white text-base mb-4 flex items-center gap-2 pb-2 border-b border-navy-border/50">
                <Newspaper className="w-4 h-4 text-teal-accent" />
                Publish Company Update
              </h3>

              {newsSuccess && (
                <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-accent text-xs">
                  {newsSuccess}
                </div>
              )}
              {newsError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {newsError}
                </div>
              )}

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Company</label>
                  <input
                    type="text"
                    required
                    value={newsCompany}
                    onChange={(e) => setNewsCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="e.g. Interview Dates Rescheduled"
                    className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Details</label>
                  <textarea
                    required
                    rows={4}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Type details regarding company presentation slides, test syllabus..."
                    className="w-full bg-navy-dark border border-navy-border focus:border-teal-accent/50 rounded-xl py-2 px-3 text-xs text-white outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-main hover:bg-teal-hover text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Publish Update
                </button>
              </form>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
