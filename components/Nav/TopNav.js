'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { openAuthMenu } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';

export default function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const auth_id = useSelector((state) => state.main.auth_id);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Create a function to scroll to a section
  const createScrollToFunction = (sectionId) => {
    return () => {
      setIsMenuOpen(false);
      
      if (isHomePage) {
        // If on home page, scroll to the section
        const section = document.getElementById(sectionId);
        if (section) {
          window.scrollTo({
            top: section.offsetTop - 80, // Offset for the nav bar
            behavior: 'smooth'
          });
        }
      } else {
        // If not on home page, navigate to home page with anchor
        window.location.href = `/#${sectionId}`;
      }
    };
  };

  // Create a function to navigate to a page
  const createPageNavigationFunction = (route) => {
    return () => {
      setIsMenuOpen(false);
      router.push(route);
    };
  };
  
  // Function to scroll to bottom nav (contact)
  const scrollToBottomNav = () => {
    setIsMenuOpen(false);
    
    // Find the footer element which contains the BottomNav
    const footer = document.querySelector('footer');
    
    // If footer exists, scroll to it
    if (footer) {
      window.scrollTo({
        top: footer.offsetTop - 80, // Offset for the nav bar
        behavior: 'smooth'
      });
    }
  };
  
  // Account action function
  const accountAction = () => {
    // If user is logged in, go to account page, otherwise open auth menu
    if (auth_id) {
      router.push('/account');
    } else {
      dispatch(openAuthMenu());
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Determine if should be visible: visible when scrolling up or at the top
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      
      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // If we're not on the home page, we need to handle navigation differently
  const isHomePage = pathname === '/';

  // Define navigation items with name and action function
  const navItems = [
    { 
      name: 'Account',
      action: accountAction
    },
    { 
      name: 'Appointments / Our Services',
      action: createScrollToFunction('our-services')
    },
    { 
      name: 'What We Do',
      action: createScrollToFunction('what-we-do')
    },
    { 
      name: 'Focus Areas',
      action: createScrollToFunction('focus-areas')
    },
    { 
      name: 'Our Methods',
      action: createScrollToFunction('our-methods')
    },
    { 
      name: 'Contact',
      action: scrollToBottomNav
    },
    // leave this here for dev purposes
    // { 
    //   name: 'Sanity Check',
    //   action: createPageNavigationFunction('/sanity-check')
    // }
  ];

  return (
    <nav 
      className={`fixed top-0 w-full bg-white shadow-md z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-full-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">BeYou365</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <div className="h-6 w-6 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                <span className={`block h-0.5 w-full bg-current transition duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} fixed top-16 left-0 right-0 bg-white shadow-md z-50`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item, index) => (
            <a
              key={index}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                item.action();
              }}
              className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-gray-100"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}