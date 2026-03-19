import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Users, 
    Search, 
    Bell, 
    Mail, 
    ChevronLeft, 
    MoreHorizontal,
    Plus,
    UserPlus,
    Mail as MailIcon,
    Phone,
    ShieldCheck,
    CreditCard,
    ArrowUpRight,
    Star,
    LayoutGrid,
    LayoutList
} from 'lucide-react';

const TeamPage = () => {
    const [people, setPeople] = useState([]);
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const response = await api.get('/bills/dashboard');
                setPeople(response.data.people);
                setBills(response.data.bills);
            } catch (err) {
                console.error('Error fetching team data:', err);
            }
        };

        fetchTeamData();
    }, []);

    const filteredPeople = people.filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPersonStats = (personId) => {
        const personBills = bills.filter(b => b.person_in_charge_id === personId);
        const paidCount = personBills.filter(b => b.status === 'paid').length;
        const totalAmount = personBills.reduce((acc, b) => acc + parseFloat(b.amount), 0);
        return {
            count: personBills.length,
            paid: paidCount,
            total: totalAmount,
            performance: personBills.length > 0 ? Math.round((paidCount / personBills.length) * 100) : 0
        };
    };

    return (
        <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 flex flex-col">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search team members..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-10 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-[10px] font-bold"
                    />
                </div>
                
                <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors relative">
                        <Mail className="text-gray-400" size={16} />
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors relative">
                        <Bell className="text-gray-400" size={16} />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </header>

            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-green-950 mb-1 tracking-tight">Team Management</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Manage your people in-charge and their performance</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="bg-white p-1 rounded-xl border border-green-100 shadow-sm flex items-center">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white' : 'text-gray-400 hover:bg-green-50'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-900 text-white' : 'text-gray-400 hover:bg-green-50'}`}
                        >
                            <LayoutList size={16} />
                        </button>
                    </div>
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-green-800 transition-all shadow-lg shadow-green-900/20">
                        <UserPlus size={16} />
                        Add Member
                    </button>
                </div>
            </div>

            {/* Grid View */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPeople.map((person) => {
                            const stats = getPersonStats(person.id);
                            return (
                                <div key={person.id} className="group bg-white rounded-[2rem] p-6 border border-green-50 shadow-sm hover:border-green-500 hover:shadow-xl hover:shadow-green-900/5 transition-all flex flex-col items-center text-center relative overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-bl-[4rem] -z-0 transition-all group-hover:bg-green-50 group-hover:scale-110"></div>
                                    
                                    <div className="relative z-10 w-full flex flex-col items-center">
                                        <div className="relative mb-4">
                                            <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg overflow-hidden relative">
                                                <img src={person.avatar} className="w-full h-full object-cover" alt={person.name} />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-md">
                                                <ShieldCheck size={14} />
                                            </div>
                                        </div>

                                        <h3 className="font-black text-green-950 text-lg mb-1">{person.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Person In-Charge</p>

                                        <div className="grid grid-cols-2 w-full gap-4 mb-6">
                                            <div className="bg-green-50/50 p-3 rounded-2xl border border-green-50">
                                                <p className="text-[9px] font-black text-green-900/50 uppercase mb-1">Assigned</p>
                                                <p className="text-sm font-black text-green-900">{stats.count}</p>
                                            </div>
                                            <div className="bg-green-50/50 p-3 rounded-2xl border border-green-50">
                                                <p className="text-[9px] font-black text-green-900/50 uppercase mb-1">Performance</p>
                                                <p className="text-sm font-black text-green-900">{stats.performance}%</p>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center gap-2 mb-6">
                                            <button className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl font-bold text-[10px] hover:bg-green-100 transition-all">
                                                <MailIcon size={14} /> Message
                                            </button>
                                            <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
                                                <Phone size={14} />
                                            </button>
                                        </div>

                                        <div className="w-full pt-4 border-t border-green-50 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-[9px] font-black text-green-600 uppercase">Online</span>
                                            </div>
                                            <button className="p-1.5 text-gray-300 hover:text-green-600 transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] border border-green-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] w-full">
                                <thead className="bg-green-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Team Member</th>
                                        <th className="px-6 py-4 text-center">Assigned Bills</th>
                                        <th className="px-6 py-4 text-center">Settled</th>
                                        <th className="px-6 py-4 text-center">Total Value</th>
                                        <th className="px-6 py-4 text-center">Performance</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-50">
                                    {filteredPeople.map((person) => {
                                        const stats = getPersonStats(person.id);
                                        return (
                                            <tr key={person.id} className="hover:bg-green-50/10 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={person.avatar} className="w-10 h-10 rounded-xl border border-green-50 shadow-sm" alt={person.name} />
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-sm">{person.name}</h4>
                                                            <p className="text-[10px] font-medium text-gray-400">Team Member</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-black text-green-950">{stats.count}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-black text-green-600">{stats.paid}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-black text-green-950">₱{stats.total.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="w-20 bg-green-50 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-green-500 h-full" style={{ width: `${stats.performance}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-green-600">{stats.performance}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamPage;
