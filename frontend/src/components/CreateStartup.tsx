import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StartupForm {
  title: string;
  description: string;
  owner: string;
  category: string;
  funding_needed: string;
}

const CreateStartup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<StartupForm>({
    title: '',
    description: '',
    owner: '',
    category: 'General',
    funding_needed: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'General',
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'E-commerce',
    'Food & Beverage',
    'Transportation',
    'Energy',
    'Entertainment',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.description.trim() || !form.owner.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const startupData = {
        title: form.title.trim(),
        description: form.description.trim(),
        owner: form.owner.trim(),
        category: form.category,
        funding_needed: form.funding_needed ? parseFloat(form.funding_needed) : undefined
      };

      const response = await fetch('/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(startupData),
      });

      if (!response.ok) {
        throw new Error('Failed to create startup');
      }

      const newStartup = await response.json();
      navigate(`/startup/${newStartup.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="App-main">
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Startups
        </button>
        
        <h2>🚀 Post Your Startup</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Share your innovative idea with potential investors
        </p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Startup Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your startup name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="owner">Founder Name *</label>
            <input
              type="text"
              id="owner"
              name="owner"
              value={form.owner}
              onChange={handleChange}
              className="form-control"
              placeholder="Your name or company name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="form-control"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="funding_needed">Funding Needed (USD)</label>
            <input
              type="number"
              id="funding_needed"
              name="funding_needed"
              value={form.funding_needed}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., 50000"
              min="0"
              step="1000"
            />
            <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
              Leave empty if you're not seeking funding yet
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Startup Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-control"
              placeholder="Describe your startup idea, market opportunity, business model, and what makes it unique..."
              rows={8}
              required
            />
            <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
              Be detailed and compelling - this is what investors will see first
            </small>
          </div>

          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '0.75rem', 
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Post Startup'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto 0', background: '#f8f9fa' }}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>💡 Tips for a Great Startup Post</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', color: '#555' }}>
          <li><strong>Be specific:</strong> Clearly explain what problem you're solving</li>
          <li><strong>Show market potential:</strong> Describe your target market and size</li>
          <li><strong>Highlight uniqueness:</strong> What makes your solution different?</li>
          <li><strong>Include traction:</strong> Any existing users, revenue, or partnerships?</li>
          <li><strong>Be realistic:</strong> Honest about challenges and funding needs</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateStartup;
