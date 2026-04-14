import React from 'react';
import PlatformContests from './PlatformContests';

const LeetCodeContests = () => {
    return (
        <PlatformContests 
            platformKey="LeetCode"
            pageTitle="Upcoming LeetCode Contests & Schedule | Contest Tracker"
            metaDescription="Track the latest upcoming and active LeetCode contests, weekly and biweekly. Set reminders and never miss another LeetCode contest."
            h1="LeetCode Contests Schedule"
            subtitle="View ongoing, upcoming, and recently ended contests specifically for LeetCode."
            canonicalUrl="/leetcode-contests"
            platformDescription="LeetCode is arguably the most popular competitive programming and technical interview preparation platform. It hosts Weekly Contests (every Sunday) and Biweekly Contests (every other Saturday). Participating in LeetCode contests is highly recommended for developers preparing for FAANG interviews, as the problems directly mirror the current top technical interview questions and effectively test data structures and algorithms under time pressure."
        />
    );
};

export default LeetCodeContests;
