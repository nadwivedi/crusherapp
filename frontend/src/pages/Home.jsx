import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeDayBookPanel from '../components/HomeDayBookPanel';
import Sidebar, { getHomeQuickShortcut, homeQuickShortcuts } from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeShortcutIndex, setActiveShortcutIndex] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('daybook');

  const handleQuickShortcutOpen = (target) => {
    const shortcut = getHomeQuickShortcut(target);
    if (shortcut?.path) {
      navigate(shortcut.path);
      return;
    }

    const currentState = location.state || {};
    navigate('/', {
      replace: true,
      state: {
        ...currentState,
        homeQuickBoulder: target === 'homeQuickBoulder',
        homeQuickSale: target === 'homeQuickSale',
        homeQuickPurchase: target === 'homeQuickPurchase',
        homeQuickPayment: target === 'homeQuickPayment',
        homeQuickReceipt: target === 'homeQuickReceipt',
        homeQuickMaterialUsed: target === 'homeQuickMaterialUsed',
        homeQuickPurchaseReturn: target === 'homeQuickPurchaseReturn',
        homeQuickExpense: target === 'homeQuickExpense'
      }
    });
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (homeQuickShortcuts.length === 0) {
      setActiveShortcutIndex(0);
      return;
    }

    setActiveShortcutIndex((currentIndex) => {
      if (currentIndex < 0) return 0;
      if (currentIndex >= homeQuickShortcuts.length) return homeQuickShortcuts.length - 1;
      return currentIndex;
    });
  }, []);

  useEffect(() => {
    const isTypingTarget = (target) => {
      const tagName = target?.tagName?.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable;
    };

    const isPopupOpen = () => Boolean(document.querySelector('.fixed.inset-0.z-50'));

    const handleKeyDown = (event) => {
      const key = event.key?.toLowerCase();
      const quickShortcutMap = { '6': 'homeQuickExpense' };
      const isMoveDownKey = key === 'arrowdown' && !event.altKey && !event.ctrlKey;
      const isMoveUpKey = key === 'arrowup' && !event.altKey && !event.ctrlKey;

      if (event.defaultPrevented || event.metaKey) return;

      if ((isMoveDownKey || isMoveUpKey || key === 'enter') && !event.altKey) {
        if (isTypingTarget(event.target) || isPopupOpen() || homeQuickShortcuts.length === 0) return;

        if (key === 'enter') {
          event.preventDefault();
          const shortcut = homeQuickShortcuts[activeShortcutIndex] || homeQuickShortcuts[0];
          if (shortcut) {
            handleQuickShortcutOpen(shortcut.stateKey || shortcut.path);
          }
          return;
        }

        event.preventDefault();
        const move = isMoveDownKey ? 1 : -1;
        setActiveShortcutIndex((currentIndex) => {
          const safeIndex = currentIndex >= 0 ? currentIndex : 0;
          return (safeIndex + move + homeQuickShortcuts.length) % homeQuickShortcuts.length;
        });
        return;
      }

      if (event.altKey && quickShortcutMap[key]) {
        if (isTypingTarget(event.target) || isPopupOpen()) return;
        event.preventDefault();
        handleQuickShortcutOpen(quickShortcutMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeShortcutIndex, location.state, navigate]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#020617]">
      <div className="flex flex-col">
        <Navbar 
          onToggleMobileSidebar={() => setMobileSidebarOpen((current) => !current)} 
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <div className="py-0 sm:py-0 lg:py-0">
          <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1.35fr)]">
            <div className="hidden lg:block">
              <Sidebar
                shortcuts={homeQuickShortcuts}
                activeShortcutIndex={activeShortcutIndex}
                onOpenShortcut={handleQuickShortcutOpen}
                onHighlightShortcut={setActiveShortcutIndex}
              />
            </div>

            <div className="min-w-0 p-4 sm:p-6 lg:p-5 xl:p-6">
              <HomeDayBookPanel 
                activeView={activeView}
                setActiveView={setActiveView}
              />
            </div>
          </div>
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close mobile sidebar"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            />
            <div className="absolute inset-y-0 left-0 w-[min(82vw,20rem)] p-3">
              <Sidebar
                shortcuts={homeQuickShortcuts}
                activeShortcutIndex={activeShortcutIndex}
                onOpenShortcut={handleQuickShortcutOpen}
                onHighlightShortcut={setActiveShortcutIndex}
                onClose={() => setMobileSidebarOpen(false)}
                showCloseButton
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
