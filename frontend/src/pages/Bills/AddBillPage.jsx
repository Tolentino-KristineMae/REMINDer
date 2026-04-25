import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Calendar,
  Banknote,
  FileText,
  Layers,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Receipt,
  ChevronDown,
} from "lucide-react"
import { cn } from "../../lib/utils"

// ─── Primitives ──────────────────────────────────────────────────────────────
const Input = ({ className, ...props }) => (
  <input
    {...props}
    className={cn(
      "w-full h-14 lg:h-16 px-5 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300",
      className
    )}
  />
);

const Textarea = ({ className, ...props }) => (
  <textarea
    {...props}
    className={cn(
      "w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-gray-900 resize-none placeholder:text-gray-300",
      className
    )}
  />
);

const SelectField = ({ value, onChange, options, placeholder, onFocus, onBlur, isPerson = false }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full h-14 lg:h-16 px-5 pr-11 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-gray-900 appearance-none cursor-pointer"
      required
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {isPerson ? `${opt.first_name} ${opt.last_name}` : opt.name}
        </option>
      ))}
    </select>
    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

function FormField({ label, icon: Icon, focused, children }) {
  return (
    <div className="space-y-2.5">
      <label className={cn(
        "flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-colors pl-1",
        focused ? "text-green-600" : "text-gray-400"
      )}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}

function FeatureItem({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
        <Icon className="w-4 h-4 text-green-700" />
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AddBillPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [people, setPeople] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    due_date: "",
    details: "",
    category_id: "",
    person_in_charge_id: "",
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await api.get('/bills/create-data');
        setCategories(response.data.categories || []);
        setPeople(response.data.people || []);
      } catch (err) {
        console.error('Error fetching form data:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchFormData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await api.post('/bills', formData);
      setMessage({ text: "Bill created successfully!", type: "success" });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to create bill. Please check your inputs.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-green-600 animate-spin" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">

        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 lg:mb-8 flex items-center gap-2 text-gray-400 hover:text-green-700 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">

          {/* ── Left info panel ── */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="h-1.5 bg-green-900" />
              <div className="p-6 lg:p-8">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-900 mb-6 shadow-inner">
                  <Receipt size={22} className="lg:w-6 lg:h-6" />
                </div>
                <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight tracking-tight mb-1">
                  New Bill Entry
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.18em] leading-relaxed mb-6">
                  Track and manage your expenses
                </p>
                <div className="space-y-3">
                  <FeatureItem icon={ShieldCheck} label="Encrypted Log" />
                  <FeatureItem icon={CheckCircle2} label="Automatic Validation" />
                  <FeatureItem icon={Clock} label="Real-time Sync" />
                </div>
              </div>
            </div>

            {/* Tip card */}
            <div className="bg-gradient-to-br from-green-900 to-emerald-800 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-emerald-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300">Tip</span>
                </div>
                <p className="text-[11px] font-semibold text-white/80 leading-relaxed">
                  Set a due date to get reminders before your bill is overdue.
                </p>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 w-fit mb-5">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Registration Module</span>
            </div>

            <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="p-6 sm:p-8 lg:p-12">
                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">

                  {/* Amount */}
                  <FormField label="Principal Amount" icon={Banknote} focused={focusedField === "amount"}>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl lg:text-2xl pointer-events-none">₱</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        onFocus={() => setFocusedField("amount")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="0.00"
                        className="pl-12 text-xl lg:text-2xl font-black"
                        required
                      />
                    </div>
                  </FormField>

                  {/* Due Date */}
                  <FormField label="Due Date" icon={Calendar} focused={focusedField === "due_date"}>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      onFocus={() => setFocusedField("due_date")}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </FormField>

                  {/* Category & Person */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <FormField label="Category" icon={Layers} focused={focusedField === "category"}>
                      <SelectField
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        options={categories}
                        placeholder="Select category"
                        onFocus={() => setFocusedField("category")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormField>

                    <FormField label="Person In-Charge" icon={Users} focused={focusedField === "person"}>
                      <SelectField
                        value={formData.person_in_charge_id}
                        onChange={(e) => setFormData({ ...formData, person_in_charge_id: e.target.value })}
                        options={people}
                        placeholder="Select member"
                        onFocus={() => setFocusedField("person")}
                        onBlur={() => setFocusedField(null)}
                        isPerson
                      />
                    </FormField>
                  </div>

                  {/* Details */}
                  <FormField label="Description & Details" icon={FileText} focused={focusedField === "details"}>
                    <Textarea
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      onFocus={() => setFocusedField("details")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Invoice numbers, account details, or special notes…"
                      className="h-32 lg:h-40"
                      required
                    />
                  </FormField>

                  {/* Message */}
                  {message.text && (
                    <div className={cn(
                      "p-4 lg:p-5 rounded-2xl flex items-center gap-4 border",
                      message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    )}>
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                        message.type === "success" ? "bg-emerald-100" : "bg-red-100"
                      )}>
                        {message.type === "success"
                          ? <CheckCircle2 size={18} />
                          : <AlertCircle size={18} />}
                      </div>
                      <span className="text-sm font-bold">{message.text}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 lg:h-16 bg-green-900 text-white rounded-[1.5rem] lg:rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] lg:tracking-[0.3em] shadow-2xl shadow-green-900/30 hover:bg-green-800 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <>Save Bill <ArrowRight size={16} strokeWidth={3} /></>
                    }
                  </button>

                </form>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
