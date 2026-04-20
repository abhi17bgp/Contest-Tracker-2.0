import React, { useState, useEffect, useContext } from 'react';
import { Trophy, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import QuoteSubmitModal from '../modals/QuoteSubmitModal';

const QuoteCard = () => {
    const { API_URL } = useContext(AuthContext);
    const [quote, setQuote] = useState({
        text: "Code yaad mat karo, logic samjho.",
        author: "Abhishek Anand"
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDailyQuote = async () => {
            try {
                const res = await axios.get(`${API_URL}/quotes/daily`);
                if (res.data && res.data.text) {
                    setQuote(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch daily quote", err);
            }
        };
        fetchDailyQuote();
    }, [API_URL]);

    return (
        <>
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl shadow-lg border border-indigo-500/20 mb-6 p-5 sm:p-6 flex items-center justify-between relative overflow-hidden group">
                {/* Decorative Background Elements */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                <div className="absolute left-0 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>

                <div className="flex items-start sm:items-center relative z-10 w-full flex-col sm:flex-row gap-4">
                    <div className="flex items-start sm:items-center w-full">
                        <div className="bg-white/10 p-3 rounded-xl mr-4 sm:mr-5 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-300 mb-1 block opacity-80">Quote of the Day</span>
                            <p className="text-white font-medium italic text-sm sm:text-lg leading-relaxed drop-shadow-md">
                                "{quote.text}"
                            </p>
                            <p className="text-indigo-200 text-xs sm:text-sm font-bold mt-2 uppercase tracking-wider">
                                — {quote.author}
                            </p>
                        </div>
                    </div>

                    {/* Submit Quote Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-shrink-0 self-start sm:self-center bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all border border-white/20 shadow-sm whitespace-nowrap"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Submit Quote
                    </button>
                </div>
            </div>

            <QuoteSubmitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default QuoteCard;
