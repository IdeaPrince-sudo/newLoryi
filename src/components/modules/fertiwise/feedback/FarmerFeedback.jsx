import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

const normalizeDiscussion = (post) => ({
  ...post,
  title: post.title || 'Community discussion',
  tags: Array.isArray(post.tags) ? post.tags : [],
  replies: Array.isArray(post.replies) ? post.replies : [],
  date: post.createdAt || post.date,
});

const FarmerFeedback = () => {
  const [activeTab, setActiveTab] = useState('discussion');
  const [newQuestion, setNewQuestion] = useState('');
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingTo, setReplyingTo] = useState('');
  const [forumError, setForumError] = useState('');
  const [forumNotice, setForumNotice] = useState('');
  const recentExpertReplies = discussions
    .flatMap((discussion) => discussion.replies
      .filter((reply) => ['agronomist', 'admin'].includes(String(reply.role || '').toLowerCase()))
      .map((reply) => ({
        id: reply.id,
        question: discussion.title,
        answer: reply.content,
        date: reply.createdAt || reply.date,
        expert: reply.author,
        expertise: reply.role,
      })))
    .sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0));

  const loadDiscussions = async () => {
    setLoadingDiscussions(true);
    setForumError('');
    try {
      const posts = await api.posts();
      setDiscussions(posts.map(normalizeDiscussion));
    } catch (requestError) {
      setForumError(requestError.message || 'Community discussions could not be loaded.');
    } finally {
      setLoadingDiscussions(false);
    }
  };

  useEffect(() => { loadDiscussions(); }, []);

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
  const handleNewDiscussionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setForumError('');
    setForumNotice('');
    try {
      const post = await api.createPost({
        title: newDiscussion.title,
        content: newDiscussion.content,
        tags: newDiscussion.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      setDiscussions((current) => [normalizeDiscussion(post), ...current]);
      setShowNewPostForm(false);
      setNewDiscussion({ title: '', content: '', tags: '' });
      setForumNotice('Your discussion has been posted.');
    } catch (requestError) {
      setForumError(requestError.message || 'Your discussion could not be posted.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewQuestionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setForumError('');
    setForumNotice('');
    try {
      const post = await api.createPost({ title: 'Question for an expert', content: newQuestion, tags: ['Ask an Expert', 'FertiWise'] });
      setDiscussions((current) => [normalizeDiscussion(post), ...current]);
      setNewQuestion('');
      setForumNotice('Your question is posted for the community and agricultural experts to respond to.');
    } catch (requestError) {
      setForumError(requestError.message || 'Your question could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId) => {
    const content = String(replyDrafts[postId] || '').trim();
    if (!content) return;
    setReplyingTo(postId);
    setForumError('');
    try {
      const result = await api.replyToPost(postId, content);
      setDiscussions((current) => current.map((post) => String(post.id) === String(postId) ? normalizeDiscussion(result.post) : post));
      setReplyDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (requestError) {
      setForumError(requestError.message || 'Your reply could not be posted.');
    } finally {
      setReplyingTo('');
    }
  };

  const handleLike = async (postId) => {
    try {
      const updatedPost = await api.likePost(postId);
      setDiscussions((current) => current.map((post) => String(post.id) === String(postId) ? normalizeDiscussion(updatedPost) : post));
    } catch (requestError) {
      setForumError(requestError.message || 'The discussion could not be liked.');
    }
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
          {forumError && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{forumError}</p>}
          {forumNotice && <p role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">{forumNotice}</p>}
          {activeTab === 'discussion' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-800">Farmer Discussion Forum</h2>
                <button
                  onClick={() => { setShowNewPostForm(!showNewPostForm); setForumError(''); setForumNotice(''); }}
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
                        maxLength={160}
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
                        maxLength={5000}
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
                        maxLength={160}
                        value={newDiscussion.tags}
                        onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="e.g. NPK, Rice, Organic"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        {submitting ? 'Posting…' : 'Post Discussion'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {loadingDiscussions ? <p role="status" className="rounded-md bg-gray-50 p-8 text-center text-sm text-gray-600">Loading community discussions…</p> : discussions.length === 0 ? <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center"><h3 className="font-medium text-gray-900">No discussions yet</h3><p className="mt-1 text-sm text-gray-600">Start a discussion to ask farmers and agronomists for advice.</p></div> : <div className="space-y-6">
                {discussions.map(discussion => (
                  <div key={discussion.id} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-4">
                      <h3 className="text-lg font-medium text-gray-800">{discussion.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Posted by {discussion.author}{discussion.role ? ` · ${discussion.role}` : ''}</span>
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
                        <button type="button" onClick={() => handleLike(discussion.id)} className="flex items-center text-gray-500 hover:text-green-600" aria-label={`Like discussion, ${discussion.likes || 0} likes`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {discussion.likes}
                        </button>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">{discussion.replies.length} replies</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Replies</h4>
                        {discussion.replies.length > 0 && <div className="space-y-4">
                          {discussion.replies.map(reply => (
                            <div key={reply.id} className="bg-white p-3 rounded-md border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center text-green-800 font-bold">
                                    {reply.author.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="ml-2 text-sm font-medium">{reply.author}</span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(reply.createdAt || reply.date)}</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{reply.content}</p>
                            </div>
                          ))}
                        </div>}
                        
                        <div className="mt-4">
                          <textarea
                            placeholder="Write a reply..."
                            value={replyDrafts[discussion.id] || ''}
                            onChange={(event) => setReplyDrafts((current) => ({ ...current, [discussion.id]: event.target.value }))}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                            rows={2}
                            maxLength={2000}
                          ></textarea>
                          <div className="mt-2 flex justify-end">
                            <button type="button" onClick={() => handleReply(discussion.id)} disabled={replyingTo === discussion.id || !String(replyDrafts[discussion.id] || '').trim()} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                              {replyingTo === discussion.id ? 'Sending…' : 'Reply'}
                            </button>
                          </div>
                        </div>
                      </div>
                  </div>
                ))}
              </div>}
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
                        maxLength={5000}
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
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      {submitting ? 'Submitting…' : 'Submit Question'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Recent Expert Advice</h3>
                
                {recentExpertReplies.length ? <div className="space-y-4">
                  {recentExpertReplies.slice(0, 8).map((advice) => (
                    <div key={advice.id} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex flex-wrap justify-between gap-2">
                        <h4 className="font-medium text-gray-800">{advice.question}</h4>
                        <span className="text-xs text-gray-500">{formatDate(advice.date)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{advice.answer}</p>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-green-600">Expert: {advice.expert}</span>
                        <span className="text-xs text-gray-500 ml-2">({advice.expertise})</span>
                      </div>
                    </div>
                  ))}
                </div> : <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">Agronomist responses to community discussions will appear here.</p>}
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