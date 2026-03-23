import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
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
  ChevronDown, 
  Receipt, 
  Clock, 
  ArrowRight,
  TrendingUp,
  CreditCard
} from "lucide-react"
import { cn } from "../lib/utils"
import Logo from './Logo';

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

const Select = ({ value, onChange, options, placeholder, onFocus, onBlur, className }) => (
  <div className="relative group">
    <select
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        "w-full h-14 px-4 pr-10 rounded-xl bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-green-600 focus:bg-white transition-all outline-none font-medium text-gray-900 appearance-none cursor-pointer",
        className
      )}
      required
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>{opt.name}</option>
      ))}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <ChevronDown size={18} />
    </div>
  </div>
);

export default function EditBillPage() {
  const navigate = useNavigate();
  const { id } = useParams();
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
        const catRes = await api.get('/categories');
        setCategories(catRes.data.categories || []);
        
        const response = await api.get('/bills/dashboard');
        setPeople(response.data.people || []);

        const billRes = await api.get(`/bills/${id}`);
        const bill = billRes.data;
        setFormData({
          amount: bill.amount || "",
          due_date: bill.due_date || "",
          details: bill.details || "",
          category_id: bill.category_id || "",
          person_in_charge_id: bill.person_in_charge_id || "",
        });
      } catch (err) {
        console.error('Error fetching form data:', err);
        setMessage({ text: "Failed to load bill data", type: "error" });
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
      await api.put(`/bills/${id}`, formData);
      setMessage({ text: "Bill updated successfully!", type: "success" });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error updating bill:', err);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to update bill. Please check your inputs.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Loading bill data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;700;900&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 text-sm font-bold transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-gray-100 shadow-xl shadow-gray-200/20">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-700" />
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="mb-6">
                    <div>
                      <h1 className="text-xl font-black text-gray-900 leading-tight">
                        Edit Bill Details
                      </h1>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 leading-relaxed">
                        Update your bill information below
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <FeatureItem icon={ShieldCheck} label="Secure updates" />
                    <FeatureItem icon={CheckCircle2} label="Auto-save validation" />
                    <FeatureItem icon={Clock} label="Real-time sync" />
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                Edit Entry
              </span>
            </div>
            <Card className="border-gray-100 shadow-xl shadow-gray-200/20">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Amount" icon={Banknote} focused={focusedField === "amount"}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                          ₱
                        </span>
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={formData.amount} 
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                          onFocus={() => setFocusedField("amount")} 
                          onBlur={() => setFocusedField(null)} 
                          placeholder="0.00" 
                          className="pl-9 text-lg font-black" 
                          required 
                        />
                      </div>
                    </FormField>

                    <FormField label="Due Date" icon={Calendar} focused={focusedField === "due_date"}>
                      <Input 
                        type="date" 
                        value={formData.due_date} 
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} 
                        onFocus={() => setFocusedField("due_date")} 
                        onBlur={() => setFocusedField(null)} 
                        className="font-bold" 
                        required 
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Category" icon={Layers} focused={focusedField === "category"}>
                      <Select 
                        value={formData.category_id} 
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} 
                        options={categories}
                        placeholder="Select category"
                        onFocus={() => setFocusedField("category")} 
                        onBlur={() => setFocusedField(null)} 
                      />
                    </FormField>

                    <FormField label="Person In-Charge" icon={Users} focused={focusedField === "person"}>
                      <Select 
                        value={formData.person_in_charge_id} 
                        onChange={(e) => setFormData({ ...formData, person_in_charge_id: e.target.value })} 
                        options={people}
                        placeholder="Select member"
                        onFocus={() => setFocusedField("person")} 
                        onBlur={() => setFocusedField(null)} 
                      />
                    </FormField>
                  </div>

                  <FormField label="Description & Details" icon={FileText} focused={focusedField === "details"}>
                    <Textarea 
                      value={formData.details} 
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })} 
                      onFocus={() => setFocusedField("details")} 
                      onBlur={() => setFocusedField(null)} 
                      placeholder="Enter invoice numbers, account details, or special notes..." 
                      rows={4} 
                      className="h-32" 
                      required 
                    />
                  </FormField>

                  {message.text && (
                    <div 
                      className={cn( 
                        "p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm border", 
                        message.type === "success" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-red-50 text-red-700 border-red-100" 
                      )} 
                    > 
                      <div className={cn( 
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", 
                        message.type === "success" ? "bg-emerald-100" : "bg-red-100" 
                      )}> 
                        {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />} 
                      </div> 
                      <span className="text-sm font-bold">{message.text}</span> 
                    </div> 
                  )} 

                  <Button 
                    type="submit" 
                    loading={loading} 
                    size="lg" 
                    className="w-full group" 
                  > 
                    <span className="uppercase tracking-widest">Save Changes</span> 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /> 
                  </Button> 
                </form> 
              </CardContent> 
            </Card> 
          </div> 
        </div> 
      </main> 
    </div> 
  );
}

function FeatureItem({ icon: Icon, label }) { 
  return ( 
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:shadow-sm"> 
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"> 
        <Icon className="w-4 h-4 text-green-700" /> 
      </div> 
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span> 
    </div> 
  ); 
}

function FormField({ label, icon: Icon, focused, children }) { 
  return ( 
    <div className="space-y-3"> 
      <label 
        className={cn( 
          "flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-colors pl-1", 
          focused ? "text-green-600" : "text-gray-400" 
        )} 
      > 
        <Icon className="w-3.5 h-3.5" /> 
        {label} 
      </label> 
      {children} 
    </div> 
  ); 
}
