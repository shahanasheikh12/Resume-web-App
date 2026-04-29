import { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { supabase } from './supabaseClient';
import { Download, LayoutTemplate, PenTool } from 'lucide-react';
import './index.css';

function App() {
  const [template, setTemplate] = useState('modern'); // 'modern' or 'plain'
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowAuthModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const [data, setData] = useState({
    personal: {
      fullName: 'John Doe',
      jobTitle: 'Software Engineer',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
      address: 'New York, NY',
      summary: 'Passionate software engineer with 5+ years of experience in developing scalable web applications. Strong problem-solving skills and a team player.',
    },
    experience: [
      {
        id: 1,
        company: 'Tech Corp',
        role: 'Senior Developer',
        startDate: 'Jan 2020',
        endDate: 'Present',
        description: 'Led a team of 5 developers to build a modern SaaS platform. Improved performance by 40%.',
      }
    ],
    education: [
      {
        id: 1,
        school: 'University of Technology',
        degree: 'Bachelor of Science in Computer Science',
        startDate: 'Aug 2015',
        endDate: 'May 2019',
        description: 'Graduated with Honors. President of the Coding Club.',
      }
    ],
    projects: [
      {
        id: 1,
        name: 'E-commerce Platform',
        technologies: 'React, Node.js, MongoDB',
        description: 'Built a full-stack e-commerce platform with Stripe integration and real-time inventory management.',
      }
    ],
    skills: 'JavaScript, React, Node.js, Python, SQL, Git',
    achievements: 'Participated in hackathons and technical competitions\nBuilt AI, IoT, and automation-based projects',
  });

  const componentRef = useRef();
  
  const handlePrint = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    
    setIsSaving(true);
    try {
      const element = componentRef.current;
      const originalWidth = element.style.width;
      element.style.width = '800px';

      const opt = {
        margin:       0,
        filename:     `${data.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      element.style.width = originalWidth;

      const fileName = `${session.user.id}/${Date.now()}_resume.pdf`;
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
        });
        
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('resume_data').insert([{
        user_id: session.user.id,
        form_data: data,
        template: template
      }]);
      
      if (dbError) throw dbError;

      window.print();
    } catch (err) {
      console.error("Error saving resume to Supabase:", err);
      alert("An error occurred while saving your resume data: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError('Success! Please check your email for the confirmation link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePersonalChange = (e) => {
    setData({
      ...data,
      personal: { ...data.personal, [e.target.name]: e.target.value }
    });
  };

  const handleExperienceChange = (id, field, value) => {
    const newExp = data.experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setData({ ...data, experience: newExp });
  };

  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { id: Date.now(), company: '', role: '', startDate: '', endDate: '', description: '' }]
    });
  };

  const removeExperience = (id) => {
    setData({
      ...data,
      experience: data.experience.filter(exp => exp.id !== id)
    });
  };

  const handleEducationChange = (id, field, value) => {
    const newEdu = data.education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setData({ ...data, education: newEdu });
  };

  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { id: Date.now(), school: '', degree: '', startDate: '', endDate: '', description: '' }]
    });
  };

  const removeEducation = (id) => {
    setData({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    });
  };

  const handleProjectChange = (id, field, value) => {
    const newProj = data.projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    setData({ ...data, projects: newProj });
  };

  const addProject = () => {
    setData({
      ...data,
      projects: [...data.projects, { id: Date.now(), name: '', technologies: '', description: '' }]
    });
  };

  const removeProject = (id) => {
    setData({
      ...data,
      projects: data.projects.filter(proj => proj.id !== id)
    });
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Resume Builder</h1>
        <p>Create a professional resume in minutes</p>
      </div>

      <div className="form-section">
        <div className="template-selector">
          <div 
            className={`template-option ${template === 'modern' ? 'active' : ''}`}
            onClick={() => setTemplate('modern')}
          >
            <LayoutTemplate size={20} style={{ margin: '0 auto 8px' }} />
            Modern Blue & White
          </div>
          <div 
            className={`template-option ${template === 'plain' ? 'active' : ''}`}
            onClick={() => setTemplate('plain')}
          >
            <PenTool size={20} style={{ margin: '0 auto 8px' }} />
            Plain & Simple
          </div>
        </div>

        <h2 className="section-title">Personal Details</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="fullName" value={data.personal.fullName} onChange={handlePersonalChange} placeholder="John Doe" />
        </div>
        <div className="form-group">
          <label>Job Title</label>
          <input type="text" name="jobTitle" value={data.personal.jobTitle} onChange={handlePersonalChange} placeholder="Software Engineer" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={data.personal.email} onChange={handlePersonalChange} placeholder="john@example.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={data.personal.phone} onChange={handlePersonalChange} placeholder="+1 234 567 8900" />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" name="address" value={data.personal.address} onChange={handlePersonalChange} placeholder="New York, NY" />
        </div>
        <div className="form-group">
          <label>Professional Summary</label>
          <textarea name="summary" value={data.personal.summary} onChange={handlePersonalChange} rows="4" placeholder="Brief overview of your career..."></textarea>
        </div>

        <h2 className="section-title">Education</h2>
        {data.education.map((edu, index) => (
          <div key={edu.id} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>School / University</label>
                <input type="text" value={edu.school} onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)} placeholder="University Name" />
              </div>
              <div className="form-group">
                <label>Degree</label>
                <input type="text" value={edu.degree} onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="text" value={edu.startDate} onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)} placeholder="Aug 2015" />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="text" value={edu.endDate} onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)} placeholder="May 2019" />
              </div>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea value={edu.description} onChange={(e) => handleEducationChange(edu.id, 'description', e.target.value)} rows="2"></textarea>
            </div>
            {data.education.length > 1 && (
              <button className="remove-btn" onClick={() => removeEducation(edu.id)}>Remove Education</button>
            )}
          </div>
        ))}
        <button className="add-btn" onClick={addEducation}>+ Add Education</button>

        <h2 className="section-title">Experience</h2>
        {data.experience.map((exp, index) => (
          <div key={exp.id} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Company</label>
                <input type="text" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} placeholder="Company Name" />
              </div>
              <div className="form-group">
                <label>Role / Title</label>
                <input type="text" value={exp.role} onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} placeholder="Software Developer" />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="text" value={exp.startDate} onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)} placeholder="Jan 2020" />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="text" value={exp.endDate} onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)} placeholder="Present" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={exp.description} onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)} rows="3" placeholder="Describe your responsibilities..."></textarea>
            </div>
            {data.experience.length > 1 && (
              <button className="remove-btn" onClick={() => removeExperience(exp.id)}>Remove Experience</button>
            )}
          </div>
        ))}
        <button className="add-btn" onClick={addExperience}>+ Add Experience</button>

        <h2 className="section-title">Projects</h2>
        {data.projects.map((proj, index) => (
          <div key={proj.id} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" value={proj.name} onChange={(e) => handleProjectChange(proj.id, 'name', e.target.value)} placeholder="E-commerce Website" />
              </div>
              <div className="form-group">
                <label>Technologies Used</label>
                <input type="text" value={proj.technologies} onChange={(e) => handleProjectChange(proj.id, 'technologies', e.target.value)} placeholder="React, Node.js" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={proj.description} onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)} rows="3" placeholder="Describe the project..."></textarea>
            </div>
            {data.projects.length > 1 && (
              <button className="remove-btn" onClick={() => removeProject(proj.id)}>Remove Project</button>
            )}
          </div>
        ))}
        <button className="add-btn" onClick={addProject}>+ Add Project</button>

        <h2 className="section-title">Skills</h2>
        <div className="form-group">
          <label>List your skills (comma separated)</label>
          <textarea 
            value={data.skills} 
            onChange={(e) => setData({...data, skills: e.target.value})} 
            rows="3" 
            placeholder="JavaScript, React, Node.js..."
          ></textarea>
        </div>

        <h2 className="section-title">Achievements & Certifications</h2>
        <div className="form-group">
          <label>List your achievements (one per line)</label>
          <textarea 
            value={data.achievements} 
            onChange={(e) => setData({...data, achievements: e.target.value})} 
            rows="4" 
            placeholder="Participated in hackathons..."
          ></textarea>
        </div>

      </div>

      <div className="preview-section">
        <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{session.user.email}</span>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '12px' }} onClick={handleLogout}>Log Out</button>
              </div>
            ) : null}
          </div>
          <button className="btn btn-primary" onClick={handlePrint} disabled={isSaving}>
            <Download size={18} />
            {isSaving ? 'Saving to Supabase...' : 'Generate & Download Resume'}
          </button>
        </div>
        
        <div className="resume-wrapper">
          <div ref={componentRef} className={`resume-container template-${template}`}>
            {template === 'plain' ? (
              <PlainTemplate data={data} />
            ) : (
              <ModernTemplate data={data} />
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2563eb', fontSize: '1.5rem', fontWeight: 'bold' }}>{isSignUp ? 'Sign Up to Download' : 'Sign In to Download'}</h2>
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
              {authError && <div style={{ color: authError.includes('Success') ? 'green' : 'red', marginBottom: '1rem', fontSize: '14px' }}>{authError}</div>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowAuthModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PlainTemplate = ({ data }) => {
  return (
    <div className="template-plain">
      <h1>{data.personal.fullName}</h1>
      <div className="contact-info">
        {data.personal.address} | {data.personal.phone} | {data.personal.email}
      </div>
      
      <h2>Summary</h2>
      <div className="item-desc">{data.personal.summary}</div>

      <h2>Experience</h2>
      {data.experience.map(exp => (
        <div key={exp.id} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="item-title">{exp.role}</div>
            <div style={{ fontWeight: 'bold' }}>{exp.startDate} - {exp.endDate}</div>
          </div>
          <div className="item-subtitle">{exp.company}</div>
          <div className="item-desc">{exp.description}</div>
        </div>
      ))}

      <h2>Education</h2>
      {data.education.map(edu => (
        <div key={edu.id} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="item-title">{edu.degree}</div>
            <div style={{ fontWeight: 'bold' }}>{edu.startDate} - {edu.endDate}</div>
          </div>
          <div className="item-subtitle">{edu.school}</div>
          {edu.description && <div className="item-desc">{edu.description}</div>}
        </div>
      ))}

      <h2>Skills</h2>
      <div className="item-desc">
        {data.skills}
      </div>

      {data.projects && data.projects.length > 0 && (
        <>
          <h2>Projects</h2>
          {data.projects.map(proj => (
            <div key={proj.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="item-title">{proj.name}</div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{proj.technologies}</div>
              </div>
              <div className="item-desc">{proj.description}</div>
            </div>
          ))}
        </>
      )}

      {data.achievements && (
        <>
          <h2>Achievements & Certifications</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '12px' }}>
            {data.achievements.split('\n').filter(a => a.trim()).map((ach, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{ach}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

const ModernTemplate = ({ data }) => {
  const skillsList = data.skills.split(',').map(s => s.trim()).filter(s => s);
  
  return (
    <div className="template-modern">
      <div className="modern-sidebar">
        <h1>{data.personal.fullName}</h1>
        <div style={{ fontSize: '14px', marginBottom: '2rem', color: '#bfdbfe' }}>
          {data.personal.jobTitle}
        </div>

        <h2>Contact</h2>
        <div className="contact-item">
          <span>📍</span> {data.personal.address}
        </div>
        <div className="contact-item">
          <span>📞</span> {data.personal.phone}
        </div>
        <div className="contact-item">
          <span>✉️</span> {data.personal.email}
        </div>
      </div>

      <div className="modern-main">
        <h2>Summary</h2>
        <div className="modern-item-desc" style={{ marginBottom: '1.5rem', fontSize: '12.5px' }}>
          {data.personal.summary}
        </div>

        <h2>Experience</h2>
        {data.experience.map(exp => (
          <div className="modern-item" key={exp.id}>
            <div className="modern-item-header">
              <div className="modern-item-title">{exp.role}</div>
              <div className="modern-item-date">{exp.startDate} - {exp.endDate}</div>
            </div>
            <div className="modern-item-subtitle">{exp.company}</div>
            <div className="modern-item-desc">{exp.description}</div>
          </div>
        ))}

        <h2>Education</h2>
        {data.education.map(edu => (
          <div className="modern-item" key={edu.id}>
            <div className="modern-item-header">
              <div className="modern-item-title">{edu.degree}</div>
              <div className="modern-item-date">{edu.startDate} - {edu.endDate}</div>
            </div>
            <div className="modern-item-subtitle">{edu.school}</div>
            {edu.description && <div className="modern-item-desc">{edu.description}</div>}
          </div>
        ))}

        <h2>Skills</h2>
        <div className="modern-skills-list" style={{ marginBottom: '1.5rem' }}>
          {skillsList.map((skill, i) => (
            <span key={i} style={{ backgroundColor: '#e2e8f0', color: '#333' }}>{skill}</span>
          ))}
        </div>

        {data.projects && data.projects.length > 0 && (
          <>
            <h2>Projects</h2>
            {data.projects.map(proj => (
              <div className="modern-item" key={proj.id}>
                <div className="modern-item-header">
                  <div className="modern-item-title">{proj.name}</div>
                </div>
                <div className="modern-item-subtitle" style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{proj.technologies}</div>
                <div className="modern-item-desc">{proj.description}</div>
              </div>
            ))}
          </>
        )}

        {data.achievements && (
          <>
            <h2>Achievements & Certifications</h2>
            <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#475569' }}>
              {data.achievements.split('\n').filter(a => a.trim()).map((ach, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{ach}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
