import React from 'react';
import { Trophy } from 'lucide-react';

const PROGRAMMING_QUOTES = [
    { text: "Code yaad mat karo, logic samjho.", author: "Abhishek Anand" },
    { text: "Har problem ek story hai, bas uska flow pakdo.", author: "Abhishek Anand" },
    { text: "DP tough nahi, thinking missing hai.", author: "Abhishek Anand" },
    { text: "Interview mein syntax nahi, approach select hoti hai.", author: "Abhishek Anand" },
    { text: "Problem ko feel karo, solution khud aayega.", author: "Abhishek Anand" },
    { text: "Brute force shuruaat hai, final answer nahi.", author: "Abhishek Anand" },
    { text: "Questions solve mat karo, patterns dhoondo.", author: "Abhishek Anand" },
    { text: "Confusion clarity ki pehli seedhi hai.", author: "Abhishek Anand" },
    { text: "Agar explain nahi kar pa rahe, toh samjhe nahi ho.", author: "Abhishek Anand" },
    { text: "Story → State → Transition = DP solved.", author: "Abhishek Anand" },
    { text: "Har wrong submission tumhe ek level upar le ja raha hai.", author: "Abhishek Anand" },
    { text: "Rating slow badh rahi hai? Matlab foundation strong ho raha hai.", author: "Abhishek Anand" },
    { text: "Consistency > Talent — roz thoda karo, lekin rukna mat.", author: "Abhishek Anand" },
    { text: "Hard problems tumhe todne nahi, banaane aati hain.", author: "Abhishek Anand" },
    { text: "Ek din tum wahi problem solve karoge jo aaj impossible lag rahi hai — bas lage raho 💯", author: "Abhishek Anand" }
];

const QuoteCard = () => {
    const todayQuote = PROGRAMMING_QUOTES[new Date().getDate() % PROGRAMMING_QUOTES.length];

    return (
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl shadow-lg border border-indigo-500/20 mb-6 p-5 sm:p-6 flex items-center justify-between relative overflow-hidden group">
            {/* Decorative Background Elements */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute left-0 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            
            <div className="flex items-start sm:items-center relative z-10 w-full">
                <div className="bg-white/10 p-3 rounded-xl mr-4 sm:mr-5 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex-1">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-300 mb-1 block opacity-80">Quote of the Day</span>
                    <p className="text-white font-medium italic text-sm sm:text-lg leading-relaxed drop-shadow-md">
                        "{todayQuote.text}"
                    </p>
                    <p className="text-indigo-200 text-xs sm:text-sm font-bold mt-2 uppercase tracking-wider">
                        — {todayQuote.author}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuoteCard;
