import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-10 pb-8 mt-auto transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Trophy className="w-6 h-6 mr-2 text-indigo-600 dark:text-yellow-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Contest Tracker</span>
            </div>
            <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm">
              Never miss a competitive programming contest again. We track the top platforms so you can focus on coding and winning.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Platforms
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/codeforces-contests" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">
                  Codeforces Contests
                </Link>
              </li>
              <li>
                <Link to="/leetcode-contests" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">
                  LeetCode Contests
                </Link>
              </li>
              <li>
                <Link to="/codechef-contests" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">
                  CodeChef Contests
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/best-coding-contests" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">
                  Best Coding Platforms
                </Link>
              </li>
              <li>
                <Link to="/how-to-never-miss-contests" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">
                  Never Miss A Contest
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-800">
          <p className="text-center text-sm text-gray-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Contest Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
