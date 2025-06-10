import { useState, useEffect } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/AccountQuestionsForm.css';

interface LocationState {
  isFirstTime?: boolean;
  userId?: string;
}

function AccountQuestionsForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [formData, setFormData] = useState({
    business_type: '',
    company_name: '',
    industry: '',
    advertising_budget: '',
    campaign_goals: [] as string[],
    target_audience: '',
    preferred_locations: [] as string[],
    campaign_duration: '',
    previous_experience: '',
    specific_requirements: '',
    contact_preference: 'email'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, arrayField: 'campaign_goals' | 'preferred_locations') => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [arrayField]: checked 
        ? [...prev[arrayField], value]
        : prev[arrayField].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!user) {
      setError('Please sign in to continue.');
      return;
    }

    try {
      // Save the account questions data
      const { error: insertError } = await supabase
        .from('user_account_info')
        .insert([
          {
            user_id: user.id,
            business_type: formData.business_type,
            company_name: formData.company_name || null,
            industry: formData.industry,
            advertising_budget: formData.advertising_budget,
            campaign_goals: formData.campaign_goals,
            target_audience: formData.target_audience,
            preferred_locations: formData.preferred_locations,
            campaign_duration: formData.campaign_duration,
            previous_experience: formData.previous_experience,
            specific_requirements: formData.specific_requirements || null,
            contact_preference: formData.contact_preference,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      // Update user profile to mark onboarding as completed
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
      }

      setSuccess('Account setup completed successfully!');
      
      // Redirect to main dashboard/browse page
      setTimeout(() => {
        navigate('/browse', { replace: true });
      }, 2000);

    } catch (err) {
      console.error('Account questions submission error:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    // Mark onboarding as completed even if skipped
    await supabase
      .from('user_profiles')
      .update({ 
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    navigate('/browse', { replace: true });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-questions-container">
      <div className="form-header">
        <h2>Complete Your Account Setup</h2>
        <p>Help us personalize your advertising experience by answering a few questions about your needs.</p>
      </div>

      <form onSubmit={handleSubmit} className="account-questions-form">
        
        {/* Business Type */}
        <div className="form-group">
          <label htmlFor="business_type">What type of business are you?</label>
          <select
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select business type</option>
            <option value="small_business">Small Business</option>
            <option value="startup">Startup</option>
            <option value="enterprise">Enterprise</option>
            <option value="agency">Marketing Agency</option>
            <option value="nonprofit">Non-profit</option>
            <option value="individual">Individual/Freelancer</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Company Name */}
        <div className="form-group">
          <label htmlFor="company_name">Company/Organization Name (Optional)</label>
          <input
            type="text"
            name="company_name"
            placeholder="Your company name"
            value={formData.company_name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Industry */}
        <div className="form-group">
          <label htmlFor="industry">What industry are you in?</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select industry</option>
            <option value="retail">Retail</option>
            <option value="food_beverage">Food & Beverage</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="real_estate">Real Estate</option>
            <option value="finance">Finance</option>
            <option value="entertainment">Entertainment</option>
            <option value="education">Education</option>
            <option value="automotive">Automotive</option>
            <option value="fashion">Fashion</option>
            <option value="fitness">Fitness & Wellness</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Budget */}
        <div className="form-group">
          <label htmlFor="advertising_budget">What's your monthly advertising budget?</label>
          <select
            name="advertising_budget"
            value={formData.advertising_budget}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select budget range</option>
            <option value="under_1k">Under $1,000</option>
            <option value="1k_5k">$1,000 - $5,000</option>
            <option value="5k_10k">$5,000 - $10,000</option>
            <option value="10k_25k">$10,000 - $25,000</option>
            <option value="25k_50k">$25,000 - $50,000</option>
            <option value="50k_plus">$50,000+</option>
          </select>
        </div>

        {/* Campaign Goals */}
        <div className="form-group">
          <label>What are your main campaign goals? (Select all that apply)</label>
          <div className="checkbox-group">
            {[
              'Brand Awareness',
              'Lead Generation',
              'Sales/Conversions',
              'Event Promotion',
              'Product Launch',
              'Local Community Engagement',
              'Website Traffic'
            ].map(goal => (
              <label key={goal} className="checkbox-label">
                <input
                  type="checkbox"
                  value={goal}
                  checked={formData.campaign_goals.includes(goal)}
                  onChange={(e) => handleCheckboxChange(e, 'campaign_goals')}
                  disabled={isLoading}
                />
                {goal}
              </label>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="form-group">
          <label htmlFor="target_audience">Describe your target audience</label>
          <textarea
            name="target_audience"
            placeholder="e.g., Young professionals aged 25-35, families with children, tourists..."
            value={formData.target_audience}
            onChange={handleChange}
            required
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Preferred Locations */}
        <div className="form-group">
          <label>Which NYC areas are you most interested in? (Select all that apply)</label>
          <div className="checkbox-group">
            {[
              'Manhattan - Midtown',
              'Manhattan - Downtown',
              'Manhattan - Upper East Side',
              'Manhattan - Upper West Side',
              'Brooklyn',
              'Queens',
              'Bronx',
              'Staten Island'
            ].map(location => (
              <label key={location} className="checkbox-label">
                <input
                  type="checkbox"
                  value={location}
                  checked={formData.preferred_locations.includes(location)}
                  onChange={(e) => handleCheckboxChange(e, 'preferred_locations')}
                  disabled={isLoading}
                />
                {location}
              </label>
            ))}
          </div>
        </div>

        {/* Campaign Duration */}
        <div className="form-group">
          <label htmlFor="campaign_duration">How long do you typically run campaigns?</label>
          <select
            name="campaign_duration"
            value={formData.campaign_duration}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select duration</option>
            <option value="1_week">1 week</option>
            <option value="2_4_weeks">2-4 weeks</option>
            <option value="1_3_months">1-3 months</option>
            <option value="3_6_months">3-6 months</option>
            <option value="6_months_plus">6+ months</option>
            <option value="varies">Varies by campaign</option>
          </select>
        </div>

        {/* Previous Experience */}
        <div className="form-group">
          <label htmlFor="previous_experience">Previous outdoor advertising experience</label>
          <select
            name="previous_experience"
            value={formData.previous_experience}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Select experience level</option>
            <option value="first_time">First time</option>
            <option value="some_experience">Some experience</option>
            <option value="experienced">Very experienced</option>
            <option value="expert">Expert/Agency</option>
          </select>
        </div>

        {/* Specific Requirements */}
        <div className="form-group">
          <label htmlFor="specific_requirements">Any specific requirements or questions? (Optional)</label>
          <textarea
            name="specific_requirements"
            placeholder="e.g., need help with design, specific timing requirements, accessibility needs..."
            value={formData.specific_requirements}
            onChange={handleChange}
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Contact Preference */}
        <div className="form-group">
          <label htmlFor="contact_preference">How would you prefer to be contacted?</label>
          <select
            name="contact_preference"
            value={formData.contact_preference}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="text">Text Message</option>
            <option value="app_notification">App Notification</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
          <button type="button" onClick={handleSkip} disabled={isLoading} className="skip-btn">
            Skip for Now
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
}

export default AccountQuestionsForm;