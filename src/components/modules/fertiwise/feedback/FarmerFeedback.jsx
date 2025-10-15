import React, { useState } from 'react';
import { fertilizerRecommendations, expertAdvice } from '../fertiWiseData';

const FarmerFeedback = () => {
  const [activeTab, setActiveTab] = useState('discussion');
  const [newQuestion, setNewQuestion] = useState('');
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  // Mock forum discussions
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: 'Best practices for NPK application in rice fields?',
      author: 'farmer_john',
      date: '2025-07-12',
      content: 'I\'ve been using NPK 15-15-15 for my rice fields but I\'m not seeing the expected results. Has anyone tried different ratios with better success?',
      tags: ['NPK', 'Rice', 'Application Methods'],
      replies: [
        {
          id: 1,
          author: 'rice_expert',
          date: '2025-07-13',
          content: 'For rice, I\'ve had better results with NPK 14-14-14 applied in split doses. Try applying 40% before planting, 30% during active tillering, and 30% at panicle initiation stage.'
        },
        {
          id: 2,
          author: 'agro_scientist',
          date: '2025-07-14',
          content: 'Soil testing is crucial before selecting your NPK ratio. Rice typically needs higher nitrogen during vegetative growth and more potassium during grain filling. Consider a soil test and adjust accordingly.'
        }
      ],
      likes: 12
    },
    {
      id: 2,
      title: 'Counterfeit fertilizer warning in Eastern Region',
      author: 'vigilant_farmer',
      date: '2025-07-10',
      content: 'I recently purchased what claimed to be premium urea from a new supplier in the Eastern market. After application, my crops showed signs of nutrient deficiency. Laboratory testing confirmed it contained only 22% nitrogen instead of the claimed 46%. Be cautious when buying from unlisted suppliers!',
      tags: ['Counterfeit', 'Warning', 'Urea'],
      replies: [
        {
          id: 1,
          author: 'extension_officer',
          date: '2025-07-11',
          content: 'Thank you for sharing this alert. Could you provide details about the packaging and branding so others can avoid it? We\'ve recorded similar cases in neighboring regions recently.'
        }
      ],
      likes: 28
    },
    {
      id: 3,
      title: 'Success with bio-fertilizers in vegetable farming',
      author: 'organic_grower',
      date: '2025-07-05',
      content: 'I\'ve been experimenting with bio-fertilizers containing Azotobacter and Phosphobacteria for my vegetable plots. After six months, I\'ve seen a 15% increase in yield while reducing chemical fertilizer usage by 30%. Has anyone else had similar experiences?',
      tags: ['Bio-fertilizer', 'Organic', 'Vegetables'],
      replies: [
        {
          id: 1,
          author: 'sustainable_ag',
          date: '2025-07-06',
          content: 'Yes, I\'ve had similar results with tomatoes and peppers. Which brand are you using? I found that combining bio-fertilizers with vermicompost gives even better results.'
        },
        {
          id: 2,
          author: 'soil_scientist',
          date: '2025-07-07',
          content: 'Bio-fertilizers work best in soils with good organic matter content. They enhance nutrient cycling and improve soil health over time. I recommend continuing with a mixed approach rather than fully replacing chemical fertilizers until your soil biology is well-established.'
        }
      ],
      likes: 19
    }
  ]);

  // Mock frequently asked questions
  const faqs = [
    {
      question: 'How do I verify if my fertilizer is genuine?',
      answer: 'Look for proper labeling including manufacturer details, batch number, and nutrient content. Use the FertiWise QR code scanner to verify authenticity. Check for official certification seals. When in doubt, purchase from certified suppliers listed in our Supplier Mapping section.'
    },
    {
      question: 'When is the best time to apply fertilizer?',
      answer: 'The optimal timing depends on crop type and growth stage. Generally, apply base fertilizers before planting. For nitrogen fertilizers, split applications are recommended: apply at planting, vegetative growth, and before flowering/fruiting. Avoid application before heavy rainfall to prevent nutrient leaching.'
    },
    {
      question: 'How much fertilizer should I apply per hectare?',
      answer: 'Fertilizer rates vary based on crop type, soil fertility, and target yields. Use our Fertilizer Recommendation tool to get personalized recommendations. As a general guideline, follow the 4R principle: Right source, Right rate, Right time, and Right place.'
    },
    {
      question: 'Can I mix different types of fertilizers?',
      answer: 'Some fertilizers can be mixed, while others may react and cause nutrient loss or form insoluble compounds. Never mix calcium-containing fertilizers with phosphates or sulfates. Urea should not be mixed with alkaline fertilizers. When in doubt, apply different fertilizers separately with at least a 7-day interval.'
    },
    {
      question: 'How can I improve fertilizer efficiency?',
      answer: 'Use soil testing to apply only needed nutrients. Practice split applications rather than a single large dose. Use slow-release fertilizers to reduce leaching. Incorporate precision agriculture techniques. Maintain optimal soil pH for better nutrient availability. Add organic matter to improve nutrient retention.'
    }
  ];

  // Handle new discussion submission
  const handleNewDiscussionSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would be sent to a server
    const newPost = {
      id: discussions.length + 1,
      title: newDiscussion.title,
      author: 'current_user',
      date: new Date().toISOString().split('T')[0],
      content: newDiscussion.content,
      tags: newDiscussion.tags.split(',').map(tag => tag.trim()),
      replies: [],
      likes: 0
    };
    
    setDiscussions([newPost, ...discussions]);
    setShowNewPostForm(false);
    setNewDiscussion({ title: '', content: '', tags: '' });
  };

  // Handle new question submission
  const handleNewQuestionSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your question! An expert will respond to you shortly.');
    setNewQuestion('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Farmer Community & Feedback</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'discussion'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Discussion Forum
            </button>
            <button
              onClick={() => setActiveTab('expert')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'expert'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ask an Expert
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              FAQs
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'discussion' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-800">Farmer Discussion Forum</h2>
                <button
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {showNewPostForm ? 'Cancel' : 'Start New Discussion'}
                </button>
              </div>
              
              {showNewPostForm && (
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">New Discussion</h3>
                  
                  <form onSubmit={handleNewDiscussionSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={newDiscussion.title}
                        onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="Topic title"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        required
                        value={newDiscussion.content}
                        onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                        rows={4}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="Share your experience or question..."
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={newDiscussion.tags}
                        onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="e.g. NPK, Rice, Organic"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Post Discussion
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="space-y-6">
                {discussions.map(discussion => (
                  <div key={discussion.id} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-4">
                      <h3 className="text-lg font-medium text-gray-800">{discussion.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Posted by {discussion.author}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(discussion.date)}</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-700">{discussion.content}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {discussion.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex items-center text-sm">
                        <button className="flex items-center text-gray-500 hover:text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {discussion.likes}
                        </button>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">{discussion.replies.length} replies</span>
                      </div>
                    </div>
                    
                    {discussion.replies.length > 0 && (
                      <div className="bg-gray-50 p-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Replies</h4>
                        <div className="space-y-4">
                          {discussion.replies.map(reply => (
                            <div key={reply.id} className="bg-white p-3 rounded-md border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center text-green-800 font-bold">
                                    {reply.author.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="ml-2 text-sm font-medium">{reply.author}</span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(reply.date)}</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <textarea
                            placeholder="Write a reply..."
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            rows={2}
                          ></textarea>
                          <div className="mt-2 flex justify-end">
                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'expert' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Ask an Expert</h2>
                
                <div className="bg-yellow-50 p-4 rounded-md mb-6">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-700">
                      Submit your specific fertilizer questions here. Our team of agricultural experts will respond within 24-48 hours. For urgent issues, please contact the helpline directly at +1-800-FERTIWISE.
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleNewQuestionSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Question</label>
                    <textarea
                      required
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={4}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      placeholder="Enter your question with relevant details like crop type, soil type, and your specific concerns..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Submit Question
                    </button>
                  </div>
                </form>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Recent Expert Advice</h3>
                
                <div className="space-y-4">
                  {expertAdvice.map((advice, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800">{advice.question}</h4>
                        <span className="text-xs text-gray-500">{advice.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{advice.answer}</p>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-green-600">Expert: {advice.expert}</span>
                        <span className="text-xs text-gray-500 ml-2">({advice.expertise})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-md">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer p-4">
                        <h3 className="font-medium text-gray-800">{faq.question}</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-4 pt-0 text-gray-700 text-sm">
                        {faq.answer}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">Can't find what you're looking for?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have additional questions that aren't covered here, feel free to ask our community in the Discussion Forum or submit your specific question to our experts.
                </p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setActiveTab('discussion')}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Go to Discussion Forum
                  </button>
                  <button 
                    onClick={() => setActiveTab('expert')}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Ask an Expert
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Success Stories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex items-center mb-3">
              <div className="bg-green-100 rounded-full h-10 w-10 flex items-center justify-center text-green-800 font-bold">
                M
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Michael T.</h3>
                <p className="text-xs text-gray-500">Rice Farmer, Eastern Region</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "The FertiWise recommendations increased my rice yield by 28% this season. The soil testing and customized fertilizer plan made a huge difference in my harvest quality."
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center text-blue-800 font-bold">
                S
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Sarah N.</h3>
                <p className="text-xs text-gray-500">Vegetable Grower, Western Region</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I used to waste money on counterfeit fertilizers until I started using the authentication system. Now I only buy from verified suppliers and my vegetable production has improved significantly."
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-md">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 rounded-full h-10 w-10 flex items-center justify-center text-purple-800 font-bold">
                J
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">James K.</h3>
                <p className="text-xs text-gray-500">Maize Farmer, Central Region</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "The cost-benefit calculator helped me optimize my fertilizer investment. I reduced my input costs by 15% while maintaining the same yield. This platform has been a game-changer for my farm's profitability."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerFeedback;