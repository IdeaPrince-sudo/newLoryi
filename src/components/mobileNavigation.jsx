import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSidebarItems } from '../data/modules';

const MobileNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { currentUser } = useAuth();

  const isActive = (path) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    { key: 'home', name: 'Home', path: '/', module: null, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6' },
    ...getSidebarItems(currentUser)
      .flatMap((section) => section.items)
      .filter((item) => item.path !== '/')
      .map((item) => ({ ...item, module: item.module })),
    { key: 'account', name: 'Account', path: '/account', module: null, icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg md:hidden">
      <div className="flex min-w-max gap-1 overflow-x-auto px-2 py-2">
        {menuItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            aria-current={isActive(item.path) ? 'page' : undefined}
            className={`flex min-w-[68px] flex-col items-center rounded-md px-2 py-1.5 ${isActive(item.path) ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <span className="mt-1 max-w-[76px] truncate text-[11px]">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;