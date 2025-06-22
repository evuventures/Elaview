import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import { 
  categorizedSpaceTypes, 
  betaCities, 
  trafficEstimates, 
  visibilityOptions, 
  availableFeatures 
} from '../constants/spaceTypes.ts';
import './styles/ListSpacePage.css';

interface ListingFormData {
  // Step 1: Basic Information
  space_type: string;
  title: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  visibility: string;
  width_ft: string;
  height_ft: string;
  daily_foot_traffic: string;
  daily_vehicle_traffic: string;
  
  // Step 2: Photos & Details
  description: string;
  features: string[];
  primary_image: File | null;
  additional_images: File[];
  
  // Step 3: Pricing & Availability
  price_per_day: string;
  minimum_rental_days: string;
  maximum_rental_days: string;
  available_from: string;
  available_until: string;
}

const ListSpacePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<ListingFormData>({
    space_type: '',
    title: '',
    address_line1: '',
    address_line2: '',
    city: Object.keys(betaCities)[0], // Default to first beta city
    state: betaCities[Object.keys(betaCities)[0] as keyof typeof betaCities].state,
    zip_code: '',
    neighborhood: '',
    visibility: '',
    width_ft: '',
    height_ft: '',
    daily_foot_traffic: '',
    daily_vehicle_traffic: '',
    description: '',
    features: [],
    primary_image: null,
    additional_images: [],
    price_per_day: '',
    minimum_rental_days: '1',
    maximum_rental_days: '',
    available_from: '',
    available_until: ''
  });

  // Check authentication
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle city change to update state and reset neighborhood
    if (name === 'city') {
      const selectedCity = betaCities[value as keyof typeof betaCities];
      setFormData(prev => ({
        ...prev,
        [name]: value,
        state: selectedCity?.state || '',
        neighborhood: '' // Reset neighborhood when city changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Convert traffic estimates to numbers for database
      const getTrafficNumber = (estimate: string): number => {
        if (estimate.includes('20,000+')) return 20000;
        if (estimate.includes('15,000')) return 15000;
        if (estimate.includes('10,000')) return 10000;
        if (estimate.includes('5,000')) return 5000;
        if (estimate.includes('1,000')) return 1000;
        return 0;
      };

      // Save as draft with current step data
      const draftData = {
        landlord_id: user.id,
        title: formData.title || 'Untitled Space',
        description: formData.description || 'Draft listing - incomplete',
        type: formData.space_type || 'other',
        status: 'draft',
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zip_code,
        country: 'US',
        neighborhood: formData.neighborhood,
        width_ft: parseFloat(formData.width_ft) || null,
        height_ft: parseFloat(formData.height_ft) || null,
        price_per_day: 0, // Default for draft
        traffic_count_daily: getTrafficNumber(formData.daily_foot_traffic),
        features: formData.features,
        visibility_rating: formData.visibility ? 5 : null, // Default rating based on visibility
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('rental_listings')
        .insert([draftData]);

      if (error) throw error;

      setSuccess('Draft saved successfully!');
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to landlord dashboard
      }, 2000);

    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
    setError('');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean = false) => {
    const files = e.target.files;
    if (!files) return;

    if (isPrimary) {
      setFormData(prev => ({
        ...prev,
        primary_image: files[0]
      }));
    } else {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        additional_images: [...prev.additional_images, ...fileArray]
      }));
    }
  };

  const removeImage = (index: number, isPrimary: boolean = false) => {
    if (isPrimary) {
      setFormData(prev => ({
        ...prev,
        primary_image: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        additional_images: prev.additional_images.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Convert traffic estimates to numbers for database
      const getTrafficNumber = (estimate: string): number => {
        if (estimate.includes('20,000+')) return 20000;
        if (estimate.includes('15,000')) return 15000;
        if (estimate.includes('10,000')) return 10000;
        if (estimate.includes('5,000')) return 5000;
        if (estimate.includes('1,000')) return 1000;
        return 0;
      };

      // Prepare final listing data
      const listingData = {
        landlord_id: user.id,
        title: formData.title || 'Untitled Space',
        description: formData.description || 'No description provided',
        type: formData.space_type || 'other',
        status: 'active', // Published status
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zip_code,
        country: 'US',
        neighborhood: formData.neighborhood,
        width_ft: parseFloat(formData.width_ft) || null,
        height_ft: parseFloat(formData.height_ft) || null,
        price_per_day: parseFloat(formData.price_per_day) || 0,
        minimum_rental_days: parseInt(formData.minimum_rental_days) || 1,
        maximum_rental_days: formData.maximum_rental_days ? parseInt(formData.maximum_rental_days) : null,
        available_from: formData.available_from ? new Date(formData.available_from).toISOString().split('T')[0] : null,
        available_until: formData.available_until ? new Date(formData.available_until).toISOString().split('T')[0] : null,
        traffic_count_daily: getTrafficNumber(formData.daily_foot_traffic),
        features: formData.features,
        visibility_rating: formData.visibility ? 5 : null,
        allows_digital: true,
        allows_physical: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('rental_listings')
        .insert([listingData]);

      if (error) throw error;

      setSuccess('Listing published successfully! Your space is now live and available for booking.');
      setTimeout(() => {
        navigate('/browse'); // Redirect to browse page to see the listing
      }, 3000);

    } catch (err) {
      console.error('Error publishing listing:', err);
      setError('Failed to publish listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get neighborhoods for selected city
  const getNeighborhoodsForCity = () => {
    const cityData = betaCities[formData.city as keyof typeof betaCities];
    return cityData?.neighborhoods || [];
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="list-space-page">
      <button 
        className="back-button"
        onClick={() => navigate('/')}
      >
        ← Back to home
      </button>
      
      {/* Main Content */}
      <div className="list-space-container">
        <div className="page-title-section">
          <h1>List Your Advertising Space</h1>
          <p>Turn your unused building space into revenue with Elaview</p>
        </div>

        {/* Step Indicators */}
        <div className="step-indicators">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number-wrapper">
              <div className="step-number">
                {currentStep > 1 ? '✓' : '1'}
              </div>
            </div>
            <span>Basic Information</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number-wrapper">
              <div className="step-number">
                {currentStep > 2 ? '✓' : '2'}
              </div>
            </div>
            <span>Photos & Details</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number-wrapper">
              <div className="step-number">3</div>
            </div>
            <span>Pricing & Availability</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-container">
          <div className="form-section">
            {currentStep === 1 && (
              <>
                <h2>Basic Information</h2>
                <p>Let's start with the essential details about your advertising space</p>

                {/* Space Type - Enhanced with Categories */}
                <div className="form-group">
                  <label htmlFor="space_type">Space Type</label>
                  <select
                    id="space_type"
                    name="space_type"
                    value={formData.space_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select space type</option>
                    {categorizedSpaceTypes.map(({ category, types }) => (
                      <optgroup key={category} label={category}>
                        {types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <small>Choose the category that best describes your advertising space</small>
                </div>

                {/* Title */}
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="e.g., Downtown Billboard on Main Street, Tech District Digital Display"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                  <small>A clear, descriptive title helps advertisers find your space</small>
                </div>

                {/* Address Section - Updated for Beta Cities */}
                <div className="address-section">
                  <div className="section-row">
                    <div className="form-group flex-2">
                      <label htmlFor="address_line1">Address</label>
                      <input
                        type="text"
                        id="address_line1"
                        name="address_line1"
                        placeholder="Street address"
                        value={formData.address_line1}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="city">City</label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      >
                        {Object.keys(betaCities).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="section-row">
                    <div className="form-group flex-1">
                      <input
                        type="text"
                        id="address_line2"
                        name="address_line2"
                        placeholder="Apt, Suite, Floor (optional)"
                        value={formData.address_line2}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="neighborhood">Neighborhood/District</label>
                      <select
                        id="neighborhood"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select neighborhood</option>
                        {getNeighborhoodsForCity().map(hood => (
                          <option key={hood} value={hood}>{hood}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="visibility">Visibility</label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleInputChange}
                      >
                        <option value="">Select visibility level</option>
                        {visibilityOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="section-row">
                    <div className="form-group flex-1">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        disabled
                        className="disabled-input"
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="zip_code">ZIP Code</label>
                      <input
                        type="text"
                        id="zip_code"
                        name="zip_code"
                        placeholder="ZIP Code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="dimensions-section">
                  <h3>Dimensions</h3>
                  <div className="section-row">
                    <div className="form-group flex-1">
                      <label htmlFor="width_ft">Width</label>
                      <input
                        type="number"
                        id="width_ft"
                        name="width_ft"
                        placeholder="Width"
                        value={formData.width_ft}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group flex-1">
                      <select
                        name="width_unit"
                        value="ft"
                        onChange={handleInputChange}
                      >
                        <option value="ft">ft</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="height_ft">Height</label>
                      <input
                        type="number"
                        id="height_ft"
                        name="height_ft"
                        placeholder="Height"
                        value={formData.height_ft}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="form-group flex-1">
                      <select
                        name="height_unit"
                        value="ft"
                        onChange={handleInputChange}
                      >
                        <option value="ft">ft</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                  </div>
                  <small>Accurate dimensions help advertisers determine if your space fits their needs</small>
                </div>

                {/* Estimated Traffic */}
                <div className="traffic-section">
                  <h3>Estimated Traffic</h3>
                  <div className="section-row">
                    <div className="form-group flex-1">
                      <label htmlFor="daily_foot_traffic">Daily Foot Traffic (estimated)</label>
                      <select
                        id="daily_foot_traffic"
                        name="daily_foot_traffic"
                        value={formData.daily_foot_traffic}
                        onChange={handleInputChange}
                      >
                        <option value="">Select estimate</option>
                        {trafficEstimates.map(estimate => (
                          <option key={estimate} value={estimate}>{estimate}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="daily_vehicle_traffic">Daily Vehicle Traffic (estimated)</label>
                      <select
                        id="daily_vehicle_traffic"
                        name="daily_vehicle_traffic"
                        value={formData.daily_vehicle_traffic}
                        onChange={handleInputChange}
                      >
                        <option value="">Select estimate</option>
                        {trafficEstimates.map(estimate => (
                          <option key={estimate} value={estimate}>{estimate}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <small>Don't worry if you don't have exact numbers. Our AI will help estimate based on location.</small>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2>Photos & Details</h2>
                <p>Add photos and detailed information to make your space more attractive to advertisers</p>

                {/* Primary Image Upload */}
                <div className="form-group">
                  <label htmlFor="primary_image">Primary Photo</label>
                  <div className="image-upload-section">
                    <input
                      type="file"
                      id="primary_image"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="primary_image" className="image-upload-button">
                      <div className="upload-placeholder">
                        {formData.primary_image ? (
                          <div className="image-preview">
                            <img 
                              src={URL.createObjectURL(formData.primary_image)} 
                              alt="Primary"
                              className="preview-image"
                            />
                            <button 
                              type="button"
                              className="remove-image"
                              onClick={(e) => {
                                e.preventDefault();
                                removeImage(0, true);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="upload-prompt">
                            <div className="upload-icon">📷</div>
                            <p>Click to upload primary photo</p>
                            <small>Drag and drop or click to browse</small>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <small>This will be the main photo shown in search results. High-quality photos get more views!</small>
                </div>

                {/* Additional Images Upload */}
                <div className="form-group">
                  <label htmlFor="additional_images">Additional Photos (Optional)</label>
                  <div className="additional-images-section">
                    <input
                      type="file"
                      id="additional_images"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, false)}
                      style={{ display: 'none' }}
                    />
                    
                    <div className="additional-images-grid">
                      {formData.additional_images.map((file, index) => (
                        <div key={index} className="image-preview">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Additional ${index + 1}`}
                            className="preview-image"
                          />
                          <button 
                            type="button"
                            className="remove-image"
                            onClick={() => removeImage(index, false)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      <label htmlFor="additional_images" className="add-more-images">
                        <div className="upload-prompt small">
                          <div className="upload-icon">+</div>
                          <p>Add more photos</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  <small>Add up to 10 additional photos showing different angles and details</small>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your advertising space. Include details about location, visibility, target audience, and any unique features that make it attractive to advertisers."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    required
                  />
                  <small>A detailed description helps advertisers understand the value of your space</small>
                </div>

                {/* Features - Enhanced */}
                <div className="features-section">
                  <h3>Features & Amenities</h3>
                  <p>Select all features that apply to your advertising space</p>
                  <div className="features-grid">
                    {availableFeatures.map(feature => (
                      <label key={feature} className="feature-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                        />
                        <span className="checkmark"></span>
                        <span className="feature-text">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Photo Guidelines */}
                <div className="photo-guidelines">
                  <h3>Photo Guidelines</h3>
                  <div className="guidelines-grid">
                    <div className="guideline">
                      <div className="guideline-icon">📸</div>
                      <h4>High Quality</h4>
                      <p>Use high-resolution images (at least 1200x800px)</p>
                    </div>
                    <div className="guideline">
                      <div className="guideline-icon">☀️</div>
                      <h4>Good Lighting</h4>
                      <p>Take photos during daylight hours for best visibility</p>
                    </div>
                    <div className="guideline">
                      <div className="guideline-icon">📐</div>
                      <h4>Multiple Angles</h4>
                      <p>Show the space from different perspectives</p>
                    </div>
                    <div className="guideline">
                      <div className="guideline-icon">🎯</div>
                      <h4>Context</h4>
                      <p>Include surrounding area to show foot traffic and visibility</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h2>Pricing & Availability</h2>
                <p>Set your pricing and availability to start receiving bookings</p>

                {/* Pricing Section */}
                <div className="pricing-section">
                  <h3>Pricing</h3>
                  <div className="form-group">
                    <label htmlFor="price_per_day">Daily Rate</label>
                    <div className="input-with-unit">
                      <span className="currency">$</span>
                      <input
                        type="number"
                        id="price_per_day"
                        name="price_per_day"
                        placeholder="0.00"
                        value={formData.price_per_day}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                      />
                      <span className="unit">per day</span>
                    </div>
                    <small>Weekly and monthly rates will be automatically calculated with discounts</small>
                  </div>

                  <div className="pricing-preview">
                    <div className="pricing-breakdown">
                      <h4>Pricing Breakdown</h4>
                      <div className="price-row">
                        <span>Daily Rate:</span>
                        <span>${formData.price_per_day || '0.00'}</span>
                      </div>
                      <div className="price-row">
                        <span>Weekly Rate (10% discount):</span>
                        <span>${formData.price_per_day ? (parseFloat(formData.price_per_day) * 7 * 0.9).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="price-row">
                        <span>Monthly Rate (20% discount):</span>
                        <span>${formData.price_per_day ? (parseFloat(formData.price_per_day) * 30 * 0.8).toFixed(2) : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Duration */}
                <div className="rental-duration-section">
                  <h3>Rental Duration</h3>
                  <div className="section-row">
                    <div className="form-group flex-1">
                      <label htmlFor="minimum_rental_days">Minimum Rental Period</label>
                      <select
                        id="minimum_rental_days"
                        name="minimum_rental_days"
                        value={formData.minimum_rental_days}
                        onChange={handleInputChange}
                      >
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="7">1 week</option>
                        <option value="14">2 weeks</option>
                        <option value="30">1 month</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="maximum_rental_days">Maximum Rental Period (Optional)</label>
                      <select
                        id="maximum_rental_days"
                        name="maximum_rental_days"
                        value={formData.maximum_rental_days}
                        onChange={handleInputChange}
                      >
                        <option value="">No maximum</option>
                        <option value="7">1 week</option>
                        <option value="14">2 weeks</option>
                        <option value="30">1 month</option>
                        <option value="90">3 months</option>
                        <option value="180">6 months</option>
                        <option value="365">1 year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="availability-section">
                  <h3>Availability</h3>
                  <div className="section-row">
                    <div className="form-group flex-1">
                      <label htmlFor="available_from">Available From</label>
                      <input
                        type="date"
                        id="available_from"
                        name="available_from"
                        value={formData.available_from}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label htmlFor="available_until">Available Until (Optional)</label>
                      <input
                        type="date"
                        id="available_until"
                        name="available_until"
                        value={formData.available_until}
                        onChange={handleInputChange}
                        min={formData.available_from || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <small>Leave "Available Until" empty if your space is available indefinitely</small>
                </div>

                {/* Revenue Estimate */}
                <div className="revenue-estimate-section">
                  <h3>Revenue Estimate</h3>
                  <div className="estimate-card">
                    <div className="estimate-header">
                      <h4>Monthly Revenue Potential</h4>
                      <div className="estimate-amount">
                        ${formData.price_per_day ? 
                          (parseFloat(formData.price_per_day) * 30 * 0.8 * 0.7).toFixed(0) : '0'
                        }
                      </div>
                    </div>
                    <div className="estimate-breakdown">
                      <div className="estimate-row">
                        <span>Monthly rate:</span>
                        <span>${formData.price_per_day ? (parseFloat(formData.price_per_day) * 30 * 0.8).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="estimate-row">
                        <span>Average occupancy (70%):</span>
                        <span>${formData.price_per_day ? (parseFloat(formData.price_per_day) * 30 * 0.8 * 0.7).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="estimate-note">
                        <small>*Estimate based on similar spaces in your area. Actual results may vary.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </button>
              )}
              
              <button 
                type="button" 
                className="save-draft-btn"
                onClick={handleSaveDraft}
                disabled={loading}
              >
                Save as Draft
              </button>
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  className="continue-btn"
                  onClick={handleContinue}
                  disabled={loading}
                >
                  {currentStep === 2 ? 'Continue to Pricing' : 'Continue to Photos & Details'}
                </button>
              ) : (
                <button 
                  type="button" 
                  className="publish-btn"
                  onClick={handlePublish}
                  disabled={loading}
                >
                  Publish Listing
                </button>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>
        </div>

        {/* Why List Section */}
        <div className="why-list-section">
          <h2>Why List with Elaview?</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-wrapper">
                <div className="benefit-icon">💰</div>
                <h3>Maximize Revenue</h3>
              </div>
              <p>Turn unused space into a steady income stream with competitive market rates.</p>
            </div>
            <div className="benefit">
              <div className="benefit-wrapper">
                <div className="benefit-icon">🎯</div>
                <h3>Targeted Exposure</h3>
              </div>
              <p>Connect with quality advertisers looking specifically for spaces like yours.</p>
            </div>
            <div className="benefit">
              <div className="benefit-wrapper">
                <div className="benefit-icon">📋</div>
                <h3>Simple Process</h3>
              </div>
              <p>We handle the paperwork, payments, and provide support throughout the process.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListSpacePage;