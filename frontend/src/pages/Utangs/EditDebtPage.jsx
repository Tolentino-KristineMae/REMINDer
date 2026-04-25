import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import {
  Banknote,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Wallet2,
  Users,
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
export default function EditDebtPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [people, setPeople] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    title: "",
    description: "",
    is_my_debt: true,
    person_in_charge_id: "",
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [peopleRes, debtRes] = await Promise.all([
          api.get('/people'),
          api.get('/debts'),
        ]);
        const peopleData = peopleRes.data?.people || peopleRes.data?.data || (Array.isArray(peopleRes.data) ? peopleRes.data : []);
        setPeople(peopleData);

        const debts = debtRes.data?.debts || debtRes.data?.data || (Array.isArray(debtRes.data) ? debtRes.data : []);
        const debt = debts.find(d => d.id === parseInt(id));
        if (debt) {
          setFormData({
            amount: debt.amount || "",
            title: debt.title || debt.description || "",
            description: debt.description || "",
            is_my_debt: debt.is_my_debt ?? true,
            person_in_charge_id: debt.person_in_charge_id || "",
          });
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        setMessage({ text: "Failed to load debt data", type: "error" });
      } finally {
        setFetching(false);
      }
    };
    fetchFormData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await api.put(`/debts/${id}`, {
        amount: formData.amount,
        title: formData.title,
        description: formData.description,
        is_my_debt: formData.is_my_debt,
        person_in_charge_id: formData.person_in_charge_id || null,
      });
      setMessage({ text: "Utang updated successfully!", type: "success" });
      setTimeout(() => navigate('/utangs'), 1500);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update utang. Please check your inputs.',
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
          onClick={() => navigate('/utangs')}
          className="mb-6 lg:mb-8 flex items-center gap-2 text-gray-400 hover:text-green-700 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Utangs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">

          {/* ── Left info panel ── */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="h-1.5 bg-blue-700" />
              <div className="p-6 lg:p-8">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 mb-6 shadow-inner">
                  <Wallet2 size={22} className="lg:w-6 lg:h-6" />
                </div>
                <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight tracking-tight mb-1">
                  Edit Utang
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.18em] leading-relaxed mb-6">
                  Update your personal debt record
                </p>
                <div className="space-y-3">
                  <FeatureItem icon={ShieldCheck} label="Encrypted Update" />
                  <FeatureItem icon={CheckCircle2} label="Instant Sync" />
                  <FeatureItem icon={Clock} label="History Preserved" />
                </div>
              </div>
            </div>

            {/* Tip card */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-blue-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">Note</span>
                </div>
                <p className="text-[11px] font-semibold text-white/80 leading-relaxed">
                  Editing a record won't affect its settlement history or proof attachments.
                </p>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 w-fit mb-5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Edit Module</span>
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

                  {/* Title */}
                  <FormField label="Title" icon={FileText} focused={focusedField === "title"}>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      onFocus={() => setFocusedField("title")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. Lunch money, Rent share, Gadget loan…"
                      required
                    />
                  </FormField>

                  {/* Description */}
                  <FormField label="Description" icon={FileText} focused={focusedField === "description"}>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      onFocus={() => setFocusedField("description")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Who is this for? Any context or notes…"
                      className="h-28 lg:h-36"
                    />
                  </FormField>

                  {/* Person + Type of Record */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                    {/* Person in Charge */}
                    <FormField label="Person in Charge" icon={Users} focused={focusedField === "person_in_charge_id"}>
                      <div className="relative">
                        <select
                          value={formData.person_in_charge_id}
                          onChange={(e) => setFormData({ ...formData, person_in_charge_id: e.target.value })}
                          onFocus={() => setFocusedField("person_in_charge_id")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full h-14 lg:h-16 px-5 pr-11 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                        >
                          <option value="">Select Person</option>
                          {people.map(person => (
                            <option key={person.id} value={person.id}>
                              {person.first_name} {person.last_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </FormField>

                    {/* Type of Record */}
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400 pl-1">
                        <Wallet2 className="w-3.5 h-3.5" />
                        Type of Record
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 h-14 lg:h-16 px-4 rounded-2xl border-2 transition-all cursor-pointer",
                            formData.is_my_debt
                              ? "bg-gray-900 border-gray-900 text-white shadow-xl"
                              : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300"
                          )}
                          onClick={() => setFormData({ ...formData, is_my_debt: true })}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                            formData.is_my_debt ? "border-white bg-white" : "border-gray-300"
                          )}>
                            {formData.is_my_debt && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-wider leading-none">My Utang</p>
                        </div>

                        <div
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 h-14 lg:h-16 px-4 rounded-2xl border-2 transition-all cursor-pointer",
                            !formData.is_my_debt
                              ? "bg-green-900 border-green-900 text-white shadow-xl shadow-green-900/20"
                              : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300"
                          )}
                          onClick={() => setFormData({ ...formData, is_my_debt: false })}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                            !formData.is_my_debt ? "border-white bg-white" : "border-gray-300"
                          )}>
                            {!formData.is_my_debt && <div className="w-2 h-2 rounded-full bg-green-900" />}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-wider leading-none">Owed to Me</p>
                        </div>
                      </div>
                    </div>
                  </div>

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
                      : <>Save Changes <ArrowRight size={16} strokeWidth={3} /></>
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
