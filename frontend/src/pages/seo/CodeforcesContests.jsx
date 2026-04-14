import React from 'react';
import PlatformContests from './PlatformContests';

const CodeforcesContests = () => {
    return (
        <PlatformContests 
            platformKey="Codeforces"
            pageTitle="Upcoming Codeforces Contests | Schedule & Reminders"
            metaDescription="Check the full Codeforces contest schedule including Rounds, Global Rounds, and Educational Rounds. Get email and push notifications."
            h1="Codeforces Contests Schedule"
            subtitle="Browse all the latest and upcoming Codeforces contests and never miss a rated round again."
            canonicalUrl="/codeforces-contests"
            platformDescription="Codeforces is globally recognized as the premier platform for competitive programming. Created and maintained by ITMO University, it hosts extremely high-quality algorithmic challenges that emphasize deep problem-solving skills and mathematical logic. Contests are usually categorized into divisions (Div 1 to Div 4) allowing coders of all skill levels, from complete beginners to International Grandmasters, to compete on an even playing field."
        />
    );
};

export default CodeforcesContests;
