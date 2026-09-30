import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

const ExpertConsultation = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [consultationType, setConsultationType] = useState('');
  const [expertId, setExpertId] = useState('');
  const [consultationMethod, setConsultationMethod] = useState('video');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [farmDetails, setFarmDetails] = useState('');
  const [specificConcerns, setSpecificConcerns] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agronomists, setAgronomists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const consultationTypes = ['Fertilizer Management', 'Soil Health', 'Crop Nutrition', 'General Consultation'];

  useEffect(() => {
    let active = true;
    Promise.all([api.agronomists(), api.expertConsultations()])
      .then(([experts, bookings]) => {
        if (!active) return;
        setAgronomists(experts);
        setConsultations(bookings);
        setExpertId((current) => current || (experts.length === 1 ? experts[0].id : ''));
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Consultation data could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle consultation booking
  const handleBookConsultation = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      const consultation = await api.bookExpertConsultation({
        expertId,
        consultationType,
        method: consultationMethod,
        preferredDate,
        preferredTime,
        farmDetails,
        specificConcerns,
      });
      setConsultations((current) => [consultation, ...current]);
      setNotice('Your request has been sent to the agronomist. The booking is pending confirmation.');
      setConsultationType('');
      setPreferredDate('');
      setPreferredTime('');
      setFarmDetails('');
      setSpecificConcerns('');
      setActiveTab('history');
    } catch (requestError) {
      setError(requestError.message || 'Consultation request could not be booked.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Expert Consultation</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('book')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'book'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Book Consultation
            </button>
            <button
              onClick={() => setActiveTab('experts')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'experts'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Our Experts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consultation History
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>}
          {activeTab === 'book' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">Book an Expert Consultation</h2>
                <p className="text-sm text-gray-600">
                  Get personalized advice from agricultural experts specializing in fertilizer management, soil health, and crop nutrition.
                </p>
              </div>
              
              <form onSubmit={handleBookConsultation}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="consultation-type" className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                      <select
                        id="consultation-type"
                        required
                        value={consultationType}
                        onChange={(e) => setConsultationType(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      >
                        <option value="">Select Consultation Type</option>
                        {consultationTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="consultation-expert" className="block text-sm font-medium text-gray-700 mb-1">Agronomist</label>
                      <select id="consultation-expert" required value={expertId} onChange={(event) => setExpertId(event.target.value)} disabled={loading || !agronomists.length} className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 disabled:bg-gray-100">
                        <option value="">{loading ? 'Loading agronomists…' : agronomists.length ? 'Select an agronomist' : 'No agronomists available'}</option>
                        {agronomists.map((expert) => <option key={expert.id} value={expert.id}>{expert.name} · {expert.expertise}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-1">Consultation Method</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <label className="flex items-center">
                          <input required type="radio" name="method" value="video" checked={consultationMethod === 'video'} onChange={(event) => setConsultationMethod(event.target.value)} className="text-green-600 focus:ring-green-500 h-4 w-4" />
                          <span className="ml-2 text-sm text-gray-700">Video Call</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="method" value="audio" checked={consultationMethod === 'audio'} onChange={(event) => setConsultationMethod(event.target.value)} className="text-green-600 focus:ring-green-500 h-4 w-4" />
                          <span className="ml-2 text-sm text-gray-700">Audio Call</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="method" value="inperson" checked={consultationMethod === 'inperson'} onChange={(event) => setConsultationMethod(event.target.value)} className="text-green-600 focus:ring-green-500 h-4 w-4" />
                          <span className="ml-2 text-sm text-gray-700">In Person</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                      <select
                        required
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      >
                        <option value="">Select Time Slot</option>
                        <option value="09:00">09:00 AM - 10:00 AM</option>
                        <option value="10:00">10:00 AM - 11:00 AM</option>
                        <option value="11:00">11:00 AM - 12:00 PM</option>
                        <option value="13:00">01:00 PM - 02:00 PM</option>
                        <option value="14:00">02:00 PM - 03:00 PM</option>
                        <option value="15:00">03:00 PM - 04:00 PM</option>
                        <option value="16:00">04:00 PM - 05:00 PM</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farm Details</label>
                      <textarea
                        required
                        value={farmDetails}
                        onChange={(e) => setFarmDetails(e.target.value)}
                        rows={2}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="Describe your farm - crop types, size, location, etc."
                      ></textarea>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specific Concerns or Questions</label>
                      <textarea
                        required
                        value={specificConcerns}
                        onChange={(e) => setSpecificConcerns(e.target.value)}
                        rows={3}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="What specific fertilizer or soil issues would you like the expert to address?"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Consultation Fee</p>
                      <p className="text-sm text-gray-500">30 minutes: GH₵250 · Booking request only; payment is not collected here.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || loading || !agronomists.length}
                      className={`px-4 py-2 ${
                        isSubmitting || loading || !agronomists.length
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white rounded-md transition-colors`}
                    >
                        {isSubmitting ? 'Sending request…' : 'Request consultation'}
                    </button>
                  </div>
                </form>
            </div>
          )}
          
          {activeTab === 'experts' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">Agronomists</h2>
                <p className="text-sm text-gray-600">Choose an agronomist and request a consultation. Availability is confirmed after your request is reviewed.</p>
              </div>
              {loading ? <p role="status" className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">Loading agronomists…</p> : agronomists.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {agronomists.map((expert) => (
                  <article key={expert.id} className="overflow-hidden rounded-md border border-gray-200">
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-900">{expert.name.charAt(0).toUpperCase()}</div>
                      <div><h3 className="font-semibold text-gray-900">{expert.name}</h3><p className="text-xs text-gray-600">{expert.expertise}</p></div>
                    </div>
                    <div className="p-4"><p className="text-xs text-gray-500">Agronomist · Booking requests accepted</p><button type="button" onClick={() => { setExpertId(expert.id); setActiveTab('book'); }} className="mt-4 w-full rounded-md border border-green-700 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50">Request consultation</button></div>
                  </article>
                ))}
              </div> : <p className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">No agronomist accounts are currently available for booking.</p>}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-2">Your Consultation History</h2>
                <p className="text-sm text-gray-600">View the consultation requests associated with your account.</p>
              </div>
              {loading ? <p role="status" className="rounded-md bg-gray-50 p-6 text-center text-sm text-gray-600">Loading consultation history…</p> : consultations.length ? <div className="space-y-3">
                {consultations.map((consultation) => (
                  <article key={consultation.id} className="rounded-md border border-gray-200">
                    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50 p-4">
                      <div><h3 className="font-semibold text-gray-900">{consultation.consultationType}</h3><p className="mt-1 text-xs text-gray-600">{consultation.expertName} · {formatDate(consultation.preferredDate)} · {consultation.preferredTime}</p></div>
                      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900">{consultation.status}</span>
                    </header>
                    <div className="space-y-2 p-4 text-sm text-gray-700"><p><strong>Method:</strong> {consultation.method === 'inperson' ? 'In person' : consultation.method === 'audio' ? 'Audio call' : 'Video call'}</p><p><strong>Farm:</strong> {consultation.farmDetails}</p><p><strong>Concern:</strong> {consultation.specificConcerns}</p><p className="text-xs text-gray-500">30 minutes · GH₵{consultation.feeAmount} · {consultation.feeCurrency}</p></div>
                  </article>
                ))}
              </div> : <div className="rounded-md bg-gray-50 p-6 text-center"><h3 className="font-medium text-gray-900">No consultation requests yet</h3><p className="mt-1 text-sm text-gray-600">Your agronomist booking requests will appear here.</p></div>}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">Benefits of Expert Consultation</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Personalized Recommendations:</strong> Get advice tailored to your specific soil type, crop, and farming conditions
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Problem Diagnosis:</strong> Identify nutrient deficiencies and soil issues with expert analysis
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Cost Optimization:</strong> Learn strategies to reduce fertilizer costs while maintaining or improving yields
                </span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-800">Long-term Planning:</strong> Develop sustainable fertilizer management plans for multiple seasons
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-800 mb-3">How It Works</h2>
            <ol className="space-y-3">
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  1
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Book a consultation</span> - Select your preferred expert, date and time
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  2
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Prepare your information</span> - Upload soil test results and photos if available
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  3
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Attend the consultation</span> - Connect via video call, audio call or in-person
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  4
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Receive recommendations</span> - Get detailed advice and a written report
                </p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm mr-3">
                  5
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">Follow-up support</span> - Access ongoing assistance and monitoring
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertConsultation;