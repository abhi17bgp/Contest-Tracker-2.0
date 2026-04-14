import React from 'react';
import PlatformContests from './PlatformContests';

const CodechefContests = () => {
    return (
        <PlatformContests 
            platformKey="CodeChef"
            pageTitle="Upcoming CodeChef Contests | Starters & Long Challenges"
            metaDescription="View the schedule for CodeChef Starters, Long Challenges, and Cook-offs. Track active and upcoming CodeChef contests."
            h1="CodeChef Contests Schedule"
            subtitle="Keep track of CodeChef's competitive programming schedule so you're always ready to code."
            canonicalUrl="/codechef-contests"
            platformDescription="CodeChef is a vibrant, educational platform specifically focused on nurturing the global programming community. Famous for its frequent 'Starters' contents and deeply engaged user base, CodeChef offers a highly supportive environment for students and beginners entering the competitive coding space. After every contest, detailed editorials are provided allowing you to upskill consistently."
        />
    );
};

export default CodechefContests;
