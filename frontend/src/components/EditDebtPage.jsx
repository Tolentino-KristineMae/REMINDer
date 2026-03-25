import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
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
  User
} from "lucide-react"
import { cn } from "../lib/utils"

const Card = ({ children, className }) => (
  <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const CardContent = ({ children, className }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
);

const Input = ({ className, ...props }) => (
  <input
    {...props}
    className={cn(
      "w-full h-14 px-4 rounded-xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-medium text-gray-900",
      className
    )}
  />
);

const Textarea = ({ className, ...props }) => (
  <textarea
    {...props}
    className={cn(
      "w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-medium text-gray-900 resize-none",
      className
    )}
  />
);

const Button = ({ children, className, disabled, loading, size = "md", ...props }) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={cn(
      "rounded-xl bg-green-900 text-white font-bold text-sm hover:bg-green-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-900/20",
      size === "lg" ? "h-14 px-8" : "h-12 px-6",
      className
    )}
  >
    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
  </button>
);

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
    description: "",
    is_my_debt: true,
    person_in_charge_id: "",
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const peopleRes = await api.get('/people');
        const peopleData = peopleRes.data?.people || peopleRes.data?.data || (Array.isArray(peopleRes.data) ? peopleRes.data : []);
        setPeople(peopleData);

        const debtRes = await api.get(`/debts`);
        const debt = debtRes.data.debts?.find(d => d.id === parseInt(id)) || debtRes.data.find(d => d.id === parseInt(id));
        
        if (debt) {
          setFormData({
            amount: debt.amount || "",
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

    const payload = {
      amount: formData.amount,
      description: formData.description,
      is_my_debt: formData.is_my_debt,
      person_in_charge_id: formData.person_in_charge_id || null,
    };

    try {
      await api.put(`/debts/${id}`, payload);
      setMessage({ text: "Utang updated successfully!", type: "success" });
      setTimeout(() => {
        navigate('/utangs');
      }, 1500);
    } catch (err) {
      console.error('Error updating debt:', err);
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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Loading debt data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 relative">
        <button 
          onClick={() => navigate('/utangs')}
          className="mb-6 lg:mb-8 flex items-center gap-2 text-gray-400 hover:text-green-700 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Utangs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2rem] lg:rounded-[2.5rem]">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 lg:h-2 bg-green-900" />
                <CardContent className="pt-10 lg:pt-12 pb-8 lg:pb-10 px-6 lg:px-8">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-900 mb-6 lg:mb-8 shadow-inner">
                    <Wallet2 size={24} className="lg:w-8 lg:h-8" />
                  </div>
                  <div className="mb-6 lg:mb-8">
                    <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight tracking-tight">Edit Entry</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 leading-relaxed">
                      Update your personal debt record
                    </p>
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    <FeatureItem icon={ShieldCheck} label="Encrypted Update" />
                    <FeatureItem icon={CheckCircle2} label="Instant Sync" />
                    <FeatureItem icon={Clock} label="History Preserved" />
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-900 text-white w-fit mb-6 lg:mb-8 shadow-xl shadow-blue-900/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Edit Module</span>
            </div>
            
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2rem] lg:rounded-[3rem]">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                  <FormField label="Principal Amount" icon={Banknote} focused={focusedField === "amount"}>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl lg:text-2xl">₱</span>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={formData.amount} 
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                        onFocus={() => setFocusedField("amount")} 
                        onBlur={() => setFocusedField(null)} 
                        placeholder="0.00" 
                        className="pl-14 h-16 lg:h-20 text-xl lg:text-2xl font-black rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-green-900" 
                        required 
                      />
                    </div>
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <FormField label="Person in Charge" icon={User} focused={focusedField === "person_in_charge_id"}>
                      <select 
                        value={formData.person_in_charge_id} 
                        onChange={(e) => setFormData({ ...formData, person_in_charge_id: e.target.value })} 
                        onFocus={() => setFocusedField("person_in_charge_id")} 
                        onBlur={() => setFocusedField(null)} 
                        className="w-full h-16 lg:h-20 px-6 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-green-900 font-black text-sm uppercase tracking-wider outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Person</option>
                        {people.map(person => (
                          <option key={person.id} value={person.id}>
                            {person.first_name} {person.last_name}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400 pl-1">
                        <Wallet2 className="w-3.5 h-3.5" />
                        Type of Record
                      </label>
                      <div 
                        className={cn(
                          "flex items-center gap-4 h-16 lg:h-20 px-6 rounded-2xl border-2 transition-all cursor-pointer group",
                          formData.is_my_debt ? "bg-gray-900 border-gray-900 text-white shadow-xl" : "bg-white border-gray-100 text-gray-900 hover:border-green-900"
                        )}
                        onClick={() => setFormData({ ...formData, is_my_debt: !formData.is_my_debt })}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                          formData.is_my_debt ? "bg-white border-white" : "bg-gray-50 border-gray-200 group-hover:border-green-900"
                        )}>
                          {formData.is_my_debt && <CheckCircle2 size={14} className="text-gray-900" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-wider">{formData.is_my_debt ? "My Utang" : "Owed to Me"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <FormField label="Transaction Description" icon={FileText} focused={focusedField === "description"}>
                    <Textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                      onFocus={() => setFocusedField("description")} 
                      onBlur={() => setFocusedField(null)} 
                      placeholder="Who is this for? Provide context..." 
                      className="h-32 lg:h-40 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-green-900 font-bold p-5 lg:p-6" 
                      required 
                    />
                  </FormField>

                  {message.text && (
                    <div className={cn(
                      "p-5 lg:p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300", 
                      message.type === "success" ? "bg-green-50 text-green-900 border border-green-100" : "bg-red-50 text-red-900 border border-red-100"
                    )}>
                      {message.type === "success" ? <CheckCircle2 size={20} className="lg:w-6 lg:h-6" /> : <AlertCircle size={20} className="lg:w-6 lg:h-6" />}
                      <span className="text-xs lg:text-sm font-black uppercase tracking-tight">{message.text}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 lg:h-20 bg-green-900 text-white rounded-[1.5rem] lg:rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] lg:tracking-[0.3em] shadow-2xl shadow-green-900/40 hover:bg-green-800 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 lg:gap-4 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" /> : (
                      <>
                        Save Changes
                        <ArrowRight size={16} className="lg:w-[18px] lg:h-[18px]" strokeWidth={3} />
                      </>
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  ) 
} 

function FeatureItem({ icon: Icon, label }) { 
  return ( 
    <div className="flex items-center gap-3 p-2.5 lg:p-3 rounded-xl bg-gray-50 border border-gray-100"> 
      <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"> 
        <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-700" /> 
      </div> 
      <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span> 
    </div> 
  ) 
} 

function FormField({ label, icon: Icon, focused, children }) { 
  return ( 
    <div className="space-y-3"> 
      <label className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-colors pl-1", focused ? "text-green-600" : "text-gray-400")}> 
        <Icon className="w-3.5 h-3.5" /> 
        {label} 
      </label> 
      {children} 
    </div> 
  ) 
}
