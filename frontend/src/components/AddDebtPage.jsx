import React, { useState } from "react"
import { useNavigate } from 'react-router-dom';
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
  ArrowRight
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

export default function AddDebtPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await api.post('/debts', formData);
      setMessage({ text: "Utang added successfully!", type: "success" });
      setTimeout(() => {
        navigate('/utangs');
      }, 1500);
    } catch (err) {
      console.error('Error creating debt:', err);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to add utang. Please check your inputs.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        <button 
          onClick={() => navigate('/utangs')}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-green-700 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Utangs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-gray-100 shadow-xl shadow-gray-200/20">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-700" />
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="mb-6">
                    <h1 className="text-xl font-black text-gray-900 leading-tight">Add New Utang</h1>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 leading-relaxed">
                      Record personal debts and track bayad time
                    </p>
                  </div>
                  <div className="space-y-3">
                    <FeatureItem icon={ShieldCheck} label="Secure record" />
                    <FeatureItem icon={CheckCircle2} label="Easy tracking" />
                    <FeatureItem icon={Clock} label="Bayad alerts" />
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">New Utang</span>
            </div>
            <Card className="border-gray-100 shadow-xl shadow-gray-200/20">
              <CardContent className="p-4 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  <FormField label="Amount" icon={Banknote} focused={focusedField === "amount"}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₱</span>
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

                  <FormField label="Description" icon={FileText} focused={focusedField === "description"}>
                    <Textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                      onFocus={() => setFocusedField("description")} 
                      onBlur={() => setFocusedField(null)} 
                      placeholder="Who do you owe? What is it for?" 
                      rows={4} 
                      className="h-32" 
                      required 
                    />
                  </FormField>

                  {message.text && (
                    <div className={cn(
                      "p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm border", 
                      message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                    )}>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", message.type === "success" ? "bg-emerald-100" : "bg-red-100")}>
                        {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <span className="text-sm font-bold">{message.text}</span>
                    </div>
                  )}

                  <Button type="submit" loading={loading} size="lg" className="w-full group">
                    <span className="uppercase tracking-widest">Save Utang Record</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
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
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"> 
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"> 
        <Icon className="w-4 h-4 text-green-700" /> 
      </div> 
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span> 
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
