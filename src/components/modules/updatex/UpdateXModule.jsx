import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';

const trendingTopics = [
  ['#AgriFinance', '2.4K posts', 'Credit and input finance'],
  ['#SoilHealth', '1.8K posts', 'Practical soil improvement'],
  ['#RiceFarming', '1.3K posts', 'Northern crop cycle'],
  ['#FarmersNetwork', '986 posts', 'Community knowledge'],
];

const networkActivity = [
  ['Input delivery confirmed', 'AgriSupply Ghana completed 14 financed farm orders.', '2h ago', 'bg-cyan-500'],
  ['Weather alert shared', 'Rainfall stress guidance was posted for the Kumasi cluster.', '4h ago', 'bg-amber-500'],
  ['New off-taker demand', 'Savanna Foods opened a 120-tonne rice request.', '6h ago', 'bg-emerald-500'],
];

const nearbyFarmers = [
  ['Abdul Karim', 'Rice farmer', 'Tamale', '12 mutual connections'],
  ['Mavis Owusu', 'Vegetable farmer', 'Savelugu', '8 mutual connections'],
  ['Daniel Boateng', 'Cooperative lead', 'Yendi', '5 mutual connections'],
];

const UpdateXModule = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeView, setActiveView] = useState('feed');
  const [postText, setPostText] = useState('');
  const [notice, setNotice] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);
  const [isComposerFocused, setIsComposerFocused] = useState(false);

  useEffect(() => {
    api.posts()
      .then((remotePosts) => {
        setPosts(remotePosts.map((post) => ({ ...post, time: new Date(post.createdAt).toLocaleString(), location: 'Loryi network' })));
      })
      .catch(() => setNotice('Live community data is unavailable.'));
  }, []);

  const role = currentUser?.role || 'farmer';
  const displayRole = role.includes('financial') ? 'Financial partner' : role.split(',')[0];
  const sortedPosts = useMemo(() => [...posts].sort((a, b) => b.id.localeCompare(a.id)), [posts]);

  const publishPost = async (event) => {
    event.preventDefault();
    if (!postText.trim()) return;
    const content = postText.trim();
    try {
      const post = await api.createPost(content);
      setPosts((current) => [{ ...post, time: 'Just now', location: 'Your network' }, ...current]);
    } catch {
      setPosts((current) => [{ id: `ux-${Date.now()}`, author: currentUser?.name || 'Dashboard user', role: displayRole, time: 'Just now', content, likes: 0, comments: 0, location: 'Your network' }, ...current]);
      setNotice('Post saved locally because the community API is unavailable.');
    }
    setPostText('');
    setNotice('Your update was shared with the agricultural network.');
    window.setTimeout(() => setNotice(''), 2500);
  };

  const toggleLike = (postId) => {
    const liked = likedPosts.includes(postId);
    setLikedPosts((current) => liked ? current.filter((id) => id !== postId) : [...current, postId]);
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, likes: post.likes + (liked ? -1 : 1) } : post));
    api.likePost(postId).catch(() => {});
  };

  const startShortcut = (shortcut) => {
    if (shortcut === 'connect') {
      setActiveView('connections');
      setNotice('Nearby farmers are ready to connect.');
      return;
    }

    const prompts = {
      update: 'Field update: ',
      question: 'Agronomy question: ',
      market: 'Market opportunity: ',
    };
    setActiveView('feed');
    setPostText(prompts[shortcut]);
    setIsComposerFocused(true);
    setNotice('Your draft is ready. Add details and share it with the network.');
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-emerald-400/10" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">UpdateX | Agricultural network</p><h1 className="mt-2 text-3xl font-bold">Connect, learn, and grow together</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Share field intelligence, discover market signals, and connect farmers with the people moving agriculture forward.</p></div><span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">Network live</span></div>
        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Network members', '2,480', '+12% this month'], ['Active discussions', '186', 'Across 24 topics'], ['Market updates', '42', 'Verified this week'], ['Your role', displayRole, 'Connected view']].map(([label, value, detail]) => <div key={label} className="rounded-lg border border-slate-700 bg-slate-800 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold capitalize">{value}</p><p className="mt-1 text-xs text-emerald-300">{detail}</p></div>)}</div>
      </section>

      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{notice}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <main className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{[['feed', 'Community feed'], ['trending', 'Trending topics'], ['activity', 'Network activity'], ['connections', 'Nearby farmers']].map(([view, label]) => <button key={view} type="button" onClick={() => setActiveView(view)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeView === view ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>)}</div>

          {activeView === 'feed' && <><form onSubmit={publishPost} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">{currentUser?.name?.charAt(0) || 'U'}</div><div className="flex-1"><textarea autoFocus={isComposerFocused} onFocus={() => setIsComposerFocused(false)} value={postText} onChange={(event) => setPostText(event.target.value)} rows="3" placeholder="Share a farming update, market signal, or question..." className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-slate-500">Posting as <strong className="capitalize text-slate-700">{displayRole}</strong></span><button type="submit" disabled={!postText.trim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Share update</button></div></div></div></form>{sortedPosts.map((post) => <article key={post.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="p-5"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">{post.author.charAt(0)}</div><div><h2 className="text-sm font-semibold text-slate-900">{post.author}</h2><p className="text-xs text-slate-500 capitalize">{post.role} · {post.time} · {post.location}</p></div></div><button type="button" onClick={() => setNotice(`Following ${post.author}.`)} className="text-xs font-semibold text-emerald-700 hover:underline">Follow</button></div><p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{post.content}</p>{post.image && <img src={post.image} alt="Agricultural community update" className="mt-4 h-48 w-full rounded-lg object-cover" />}<div className="mt-4 flex items-center gap-5 border-t border-slate-100 pt-3 text-sm text-slate-500"><button type="button" onClick={() => toggleLike(post.id)} className={likedPosts.includes(post.id) ? 'font-semibold text-rose-600' : 'hover:text-rose-600'}>♥ {post.likes} likes</button><button type="button" onClick={() => setNotice('Comments are ready for this update.')}>◌ {post.comments} comments</button><button type="button" onClick={() => setNotice('Update link copied to your clipboard.')}>↗ Share</button></div></div></article>)}</>}

          {activeView === 'trending' && <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Trending agricultural topics</h2><p className="text-sm text-slate-500">What the network is discussing today</p><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">{trendingTopics.map(([tag, count, detail]) => <button key={tag} type="button" onClick={() => setNotice(`${tag} topic selected.`)} className="rounded-lg border border-slate-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50"><div className="flex items-center justify-between"><span className="font-semibold text-emerald-700">{tag}</span><span className="text-xs font-semibold text-slate-500">{count}</span></div><p className="mt-2 text-sm text-slate-600">{detail}</p></button>)}</div></div>}

          {activeView === 'activity' && <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Network activity</h2><p className="text-sm text-slate-500">Verified events from your agricultural ecosystem</p><div className="mt-5 space-y-4">{networkActivity.map(([title, detail, time, tone]) => <div key={title} className="flex gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} /><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-800">{title}</h3><span className="text-xs text-slate-400">{time}</span></div><p className="mt-1 text-sm leading-5 text-slate-500">{detail}</p></div></div>)}</div></div>}

          {activeView === 'connections' && <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Farmers near your network</h2><p className="text-sm text-slate-500">Build trusted connections with farmers and cooperative leaders in your area.</p><div className="mt-5 space-y-3">{nearbyFarmers.map(([name, role, location, mutuals]) => <div key={name} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">{name.charAt(0)}</div><div><h3 className="text-sm font-semibold text-slate-900">{name}</h3><p className="text-xs text-slate-500">{role} · {location}</p><p className="mt-1 text-xs text-emerald-700">{mutuals}</p></div></div><button type="button" onClick={() => setNotice(`Connection request sent to ${name}.`)} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Connect</button></div>)}</div></div>}
        </main>

        <aside className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Your community shortcuts</h2><div className="mt-4 space-y-3">{[['Share a field update', 'update'], ['Ask an agronomy question', 'question'], ['Post a market opportunity', 'market'], ['Connect with nearby farmers', 'connect']].map(([item, shortcut], index) => <button key={item} type="button" onClick={() => startShortcut(shortcut)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{index + 1}</span>{item}</button>)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Community guidelines</h2><p className="mt-3 text-sm leading-6 text-slate-600">Keep updates practical, respectful, and useful. Verified market, weather, input, and farm information helps the whole network make better decisions.</p><div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">Posts connected to CreditTrack farms can help lenders and off-takers see real production signals.</div></div></aside>
      </div>
    </div>
  );
};

export default UpdateXModule;
